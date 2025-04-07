const fs = require("fs");
const path = require("path");
const Lexer = require("./lexer");
const Parser = require("./parser");
const TypeChecker = require("./type_checker");
const IRGenerator = require("./ir_generator");
const IROptimizer = require("./ir_optimizer");

/**
 * TACPrinter converts IR into a human-readable three-address code format.
 */
class TACPrinter {
  constructor() {
    this.tempCount = 0;
    this.codeLines = [];
  }

  // Generates a new temporary variable name.
  newTemp() {
    this.tempCount++;
    return "t" + this.tempCount;
  }

  /**
   * Recursively generate TAC for an expression IR node.
   * Returns the name (variable or temp) holding the result.
   */
  generateExpr(node) {
    switch (node.op) {
      case "literal":
        // Directly return literals.
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
        // For simplicity, assume a call returns its result in a temporary.
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

  /**
   * Generate TAC for a statement IR node.
   * Extend this if you have other kinds of statements.
   */
  generateStmt(node) {
    // For demonstration, if we encounter an expression statement,
    // we generate the expression TAC and output the result.
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

  /**
   * Generate TAC for an entire IR array.
   * This traverses top-level IR nodes and produces TAC.
   */
  generate(ir) {
    // For each top-level node, if it's a function declaration,
    // we can output a header and then generate TAC for its body.
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
      // You can handle type_alias or other nodes if desired.
    }
    return this.codeLines.join("\n");
  }
}

/**
 * Main function to generate and output TAC.
 *
 * @param {string} inputFile - Path to the .struct file.
 */
function generateTAC(inputFile) {
  // Read the struct file.
  const code = fs.readFileSync(inputFile, "utf8");

  // Lexing.
  const lexer = new Lexer(code);
  const tokens = lexer.tokenize();

  // Parsing.
  const parser = new Parser(tokens);
  const ast = parser.parse();

  // Type-checking.
  const typeChecker = new TypeChecker(ast);
  typeChecker.check();

  // IR Generation.
  const rawIR = IRGenerator.generate(ast);

  // (Optional) IR Optimization. If you want raw TAC, you can skip this step.
  const optimizedIR = IROptimizer.optimize(rawIR);

  // Generate TAC from IR.
  const tacPrinter = new TACPrinter();
  // Choose one: use optimizedIR or rawIR.
  const tacOutput = tacPrinter.generate(optimizedIR);

  console.log("Three-Address Code (TAC):");
  console.log(tacOutput);
}

// Command-line processing.
const inputFile = process.argv[2];
if (!inputFile) {
  console.error("Usage: node src/tac.js <path-to-struct-file>");
  process.exit(1);
}

const inputFilePath = require("path").resolve(process.cwd(), inputFile);
generateTAC(inputFilePath);
