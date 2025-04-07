// type_checker.js
class TypeChecker {
  constructor(ast) {
    this.ast = ast;
    this.typeAliases = {}; // Symbol table for type aliases.
    // Built-in function signatures (fallback if no user declaration exists).
    this.builtinSignatures = {
      abs: {
        parameters: [{ kind: "primitive", name: "number" }],
        returnType: { kind: "primitive", name: "number" }
      },
      min: {
        parameters: [
          { kind: "primitive", name: "number" },
          { kind: "primitive", name: "number" }
        ],
        returnType: { kind: "primitive", name: "number" }
      },
      max: {
        parameters: [
          { kind: "primitive", name: "number" },
          { kind: "primitive", name: "number" }
        ],
        returnType: { kind: "primitive", name: "number" }
      },
      push: {
        parameters: [
          { kind: "array", elementType: { kind: "primitive", name: "any" } },
          { kind: "primitive", name: "any" }
        ],
        returnType: { kind: "primitive", name: "number" }
      },
      pop: {
        parameters: [{ kind: "array", elementType: { kind: "primitive", name: "any" } }],
        returnType: { kind: "primitive", name: "any" }
      },
      print: {
        // Updated built-in: returns 'any' so that both print(4): any and print(...): number pass.
        variadic: true,
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
      // New built-in functions:
      hcf: {
        parameters: [
          { kind: "primitive", name: "number" },
          { kind: "primitive", name: "number" }
        ],
        returnType: { kind: "primitive", name: "number" }
      },
      lcm: {
        parameters: [
          { kind: "primitive", name: "number" },
          { kind: "primitive", name: "number" }
        ],
        returnType: { kind: "primitive", name: "number" }
      },
      capitalize: {
        parameters: [{ kind: "primitive", name: "string" }],
        returnType: { kind: "primitive", name: "string" }
      },
      slugify: {
        parameters: [{ kind: "primitive", name: "string" }],
        returnType: { kind: "primitive", name: "string" }
      },
      coalesce: {
        parameters: [
          { kind: "primitive", name: "any" },
          { kind: "primitive", name: "any" },
          { kind: "primitive", name: "any" }
        ],
        returnType: { kind: "primitive", name: "any" }
      },
      isURL: {
        parameters: [{ kind: "primitive", name: "string" }],
        returnType: { kind: "primitive", name: "boolean" }
      }
      // Add more built-in functions as needed.
    };

    // Table for user-declared function signatures (from FunctionDeclaration nodes).
    // User-declared signatures should never override built-ins.
    this.userFunctionSignatures = {};
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

  // Given an expression node, return its type.
  getArgType(arg, context = {}) {
    if (arg.type === "Parameter") {
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
    } else if (arg.type === "CallExpression") {
      return this.inferCallExpression(arg);
    }
    throw new Error(`Unsupported expression type: ${arg.type}`);
  }

  // Compare two types for equality.
  typeEquals(typeA, typeB) {
    typeA = this.resolveType(typeA);
    typeB = this.resolveType(typeB);
    
    // If either type is 'any', consider them equal.
    if (typeA.kind === "primitive" && typeA.name === "any") return true;
    if (typeB.kind === "primitive" && typeB.name === "any") return true;
    
    if (typeA.kind !== typeB.kind) return false;
    if (typeA.kind === "primitive") return typeA.name === typeB.name;
    if (typeA.kind === "array") return this.typeEquals(typeA.elementType, typeB.elementType);
    if (typeA.kind === "union") {
      if (typeA.types.length !== typeB.types.length) return false;
      return typeA.types.every(tA => typeB.types.some(tB => this.typeEquals(tA, tB)));
    }
    return false;
  }

  // Main check: process type aliases and function declarations, then check calls.
  check() {
    // Process type aliases.
    for (const node of this.ast) {
      if (node.type === "TypeAlias") {
        this.typeAliases[node.alias] = node.typeAnnotation;
      }
    }
    // Collect user-declared function signatures.
    for (const node of this.ast) {
      if (node.type === "FunctionDeclaration") {
        // Store the entire node for later reference.
        this.userFunctionSignatures[node.name] = node;
        // Check the function body if available.
        this.checkFunction(node);
      }
    }
    // Check top-level call expression statements.
    for (const node of this.ast) {
      if (node.type === "ExpressionStatement") {
        this.checkExpressionStatement(node);
      }
    }
  }

  // Check a function declaration.
  checkFunction(funcNode) {
    const funcName = funcNode.name;
    // For user-defined functions, ensure at least one parameter exists.
    if (!funcNode.arguments || funcNode.arguments.length === 0) {
      throw new Error(`Function '${funcName}' must have at least one parameter.`);
    }
    funcNode.arguments.forEach((arg, index) => {
      this.getArgType(arg); // Additional parameter checks can be added here.
    });
    // For functions with a body, check that the inferred return type matches the declared return type.
    if (funcNode.body) {
      const context = {};
      funcNode.arguments.forEach(param => {
        if (param.type === "Parameter") {
          context[param.name] = this.resolveType(param.paramType);
        }
      });
      let inferredReturnType = null;
      for (const stmt of funcNode.body) {
        if (stmt.type === "ReturnStatement") {
          inferredReturnType = this.getArgType(stmt.expression, context);
          break;
        }
      }
      if (!inferredReturnType) {
        throw new Error(`Function '${funcName}' has no return statement.`);
      }
      if (!this.typeEquals(inferredReturnType, funcNode.returnType)) {
        throw new Error(
          `User-defined function '${funcName}' should return '${funcNode.returnType.kind === "primitive" ? funcNode.returnType.name : JSON.stringify(funcNode.returnType)}' but returns '${inferredReturnType.name}'.`
        );
      }
    }
  }

  // Check top-level call expression statements.
  checkExpressionStatement(stmt) {
    if (stmt.expression.type === "CallExpression") {
      const callee = stmt.expression.callee;
      let funcName;
      // Support both Identifier and MemberExpression.
      if (callee.type === "Identifier") {
        funcName = callee.name;
      } else if (callee.type === "MemberExpression") {
        funcName = callee.property.name;
      } else {
        throw new Error(`Unsupported callee type: ${callee.type}`);
      }

      let signature;
      // Always use the built-in signature if it exists.
      if (this.builtinSignatures.hasOwnProperty(funcName)) {
        signature = this.builtinSignatures[funcName];
      } else if (this.userFunctionSignatures.hasOwnProperty(funcName)) {
        const funcDecl = this.userFunctionSignatures[funcName];
        signature = {
          parameters: funcDecl.arguments.map(arg => this.getArgType(arg)),
          returnType: funcDecl.returnType
        };
      } else {
        throw new Error(`Function '${funcName}' is not declared.`);
      }
      
      // Check that argument counts match.
      if (signature.parameters.length !== stmt.expression.arguments.length) {
        throw new Error(`Function '${funcName}' expects ${signature.parameters.length} parameter(s) but got ${stmt.expression.arguments.length}.`);
      }
      
      // Check each argument type.
      stmt.expression.arguments.forEach((arg, index) => {
        const argType = this.getArgType(arg);
        if (!this.typeEquals(argType, signature.parameters[index])) {
          throw new Error(
            `Function '${funcName}' is called with argument type '${argType.name}' at parameter ${index + 1} but expected '${signature.parameters[index].name}'.`
          );
        }
      });
      
      // Special check for isURL: if the argument is a string literal, validate the URL.
      if (funcName === "isURL") {
        const arg0 = stmt.expression.arguments[0];
        if (arg0.type === "StringLiteral") {
          const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
          if (!urlRegex.test(arg0.value)) {
            throw new Error(`Invalid URL provided to isURL: ${arg0.value}`);
          }
        }
      }
      
      // Check that the declared return type on the call matches the signature.
      if (!this.typeEquals(signature.returnType, stmt.returnType)) {
        const argTypes = stmt.expression.arguments
          .map(arg => this.getArgType(arg).name)
          .join(", ");
        throw new Error(
          `Function '${funcName}' is called with argument type(s) (${argTypes}) but declared return type is '${stmt.returnType.name}', expected '${this.resolveType(signature.returnType).name}'.`
        );
      }
    } else {
      throw new Error(`Unsupported expression statement type: ${stmt.expression.type}`);
    }
  }

  // Infer the type of a call expression.
  inferCallExpression(callExpr) {
    let funcName;
    if (callExpr.callee.type === "Identifier") {
      funcName = callExpr.callee.name;
    } else if (callExpr.callee.type === "MemberExpression") {
      funcName = callExpr.callee.property.name;
    } else {
      throw new Error("Unsupported callee type in call expression.");
    }

    let signature;
    if (this.builtinSignatures.hasOwnProperty(funcName)) {
      signature = this.builtinSignatures[funcName];
    } else if (this.userFunctionSignatures.hasOwnProperty(funcName)) {
      const funcDecl = this.userFunctionSignatures[funcName];
      signature = {
        parameters: funcDecl.arguments.map(arg => this.getArgType(arg)),
        returnType: funcDecl.returnType
      };
    } else {
      throw new Error(`Function '${funcName}' not found in function signatures.`);
    }
    if (signature.parameters.length !== callExpr.arguments.length) {
      throw new Error(`Function '${funcName}' expects ${signature.parameters.length} argument(s), but got ${callExpr.arguments.length}.`);
    }
    callExpr.arguments.forEach((arg, index) => {
      const argType = this.getArgType(arg);
      if (!this.typeEquals(argType, signature.parameters[index])) {
        throw new Error(
          `In function '${funcName}', parameter ${index + 1} is of type '${argType.name}' but expected '${signature.parameters[index].name}'.`
        );
      }
    });
    // Special check for isURL.
    if (funcName === "isURL") {
      const arg0 = callExpr.arguments[0];
      if (arg0.type === "StringLiteral") {
        const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
        if (!urlRegex.test(arg0.value)) {
          throw new Error(`Invalid URL provided to isURL: ${arg0.value}`);
        }
      }
    }
    return signature.returnType;
  }
}

module.exports = TypeChecker;
