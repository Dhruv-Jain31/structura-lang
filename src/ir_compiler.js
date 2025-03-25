class IRCompiler {
  /**
   * Compiles the IR nodes into JavaScript code.
   *
   * @param {Array} ir - The IR nodes.
   * @param {boolean} [wrap=true] - Whether to wrap the output in an IIFE.
   * @returns {string} The compiled JavaScript code.
   */
  static compile(ir, wrap = true) {
    let output = "";
    if (wrap) {
      output += `(function() {\n`;
    }
    output += `const stdlib = require("../src/runtime/stdlib");\n\n`;

    // Separate nodes by type using a map for functions to avoid duplicates.
    const functionsMap = new Map();
    const typeAliases = [];
    const topLevelStatements = [];

    for (const node of ir) {
      switch (node.op) {
        case "function_decl":
          if (functionsMap.has(node.name)) {
            // Prefer a node with a body over one without.
            const existing = functionsMap.get(node.name);
            if (node.body && node.body.length > 0 && (!existing.body || existing.body.length === 0)) {
              functionsMap.set(node.name, node);
            }
          } else {
            functionsMap.set(node.name, node);
          }
          break;
        case "type_alias":
          typeAliases.push(node);
          break;
        case "expression_statement":
          topLevelStatements.push(node);
          break;
        default:
          console.warn(`IRCompiler: Unhandled IR node op: ${node.op}`);
      }
    }

    // Emit type aliases as comments.
    for (const aliasNode of typeAliases) {
      output += `// Type alias: ${aliasNode.alias} = ${this.typeToString(aliasNode.typeAnnotation)}\n`;
    }
    output += "\n";

    // Emit function declarations.
    for (const funcNode of functionsMap.values()) {
      output += this.compileFunction(funcNode) + "\n\n";
    }

    // Emit top-level execution statements.
    if (topLevelStatements.length > 0) {
      output += "// Top-level statements:\n";
      for (const stmt of topLevelStatements) {
        output += this.compileStatement(stmt) + "\n";
      }
    }

    if (wrap) {
      output += `})();\n`;
    }
    return output;
  }

  /**
   * Compiles a function declaration IR node.
   */
  static compileFunction(node) {
    const params = node.parameters.map(p => p.name).join(", ");
    let code = `function ${node.name}(${params}) {`;
    
    if (node.body && node.body.length > 0) {
      // Compile each statement in the function body.
      for (const stmt of node.body) {
        code += "\n  " + this.compileStatement(stmt);
      }
    } else {
      // For built-in functions, delegate to stdlib.
      code += `\n  return stdlib.${node.name}(${params});`;
    }
    
    code += "\n}";
    return code;
  }

  /**
   * Compiles a statement IR node.
   */
  static compileStatement(stmt) {
    switch (stmt.op) {
      case "return_statement":
        return "return " + this.compileExpression(stmt.expression) + ";";
      case "expression_statement":
        return this.compileExpression(stmt.expression) + ";";
      default:
        console.warn("IRCompiler: Unhandled statement op: " + stmt.op);
        return "";
    }
  }

  /**
   * Compiles an expression IR node.
   */
  static compileExpression(expr) {
    switch (expr.op) {
      case "literal":
        // For strings, ensure quotes are added.
        return typeof expr.value === "string" ? JSON.stringify(expr.value) : expr.value;
      case "variable":
        return expr.name;
      case "binary_expression":
        return (
          this.compileExpression(expr.left) +
          " " +
          expr.operator +
          " " +
          this.compileExpression(expr.right)
        );
      default:
        console.warn("IRCompiler: Unhandled expression op: " + expr.op);
        return "";
    }
  }

  /**
   * Converts a type annotation to its string representation.
   */
  static typeToString(typeAnnotation) {
    // Adjust this conversion based on the structure of your type annotation objects.
    if (typeof typeAnnotation === "object" && typeAnnotation.name) {
      return typeAnnotation.name;
    }
    return String(typeAnnotation);
  }
}

module.exports = IRCompiler;
