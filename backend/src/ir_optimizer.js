// ir_optimizer.js
class IROptimizer {
  /**
   * Optimize the given IR.
   * For function declarations, if no body exists, mark them as built-in.
   */
  static optimize(ir) {
    return ir.map(instr => {
      if (instr.op === "function_decl") {
        if (instr.body && instr.body.length > 0) {
          instr.body = IROptimizer.optimizeStatements(instr.body);
        } else {
          // Tag as built-in if no body is provided.
          instr.builtin = true;
        }
      }
      // Additional IR node optimizations (e.g., type_alias nodes) can be added here.
      return instr;
    });
  }

  /**
   * Optimize a list of statements.
   * Currently, we optimize return statements and expression statements.
   */
  static optimizeStatements(statements) {
    return statements.map(stmt => {
      if (stmt.op === "return_statement" || stmt.op === "expression_statement") {
        stmt.expression = IROptimizer.optimizeExpression(stmt.expression);
      }
      // Extend here for other statement types if needed.
      return stmt;
    });
  }

  /**
   * Optimize an expression.
   * If the expression is a binary_expression and both sides are literals,
   * constant folding is applied. For call_expressions, constant folding is
   * skipped if the 'builtin' flag is set to true.
   */
  static optimizeExpression(expr) {
    if (expr.op === "binary_expression") {
      // Recursively optimize left and right subexpressions.
      const left = IROptimizer.optimizeExpression(expr.left);
      const right = IROptimizer.optimizeExpression(expr.right);

      // If both subexpressions are literals, we can evaluate the expression.
      if (left.op === "literal" && right.op === "literal") {
        // Handle numeric addition.
        if (expr.operator === "+") {
          if (typeof left.value === "number" && typeof right.value === "number") {
            return { op: "literal", value: left.value + right.value, type: "number" };
          }
          // Handle string concatenation.
          if (typeof left.value === "string" && typeof right.value === "string") {
            return { op: "literal", value: left.value + right.value, type: "string" };
          }
        }
        // Additional operator cases can be added here.
      }
      // Return a new binary expression with optimized children.
      return { ...expr, left, right };
    } else if (expr.op === "call_expression") {
      // Skip optimization for built-in function calls.
      if (expr.builtin) {
        return expr;
      }
      // Otherwise, optimize the callee and arguments.
      const callee = IROptimizer.optimizeExpression(expr.callee);
      const args = expr.arguments.map(arg => IROptimizer.optimizeExpression(arg));
      return { ...expr, callee, arguments: args };
    }
    // For other expression types, return as is.
    return expr;
  }
}

module.exports = IROptimizer;
