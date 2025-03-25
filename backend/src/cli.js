#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

// Import Structura compiler pipeline modules
const Lexer = require("./lexer.js");
const Parser = require("./parser.js");
const TypeChecker = require("./type_checker.js");
const IRGenerator = require("./ir_generator.js");
const IROptimizer = require("./ir_optimizer.js");
const IRCompiler = require("./ir_compiler.js");

// Define the supported modes
const supportedModes = ["lexer", "parse", "ir"];

// Get command-line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: compile <filename>.struct or compile <mode> <filename>.struct");
  process.exit(1);
}

let mode = "run"; // default mode: full pipeline
let inputFile = args[0];
if (supportedModes.includes(args[0])) {
  mode = args[0];
  if (args.length < 2) {
    console.error("Usage: compile <mode> <filename>.struct");
    process.exit(1);
  }
  inputFile = args[1];
}

if (path.extname(inputFile) !== ".struct") {
  console.error("Error: Input file must have a .struct extension.");
  process.exit(1);
}

// Read Structura source code from the input file
const sourceCode = fs.readFileSync(inputFile, "utf-8");

// Run the requested mode in the compilation pipeline
try {
  if (mode === "lexer") {
    const lexer = new Lexer(sourceCode);
    const tokens = lexer.tokenize();
    console.log(tokens);
  } else if (mode === "parse") {
    const lexer = new Lexer(sourceCode);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    console.log(ast);
  } else if (mode === "ir") {
    const lexer = new Lexer(sourceCode);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const typeChecker = new TypeChecker(ast);
    typeChecker.check();
    const ir = IRGenerator.generate(ast);
    const optimizedIR = IROptimizer.optimize(ir, true);
    console.log(optimizedIR);
  } else { // Full pipeline (run mode)
    // Lexing
    const lexer = new Lexer(sourceCode);
    const tokens = lexer.tokenize();
    console.log("Tokens:");
    console.log(tokens);

    // Parsing
    const parser = new Parser(tokens);
    const ast = parser.parse();
    console.log("AST:");
    console.log(ast);

    // Type Checking
    const typeChecker = new TypeChecker(ast);
    typeChecker.check();

    // IR Generation & Optimization
    const ir = IRGenerator.generate(ast);
    const optimizedIR = IROptimizer.optimize(ir, true);

    // Compile IR to final JavaScript code
    const finalJS = IRCompiler.compile(optimizedIR);

    // Create the build folder if it doesn't exist
    const buildDir = path.join(__dirname, "..", "build");
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir);
    }

    // Determine the output filename based on the input filename
    const baseName = path.basename(inputFile, ".struct");
    const outputFile = path.join(buildDir, `${baseName}.js`);

    // Write the final JavaScript code to the output file
    fs.writeFileSync(outputFile, finalJS, "utf-8");
    console.log(`Compilation successful! Output written to ${outputFile}`);
  }
} catch (error) {
  console.error("Compilation error:", error.message);
  process.exit(1);
}
