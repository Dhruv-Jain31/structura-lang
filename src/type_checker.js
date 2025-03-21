class TypeChecker {
    constructor(ast) {
      this.ast = ast;
      // Predefined function signatures for built-in functions
      this.functionSignatures = {
        abs: { parameters: ['number'], returnType: 'number' },
        print: { parameters: ['string'], returnType: 'void' },
        push: { parameters: ['any', 'number'], returnType: 'number' },
        pop: { parameters: ['any'], returnType: 'any' },
        // Add more built-in signatures as needed
      };
    }
  
    checkFunction(funcNode) {
      const funcName = funcNode.name;
      if (this.functionSignatures.hasOwnProperty(funcName)) {
        const expected = this.functionSignatures[funcName];
  
        // Check parameter count
        if (funcNode.arguments.length !== expected.parameters.length) {
          throw new Error(
            `Function '${funcName}' expects ${expected.parameters.length} parameter(s) but got ${funcNode.arguments.length}.`
          );
        }
  
        // Check parameter types
        funcNode.arguments.forEach((arg, index) => {
          let declaredType;
          if (arg.type === 'Parameter') {
            declaredType = arg.paramType;
          } else if (arg.type === 'NumberLiteral') {
            declaredType = 'number';
          } else if (arg.type === 'StringLiteral') {
            declaredType = 'string';
          } else if (arg.type === 'Identifier') {
            // For now, assume identifiers have type 'any'
            declaredType = 'any';
          } else {
            throw new Error(`Unknown argument type: ${arg.type}`);
          }
          const expectedType = expected.parameters[index];
          if (expectedType !== 'any' && declaredType !== expectedType) {
            throw new Error(
              `Parameter ${index + 1} of function '${funcName}' should be '${expectedType}' but got '${declaredType}'.`
            );
          }
        });
  
        // Check return type
        if (funcNode.returnType !== expected.returnType) {
          throw new Error(
            `Function '${funcName}' should return '${expected.returnType}' but declared return type is '${funcNode.returnType}'.`
          );
        }
      } else {
        // You can choose to warn for functions without a predefined signature.
        console.warn(`Warning: No type signature defined for function '${funcName}'.`);
      }
    }
  
    check() {
      for (const node of this.ast) {
        if (node.type === 'FunctionDeclaration') {
          this.checkFunction(node);
        }
      }
    }
  }
  
  module.exports = TypeChecker;
  