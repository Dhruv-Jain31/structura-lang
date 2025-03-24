const fs = require("fs");
const path = require("path");

const Lexer = require("./lexer.js");
const Parser = require("./parser.js");
const TypeChecker = require("./type_checker.js");
const IRGenerator = require("./ir_generator.js");
const IROptimizer = require("./ir_optimizer.js");
const IRCompiler = require("./ir_compiler.js");

function compileStructura(sourceCode) {
  const lexer = new Lexer(sourceCode);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const typeChecker = new TypeChecker(ast);
  typeChecker.check();
  const ir = IRGenerator.generate(ast);
  const optimizedIR = IROptimizer.optimize(ir);
  let finalJS = IRCompiler.compile(optimizedIR);
  
  // Check if a function "main" exists and append a call to main() if so.
  if (finalJS.includes("function main(")) {
    finalJS += "\n\nmain();\n";
  }
  return finalJS;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: node index.js <filename>.struct");
    process.exit(1);
  }
  const inputFile = args[0];
  if (path.extname(inputFile) !== ".struct") {
    console.error("Error: Input file must have a .struct extension.");
    process.exit(1);
  }
  const sourceCode = fs.readFileSync(inputFile, "utf-8");
  const finalJS = compileStructura(sourceCode);
  console.log("=== Compiled JavaScript ===\n", finalJS);
  console.log("=== Running Code ===");
  eval(finalJS);
}

module.exports = { compileStructura };
