// type_checker.js
class TypeChecker {
  constructor(ast) {
    this.ast = ast;
    this.typeAliases = {}; // Symbol table for type aliases.
    this.functionSignatures = {
      // Built-in functions (strict)
      abs: { parameters: [{ kind: "primitive", name: "number" }], returnType: { kind: "primitive", name: "number" } },
      print: { variadic: true },
      push: { parameters: [{ kind: "primitive", name: "any" }, { kind: "primitive", name: "number" }], returnType: { kind: "primitive", name: "number" } },
      pop: { parameters: [{ kind: "primitive", name: "any" }], returnType: { kind: "primitive", name: "any" } },
      // Built-in sample functions with strict types:
      sumNumbers: { parameters: [{ kind: "array", elementType: { kind: "primitive", name: "number" } }], returnType: { kind: "primitive", name: "number" } },
      concatStrings: { parameters: [{ kind: "array", elementType: { kind: "primitive", name: "string" } }], returnType: { kind: "primitive", name: "string" } },
      processMixed: {
        parameters: [{
          kind: "union", types: [
            { kind: "primitive", name: "string" },
            { kind: "array", elementType: { kind: "primitive", name: "number" } }
          ]
        }],
        returnType: { kind: "union", types: [
          { kind: "primitive", name: "string" },
          { kind: "primitive", name: "number" }
        ]}
      }
    };
  }

  resolveType(type) {
    if (type.kind === "alias") {
      const aliasName = type.name;
      if (this.typeAliases[aliasName]) {
        return this.resolveType(this.typeAliases[aliasName]);
      } else {
        throw new Error(`Unknown type alias: ${aliasName}`);
      }
    } else if (type.kind === "array") {
      return { kind: "array", elementType: this.resolveType(type.elementType) };
    } else if (type.kind === "union") {
      return { kind: "union", types: type.types.map(t => this.resolveType(t)) };
    }
    return type;
  }

  getAllowedTypesForPrint(declaredReturnType) {
    const resolved = this.resolveType(declaredReturnType);
    if (resolved.kind === "primitive" && resolved.name === "void") {
      return null;
    }
    if (resolved.kind === "union") {
      return resolved.types;
    }
    return [resolved];
  }

  getArgType(arg) {
    if (arg.type === "Parameter") {
      return this.resolveType(arg.paramType);
    } else if (arg.type === "NumberLiteral") {
      return { kind: "primitive", name: "number" };
    } else if (arg.type === "StringLiteral") {
      return { kind: "primitive", name: "string" };
    } else if (arg.type === "Identifier") {
      return { kind: "primitive", name: "any" };
    }
    throw new Error(`Unknown argument type: ${arg.type}`);
  }

  typeEquals(typeA, typeB) {
    typeA = this.resolveType(typeA);
    typeB = this.resolveType(typeB);
    if (typeA.kind !== typeB.kind) return false;
    if (typeA.kind === "primitive") return typeA.name === typeB.name;
    if (typeA.kind === "array") return this.typeEquals(typeA.elementType, typeB.elementType);
    if (typeA.kind === "union") {
      if (typeA.types.length !== typeB.types.length) return false;
      return typeA.types.every(tA => typeB.types.some(tB => this.typeEquals(tA, tB)));
    }
    return false;
  }

  check() {
    for (const node of this.ast) {
      if (node.type === "TypeAlias") {
        this.typeAliases[node.alias] = node.typeAnnotation;
      }
    }
    for (const node of this.ast) {
      if (node.type === "FunctionDeclaration") {
        this.checkFunction(node);
      }
    }
  }

  // Check function declarations.
  checkFunction(funcNode) {
    const funcName = funcNode.name;
    // Built-in functions are checked against the table.
    if (this.functionSignatures.hasOwnProperty(funcName)) {
      const expected = this.functionSignatures[funcName];
      if (funcName === "print") {
        const allowedTypes = this.getAllowedTypesForPrint(funcNode.returnType);
        if (allowedTypes !== null) {
          if (funcNode.arguments.length < 1) {
            throw new Error(`Function '${funcName}' expects at least 1 parameter but got ${funcNode.arguments.length}.`);
          }
          funcNode.arguments.forEach((arg, index) => {
            const declaredType = this.getArgType(arg);
            const matches = allowedTypes.some(allowed => this.typeEquals(allowed, declaredType));
            if (!matches) {
              throw new Error(`Parameter ${index + 1} of function '${funcName}' should be one of [${allowedTypes.map(t => t.kind === "primitive" ? t.name : JSON.stringify(t)).join(", ")}] but got '${declaredType.name}'.`);
            }
          });
        }
      } else {
        if (!expected.variadic && funcNode.arguments.length !== expected.parameters.length) {
          throw new Error(`Function '${funcName}' expects ${expected.parameters.length} parameter(s) but got ${funcNode.arguments.length}.`);
        }
      }
      // For built-in functions, check the return type.
      if (funcName !== "print" && !this.typeEquals(expected.returnType, funcNode.returnType)) {
        throw new Error(`Function '${funcName}' should return '${expected.returnType.name}' but declared return type is '${funcNode.returnType.kind === "primitive" ? funcNode.returnType.name : JSON.stringify(funcNode.returnType)}'.`);
      }
    } else {
      // For user-defined functions, we check the body.
      // Here we assume that the function body must have at least one return statement.
      if (!funcNode.body) {
        throw new Error(`User-defined function '${funcName}' must have a body.`);
      }
      let inferredReturnType = null;
      // For simplicity, assume there's only one return statement.
      for (const stmt of funcNode.body) {
        if (stmt.type === "ReturnStatement") {
          inferredReturnType = this.getArgType(stmt.expression);
          break;
        }
      }
      if (!inferredReturnType) {
        throw new Error(`User-defined function '${funcName}' has no return statement.`);
      }
      if (!this.typeEquals(inferredReturnType, funcNode.returnType)) {
        throw new Error(`User-defined function '${funcName}' should return '${funcNode.returnType.kind === "primitive" ? funcNode.returnType.name : JSON.stringify(funcNode.returnType)}' but returns a value of type '${inferredReturnType.name}'.`);
      }
    }
  }
}

module.exports = TypeChecker;
