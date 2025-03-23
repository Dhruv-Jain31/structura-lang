#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

// Import your compiler pipeline modules
const Lexer = require("./lexer.js");
const Parser = require("./parser.js");
const TypeChecker = require("./type_checker.js");
const IRGenerator = require("./ir_generator.js");
const IROptimizer = require("./ir_optimizer.js");
const IRCompiler = require("./ir_compiler.js");

// Get command-line arguments. Expect the first argument to be a .struct file.
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: compile <filename>.struct");
  process.exit(1);
}

const inputFile = args[0];
if (path.extname(inputFile) !== ".struct") {
  console.error("Error: Input file must have a .struct extension.");
  process.exit(1);
}

// Read the source file.
const sourceCode = fs.readFileSync(inputFile, "utf-8");

// Run the compilation pipeline.
try {
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

  // IR compilation to JavaScript.
  const finalJS = IRCompiler.compile(optimizedIR);

  // Create build folder if it doesn't exist.
  const buildDir = path.join(__dirname, "..", "build");
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
  }

  // Determine output filename (e.g., hello.js).
  const baseName = path.basename(inputFile, ".struct");
  const outputFile = path.join(buildDir, `${baseName}.js`);

  // Write final JavaScript code to output file.
  fs.writeFileSync(outputFile, finalJS, "utf-8");
  console.log(`Compilation successful! Output written to ${outputFile}`);
} catch (error) {
  console.error("Compilation error:", error.message);
  process.exit(1);
}
