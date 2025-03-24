// ir_compiler.js
class IRCompiler {
  /**
   * Compile the IR (an array of IR nodes) into a final JavaScript source string.
   * Built-in functions (without a body) are compiled to call runtime implementations
   * from the stdlib module using explicit argument passing.
   */
  static compile(ir) {
    let output = "";
    // Adjust the require path so that it points correctly from the build folder.
    output += `const stdlib = require("../src/runtime/stdlib");\n\n`;

    for (const node of ir) {
      if (node.op === "function_decl") {
        output += IRCompiler.compileFunction(node) + "\n\n";
      } else if (node.op === "type_alias") {
        // Output type aliases as comments.
        output += `// Type alias: ${node.alias} = ${IRCompiler.typeToString(node.typeAnnotation)}\n`;
      } else {
        console.warn(`IRCompiler: Unhandled IR node op: ${node.op}`);
      }
    }
    return output;
  }

  /**
   * Compile a function declaration IR node into JavaScript.
   * If the node includes a body, it's a user-defined function.
   * Otherwise, it's built-in, and we generate a call to stdlib.<functionName>
   * using explicit parameter names.
   */
  static compileFunction(node) {
    const params = node.parameters.map(p => p.name).join(", ");
    let code = `function ${node.name}(${params}) {`;
    if (node.body && node.body.length > 0) {
      // User-defined function: compile each statement in the body.
      for (const stmt of node.body) {
        code += "\n  " + IRCompiler.compileStatement(stmt);
      }
    } else {
      // Built-in function: generate a call to the runtime implementation.
      // Instead of using ...arguments, we use the explicit parameter names.
      // If no parameters, just call stdlib.<functionName>()
      code += `\n  return stdlib.${node.name}(${params});`;
    }
    code += "\n}";
    return code;
  }

  /**
   * Compile a statement node.
   * Currently, only ReturnStatement and ExpressionStatement are supported.
   */
  static compileStatement(stmt) {
    if (stmt.type === "ReturnStatement") {
      return "return " + IRCompiler.compileExpression(stmt.expression) + ";";
    }
    if (stmt.type === "ExpressionStatement") {
      return IRCompiler.compileExpression(stmt.expression) + ";";
    }
    throw new Error(`Unsupported statement type: ${stmt.type}`);
  }

  /**
   * Compile an expression node into JavaScript code.
   * Supports literals, identifiers, and binary expressions.
   */
  static compileExpression(expr) {
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
   * Convert a structured type into a string (for comments).
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
