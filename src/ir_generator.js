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
      } else {
        console.warn(`IR generation: unhandled AST node type: ${node.type}`);
      }
    }
    return ir;
  }

  // Generate IR for simple expressions.
  static generateExpressionIR(expr) {
    switch (expr.type) {
      case "NumberLiteral":
        return { op: "literal", value: Number(expr.value), type: "number" };
      case "StringLiteral":
        // Remove surrounding quotes. If our regex returns something like '"text"' or "'text'", remove both.
        const val = expr.value.replace(/^['"]|['"]$/g, "");
        return { op: "literal", value: val, type: "string" };
      case "Identifier":
        return { op: "variable", name: expr.name, type: "any" };
      default:
        throw new Error(`Unsupported expression type: ${expr.type}`);
    }
  }
}

module.exports = IRGenerator;
