// index.js
const fs = require('fs');
const path = require('path');

// Import the pipeline modules
const Lexer = require('./lexer.js');
const Parser = require('./parser.js');
const TypeChecker = require('./type_checker.js');
const IRGenerator = require('./ir_generator.js');
const IROptimizer = require('./ir_optimizer.js');
const IRCompiler = require('./ir_compiler.js');

/**
 * Compiles Structura source code (provided as a string) into JavaScript code.
 */
function compileStructura(sourceCode) {
  // Lexical analysis.
  const lexer = new Lexer(sourceCode);
  const tokens = lexer.tokenize();

  // Parsing.
  const parser = new Parser(tokens);
  const ast = parser.parse();

  // Type checking.
  const typeChecker = new TypeChecker(ast);
  typeChecker.check();

  // IR generation.
  const ir = IRGenerator.generate(ast);

  // IR optimization.
  const optimizedIR = IROptimizer.optimize(ir);

  // IR compilation.
  const finalJS = IRCompiler.compile(optimizedIR);

  return finalJS;
}

/**
 * Executes Structura source code immediately.
 */
function runStructura(sourceCode) {
  const finalJS = compileStructura(sourceCode);
  console.log("=== Compiled JavaScript ===");
  console.log(finalJS);
  console.log("=== Running Code ===");
  // Caution: using eval for demonstration. In a production system, use a safer mechanism.
  eval(finalJS);
}

// If index.js is run directly, read the .struct file passed as an argument or use a default.
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
  runStructura(sourceCode);
}

module.exports = {
  compileStructura,
  runStructura
};
