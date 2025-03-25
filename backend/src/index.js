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

  // Wrap top-level code in IIFE (Immediately Invoked Function Expression)
  finalJS = `(function(){\n${finalJS}\n})();`;

  return finalJS;
}

// If run as standalone (not imported as a module)
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
  
  console.log("=== Running Structura Code ===");
  eval(finalJS);  // Direct execution in Node.js
}

module.exports = { compileStructura };
