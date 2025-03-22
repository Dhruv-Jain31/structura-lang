class TypeChecker {
  constructor(ast) {
    this.ast = ast;
    this.typeAliases = {}; // Symbol table for type aliases.
    // Predefined function signatures for built-in functions.
    // For print, we derive allowed types from its declared return type.
    this.functionSignatures = {
      abs: { parameters: [{ kind: "primitive", name: "number" }], returnType: { kind: "primitive", name: "number" } },
      print: { variadic: true },
      push: { parameters: [{ kind: "primitive", name: "any" }, { kind: "primitive", name: "number" }], returnType: { kind: "primitive", name: "number" } },
      pop: { parameters: [{ kind: "primitive", name: "any" }], returnType: { kind: "primitive", name: "any" } },
      // Add more built-in signatures as needed.
    };
  }

  // Resolve a type: if it is an alias, replace it with its underlying type.
  resolveType(type) {
    if (type.kind === "alias") {
      const aliasName = type.name;
      if (this.typeAliases[aliasName]) {
        return this.typeAliases[aliasName];
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

  // For print, derive allowed types from its declared return type.
  // If the return type is "void", allow any argument.
  // Otherwise, if it’s a union, allow any of the union types.
  // If a single type, allow only that type.
  getAllowedTypesForPrint(declaredReturnType) {
    const resolved = this.resolveType(declaredReturnType);
    if (resolved.kind === "primitive" && resolved.name === "void") {
      return null; // No checking.
    }
    if (resolved.kind === "union") {
      return resolved.types;
    }
    return [resolved];
  }

  // Helper: Given an argument AST node, determine its type.
  getArgType(arg) {
    if (arg.type === 'Parameter') {
      return this.resolveType(arg.paramType);
    } else if (arg.type === 'NumberLiteral') {
      return { kind: "primitive", name: "number" };
    } else if (arg.type === 'StringLiteral') {
      return { kind: "primitive", name: "string" };
    } else if (arg.type === 'Identifier') {
      // For now, assume identifiers have type 'any'
      return { kind: "primitive", name: "any" };
    } else {
      throw new Error(`Unknown argument type: ${arg.type}`);
    }
  }

  // Compare two structured types.
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

  // Process all AST nodes.
  check() {
    // First, process type aliases to fill our symbol table.
    for (const node of this.ast) {
      if (node.type === 'TypeAlias') {
        // Resolve the alias’s type (it’s already a structured type).
        this.typeAliases[node.alias] = node.typeAnnotation;
      }
    }
    // Now, check functions.
    for (const node of this.ast) {
      if (node.type === 'FunctionDeclaration') {
        this.checkFunction(node);
      }
    }
  }

  checkFunction(funcNode) {
    const funcName = funcNode.name;
    if (this.functionSignatures.hasOwnProperty(funcName)) {
      const expected = this.functionSignatures[funcName];

      if (funcName === 'print') {
        const allowedTypes = this.getAllowedTypesForPrint(funcNode.returnType);
        if (allowedTypes !== null) {
          if (funcNode.arguments.length < 1) {
            throw new Error(
              `Function '${funcName}' expects at least 1 parameter but got ${funcNode.arguments.length}.`
            );
          }
          funcNode.arguments.forEach((arg, index) => {
            const declaredType = this.getArgType(arg);
            const matches = allowedTypes.some(allowed => this.typeEquals(allowed, declaredType));
            if (!matches) {
              throw new Error(
                `Parameter ${index + 1} of function '${funcName}' should be one of [${allowedTypes.map(t => t.kind === "primitive" ? t.name : JSON.stringify(t)).join(", ")}] but got '${declaredType.name}'.`
              );
            }
          });
        }
      } else {
        if (!expected.variadic && funcNode.arguments.length !== expected.parameters.length) {
          throw new Error(
            `Function '${funcName}' expects ${expected.parameters.length} parameter(s) but got ${funcNode.arguments.length}.`
          );
        }
        if (expected.variadic && funcName !== 'print') {
          funcNode.arguments.forEach((arg, index) => {
            const declaredType = this.getArgType(arg);
            const expectedType = expected.parameters[0];
            if (!this.typeEquals(expectedType, declaredType)) {
              throw new Error(
                `Parameter ${index + 1} of function '${funcName}' should be '${expectedType.name}' but got '${declaredType.name}'.`
              );
            }
          });
        }
      }

      if (funcName !== 'print' && !this.typeEquals(expected.returnType, funcNode.returnType)) {
        throw new Error(
          `Function '${funcName}' should return '${expected.returnType.name}' but declared return type is '${funcNode.returnType.kind === "primitive" ? funcNode.returnType.name : JSON.stringify(funcNode.returnType)}'.`
        );
      }
    } else {
      console.warn(`Warning: No type signature defined for function '${funcName}'.`);
    }
  }
}

module.exports = TypeChecker;
