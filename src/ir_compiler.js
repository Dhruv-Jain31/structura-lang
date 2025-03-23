// ir_compiler.js
class IRCompiler {
    /**
     * Compile the IR (an array of IR nodes) into final JavaScript code.
     */
    static compile(ir) {
      let output = "";
  
      for (const node of ir) {
        if (node.op === "function_decl") {
          output += IRCompiler.compileFunction(node) + "\n\n";
        } else if (node.op === "type_alias") {
          // Type aliases are compile-time only; we output a comment for reference.
          output += `// Type alias: ${node.alias} = ${IRCompiler.typeToString(node.typeAnnotation)}\n`;
        } else {
          console.warn(`IRCompiler: Unhandled IR node op: ${node.op}`);
        }
      }
      return output;
    }
  
    /**
     * Compile a function declaration IR node into JavaScript.
     * If the node includes a body (user-defined), emit it; otherwise, output a stub.
     */
    static compileFunction(node) {
      // Build the parameter list from the IR.
      const params = node.parameters.map(p => p.name).join(", ");
      let code = `function ${node.name}(${params}) {`;
  
      if (node.body && node.body.length > 0) {
        // For user-defined functions, compile each statement in the body.
        for (const stmt of node.body) {
          code += "\n  " + IRCompiler.compileStatement(stmt);
        }
      } else {
        // For built-in functions, output a stub.
        code += "\n  // Built-in function stub; implementation provided elsewhere.";
      }
      code += "\n}";
      return code;
    }
  
    /**
     * Compile a statement node (currently only ReturnStatement is supported).
     */
    static compileStatement(stmt) {
      if (stmt.type === "ReturnStatement") {
        return "return " + IRCompiler.compileExpression(stmt.expression) + ";";
      }
      throw new Error(`Unsupported statement type: ${stmt.type}`);
    }
  
    /**
     * Compile an expression node into JavaScript.
     * Supports literals, identifiers, and binary expressions.
     */
    static compileExpression(expr) {
      // If the expression is a literal (from our IR generator)
      if (expr.op === "literal") {
        if (expr.type === "number") {
          return String(expr.value);
        } else if (expr.type === "string") {
          return `"${expr.value}"`;
        }
        return String(expr.value);
      }
      if (expr.op === "variable") {
        return expr.name;
      }
      if (expr.type === "BinaryExpression") {
        return `${IRCompiler.compileExpression(expr.left)} ${expr.operator} ${IRCompiler.compileExpression(expr.right)}`;
      }
      throw new Error(`Unsupported IR expression type: ${expr.type || expr.op}`);
    }
  
    /**
     * Helper to convert a structured type into a string.
     */
    static typeToString(type) {
      if (type.kind === "primitive") {
        return type.name;
      }
      if (type.kind === "array") {
        return IRCompiler.typeToString(type.elementType) + "[]";
      }
      if (type.kind === "union") {
        return type.types.map(t => IRCompiler.typeToString(t)).join("|");
      }
      if (type.kind === "alias") {
        return type.name;
      }
      return "unknown";
    }
  }

  module.exports = IRCompiler;
