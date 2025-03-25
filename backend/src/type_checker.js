// type_checker.js
class TypeChecker {
  constructor(ast) {
    this.ast = ast;
    this.typeAliases = {}; // Symbol table for type aliases.
    // Predefined function signatures for built‑in functions.
    this.functionSignatures = {
      abs: {
        parameters: [{ kind: "primitive", name: "number" }],
        returnType: { kind: "primitive", name: "number" }
      },
      print: { variadic: true },
      push: {
        parameters: [{ kind: "primitive", name: "any" }, { kind: "primitive", name: "number" }],
        returnType: { kind: "primitive", name: "number" }
      },
      pop: {
        parameters: [{ kind: "primitive", name: "any" }],
        returnType: { kind: "primitive", name: "any" }
      },
      sumNumbers: {
        parameters: [{ kind: "array", elementType: { kind: "primitive", name: "number" } }],
        returnType: { kind: "primitive", name: "number" }
      },
      concatStrings: {
        parameters: [{ kind: "array", elementType: { kind: "primitive", name: "string" } }],
        returnType: { kind: "primitive", name: "string" }
      },
      processMixed: {
        parameters: [{
          kind: "union",
          types: [
            { kind: "primitive", name: "string" },
            { kind: "array", elementType: { kind: "primitive", name: "number" } }
          ]
        }],
        returnType: { 
          kind: "union",
          types: [
            { kind: "primitive", name: "string" },
            { kind: "primitive", name: "number" }
          ]
        }
      }
    };
  }

  // Resolve a type alias to its underlying type.
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

  // For built-in print: derive allowed types from the declared return type.
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

  // getArgType now accepts a context mapping identifiers to types.
  getArgType(arg, context = {}) {
    if (arg.type === "Parameter") {
      // When encountering a Parameter node, return its declared type.
      if (!arg.paramType) {
        throw new Error(`Parameter node for '${arg.name}' is missing its type annotation.`);
      }
      return this.resolveType(arg.paramType);
    } else if (arg.type === "NumberLiteral") {
      return { kind: "primitive", name: "number" };
    } else if (arg.type === "StringLiteral") {
      return { kind: "primitive", name: "string" };
    } else if (arg.type === "Identifier") {
      if (context[arg.name]) {
        return context[arg.name];
      }
      // Fallback: assume 'any'
      return { kind: "primitive", name: "any" };
    } else if (arg.type === "BinaryExpression") {
      const leftType = this.getArgType(arg.left, context);
      const rightType = this.getArgType(arg.right, context);
      if (arg.operator === "+") {
        if (leftType.name === "number" && rightType.name === "number") {
          return { kind: "primitive", name: "number" };
        }
        if (leftType.name === "string" && rightType.name === "string") {
          return { kind: "primitive", name: "string" };
        }
        throw new Error(`Type mismatch in binary expression: cannot add ${leftType.name} and ${rightType.name}.`);
      }
      throw new Error(`Operator '${arg.operator}' not supported in type inference.`);
    }
    throw new Error(`Unsupported expression type: ${arg.type}`);
  }

  // Compare two structured types for equality.
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

  // Check all AST nodes.
  check() {
    // Process type aliases first.
    for (const node of this.ast) {
      if (node.type === "TypeAlias") {
        this.typeAliases[node.alias] = node.typeAnnotation;
      }
    }
    // Then check functions.
    for (const node of this.ast) {
      if (node.type === "FunctionDeclaration") {
        this.checkFunction(node);
      }
    }
  }

  checkFunction(funcNode) {
    const funcName = funcNode.name;
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
              throw new Error(
                `Parameter ${index + 1} of function '${funcName}' should be one of [${allowedTypes
                  .map(t => (t.kind === "primitive" ? t.name : JSON.stringify(t)))
                  .join(", ")}] but got '${declaredType.name}'.`
              );
            }
          });
        }
      } else {
        if (!expected.variadic && funcNode.arguments.length !== expected.parameters.length) {
          throw new Error(`Function '${funcName}' expects ${expected.parameters.length} parameter(s) but got ${funcNode.arguments.length}.`);
        }
      }
      if (funcName !== "print" && !this.typeEquals(expected.returnType, funcNode.returnType)) {
        throw new Error(
          `Function '${funcName}' should return '${expected.returnType.name}' but declared return type is '${funcNode.returnType.kind === "primitive" ? funcNode.returnType.name : JSON.stringify(funcNode.returnType)}'.`
        );
      }
    } else {
      // For user-defined functions, check the body.
      if (!funcNode.body) {
        throw new Error(`User-defined function '${funcName}' must have a body.`);
      }
      // Build a context from function parameters.
      const context = {};
      funcNode.arguments.forEach(param => {
        if (param.type === "Parameter") {
          context[param.name] = this.resolveType(param.paramType);
        }
      });
      // For simplicity, assume the first return statement determines the function's return type.
      let inferredReturnType = null;
      for (const stmt of funcNode.body) {
        if (stmt.type === "ReturnStatement") {
          inferredReturnType = this.getArgType(stmt.expression, context);
          break;
        }
      }
      if (!inferredReturnType) {
        throw new Error(`User-defined function '${funcName}' has no return statement.`);
      }
      if (!this.typeEquals(inferredReturnType, funcNode.returnType)) {
        throw new Error(
          `User-defined function '${funcName}' should return '${funcNode.returnType.kind === "primitive" ? funcNode.returnType.name : JSON.stringify(funcNode.returnType)}' but returns a value of type '${inferredReturnType.name}'.`
        );
      }
    }
  }
}

module.exports = TypeChecker;
