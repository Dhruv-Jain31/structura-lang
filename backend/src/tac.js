const fs = require("fs");
const path = require("path");
const Lexer = require("./lexer");
const Parser = require("./parser");
const TypeChecker = require("./type_checker");
const IRGenerator = require("./ir_generator");
const IROptimizer = require("./ir_optimizer");

class TACPrinter {
  constructor() {
    this.tempCount = 0;
    this.codeLines = [];
  }

  newTemp() {
    this.tempCount++;
    return "t" + this.tempCount;
  }

  generateExpr(node) {
    switch (node.op) {
      case "literal":
        return typeof node.value === "string" ? JSON.stringify(node.value) : node.value;
      case "variable":
        return node.name;
      case "binary_expression": {
        const left = this.generateExpr(node.left);
        const right = this.generateExpr(node.right);
        const temp = this.newTemp();
        this.codeLines.push(`${temp} := ${left} ${node.operator} ${right}`);
        return temp;
      }
      case "call_expression": {
        const callee = this.generateExpr(node.callee);
        const args = node.arguments.map(arg => this.generateExpr(arg)).join(", ");
        const temp = this.newTemp();
        this.codeLines.push(`${temp} := ${callee}(${args})`);
        return temp;
      }
      case "member_expression": {
        const obj = this.generateExpr(node.object);
        const prop = this.generateExpr(node.property);
        return `${obj}.${prop}`;
      }
      default:
        throw new Error(`Unsupported IR expression op: ${node.op}`);
    }
  }

  generateStmt(node) {
    if (node.op === "expression_statement") {
      const res = this.generateExpr(node.expression);
      this.codeLines.push(`(result: ${res})`);
    } else if (node.op === "return_statement") {
      const res = this.generateExpr(node.expression);
      this.codeLines.push(`return ${res}`);
    } else {
      throw new Error(`Unsupported IR statement op: ${node.op}`);
    }
  }

  generate(ir) {
    for (const node of ir) {
      if (node.op === "function_decl") {
        this.codeLines.push(`--- Function ${node.name} ---`);
        if (node.body && node.body.length > 0) {
          for (const stmt of node.body) {
            this.generateStmt(stmt);
          }
        } else if (node.builtin) {
          this.codeLines.push(`(builtin function: ${node.name} forwarding to stdlib)`);
        } else {
          this.codeLines.push(`(no body)`);
        }
      } else if (node.op === "expression_statement") {
        this.generateStmt(node);
      }
    }
    return this.codeLines.join("\n");
  }
}

function generateTAC(inputFile) {
  const code = fs.readFileSync(inputFile, "utf8");

  const lexer = new Lexer(code);
  const tokens = lexer.tokenize();

  const parser = new Parser(tokens);
  const ast = parser.parse();

  const typeChecker = new TypeChecker(ast);
  typeChecker.check();

  const rawIR = IRGenerator.generate(ast);
  const optimizedIR = IROptimizer.optimize(rawIR);

  const tacPrinter = new TACPrinter();
  const tacOutput = tacPrinter.generate(optimizedIR);

  console.log("Three-Address Code (TAC):");
  console.log(tacOutput);
}

// ✅ Only run if this file is executed directly
if (require.main === module) {
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.error("Usage: node src/tac.js <path-to-struct-file>");
    process.exit(1);
  }

  const inputFilePath = path.resolve(process.cwd(), inputFile);
  generateTAC(inputFilePath);
}

module.exports = { generateTAC, TACPrinter };
