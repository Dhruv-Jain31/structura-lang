// ir_generator.js
class IRGenerator {
  // Generate IR from AST
  static generate(ast) {
    const ir = [];
    for (const node of ast) {
      if (node.type === "FunctionDeclaration") {
        const funcIR = {
          op: "function_decl",
          name: node.name,
          parameters: node.arguments.map(arg => {
            if (arg.type === "Parameter") {
              return { name: arg.name, type: arg.paramType };
            } else {
              return IRGenerator.generateExpressionIR(arg);
            }
          }),
          returnType: node.returnType,
          body: node.body ? node.body.map(stmt => IRGenerator.generateStatementIR(stmt)) : null,
          line: node.line || null
        };
        ir.push(funcIR);
      } else if (node.type === "TypeAlias") {
        const aliasIR = {
          op: "type_alias",
          alias: node.alias,
          typeAnnotation: node.typeAnnotation,
          line: node.line || null
        };
        ir.push(aliasIR);
      } else if (node.type === "ExpressionStatement") {
        // Handle top-level expression statements.
        const exprIR = IRGenerator.generateExpressionIR(node.expression);
        ir.push({
          op: "expression_statement",
          expression: exprIR,
          line: node.line || null
        });
      } else {
        console.warn(`IR generation: unhandled AST node type: ${node.type}`);
      }
    }
    return ir;
  }

  // Generate IR for a statement.
  static generateStatementIR(stmt) {
    if (stmt.type === "ReturnStatement") {
      return {
        op: "return_statement",
        expression: IRGenerator.generateExpressionIR(stmt.expression),
        line: stmt.line || null
      };
    } else if (stmt.type === "ExpressionStatement") {
      return {
        op: "expression_statement",
        expression: IRGenerator.generateExpressionIR(stmt.expression),
        line: stmt.line || null
      };
    }
    console.warn(`IR generation (statements): unhandled statement type: ${stmt.type}`);
    return stmt;
  }

  // Generate IR for simple expressions.
  static generateExpressionIR(expr) {
    switch (expr.type) {
      case "NumberLiteral":
        return { op: "literal", value: Number(expr.value), type: "number" };
      case "StringLiteral":
        // Remove surrounding quotes.
        const val = expr.value.replace(/^['"]|['"]$/g, "");
        return { op: "literal", value: val, type: "string" };
      case "Identifier":
        return { op: "variable", name: expr.name, type: "any" };
      case "BinaryExpression":
        return {
          type: "BinaryExpression", // This is important for the optimizer.
          op: "binary_expression",
          operator: expr.operator,
          left: IRGenerator.generateExpressionIR(expr.left),
          right: IRGenerator.generateExpressionIR(expr.right)
        };
      default:
        throw new Error(`Unsupported expression type: ${expr.type}`);
    }
  }
}

module.exports = IRGenerator;
