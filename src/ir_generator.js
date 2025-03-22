// ir_generator.js
class IRGenerator {
  // Generate IR from AST
  static generate(ast) {
    const ir = [];
    for (const node of ast) {
      if (node.type === "FunctionDeclaration") {
        // Create an IR instruction for a function declaration
        const funcIR = {
          op: "function_decl",
          name: node.name,
          parameters: node.arguments.map(arg => {
            if (arg.type === "Parameter") {
              return { name: arg.name, type: arg.paramType };
            } else {
              // For expressions passed as arguments, generate IR for the expression
              return IRGenerator.generateExpressionIR(arg);
            }
          }),
          returnType: node.returnType,
          line: node.line || null
        };
        ir.push(funcIR);
      } else if (node.type === "TypeAlias") {
        // Create an IR instruction for a type alias declaration
        const aliasIR = {
          op: "type_alias",
          alias: node.alias,
          typeAnnotation: node.typeAnnotation, // Structured type object
          line: node.line || null
        };
        ir.push(aliasIR);
      } else {
        console.warn(`IR generation: unhandled AST node type: ${node.type}`);
      }
    }
    return ir;
  }

  // Helper: generate IR for simple expressions (literals, identifiers)
  static generateExpressionIR(expr) {
    switch (expr.type) {
      case "NumberLiteral":
        return { op: "literal", value: Number(expr.value), type: "number" };
      case "StringLiteral":
        // Remove the surrounding quotes for the IR
        return { op: "literal", value: expr.value.replace(/"/g, ""), type: "string" };
      case "Identifier":
        return { op: "variable", name: expr.name, type: "any" };
      default:
        throw new Error(`Unsupported expression type: ${expr.type}`);
    }
  }
}

module.exports = IRGenerator;
