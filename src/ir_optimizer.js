// ir_optimizer.js
class IROptimizer {
  /**
   * Optimize the given IR.
   * Currently, this function traverses IR instructions.
   * For function declarations with a body, it optimizes each statement.
   */
  static optimize(ir) {
    return ir.map(instr => {
      if (instr.op === "function_decl" && instr.body) {
        instr.body = IROptimizer.optimizeStatements(instr.body);
      }
      // Additional IR node optimizations (e.g., type_alias nodes) can be added here.
      return instr;
    });
  }

  /**
   * Optimize a list of statements.
   * Currently, we only optimize ReturnStatements.
   */
  static optimizeStatements(statements) {
    return statements.map(stmt => {
      if (stmt.op === "return_statement") {
        stmt.expression = IROptimizer.optimizeExpression(stmt.expression);
      }
      // Extend here for other statement types if needed.
      return stmt;
    });
  }

  /**
   * Optimize an expression.
   * If the expression is a BinaryExpression and both sides are literals,
   * constant folding is applied.
   */
  static optimizeExpression(expr) {
    if (expr.type === "BinaryExpression") {
      // Recursively optimize left and right subexpressions.
      const left = IROptimizer.optimizeExpression(expr.left);
      const right = IROptimizer.optimizeExpression(expr.right);

      // If both subexpressions are literal, we can evaluate the expression.
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
    }
    // For non-binary expressions, return as is.
    return expr;
  }
}

module.exports = IROptimizer;
