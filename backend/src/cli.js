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
const supportedModes = ["lexer", "parse", "ir", "tac"];

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

// Helper: Format IR to readable TAC
function formatTAC(ir) {
  let output = "Three-Address Code (TAC):\n";
  let counter = 1;

  for (const instr of ir) {
    let line = "";
    const temp = `t${counter}`;

    if (instr.op === "assign") {
      line = `${temp} := ${instr.value}`;
    } else if (instr.op === "binary") {
      line = `${temp} := ${instr.left} ${instr.operator} ${instr.right}`;
    } else if (instr.op === "call") {
      line = `${temp} := ${instr.callee}(${instr.args.join(", ")})`;
    } else if (instr.op === "print") {
      line = `${temp} := print(${instr.argument})`;
    } else if (instr.op === "return") {
      line = `${temp} := return ${instr.argument}`;
    } else {
      line = `${temp} := [unknown op: ${instr.op}]`;
    }

    output += `${line}\n(result: ${temp})\n`;
    counter++;
  }

  return output;
}

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
  } else if (mode === "ir" || mode === "tac") {
    const lexer = new Lexer(sourceCode);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const typeChecker = new TypeChecker(ast);
    typeChecker.check();
    const ir = IRGenerator.generate(ast);
    const optimizedIR = IROptimizer.optimize(ir, true);

    if (mode === "ir") {
      console.log(optimizedIR);
    } else {
      const formatted = formatTAC(optimizedIR);
      console.log(formatted);
    }
  } else { // Full pipeline (run mode)
    const lexer = new Lexer(sourceCode);
    const tokens = lexer.tokenize();
    console.log("Tokens:");
    console.log(tokens);

    const parser = new Parser(tokens);
    const ast = parser.parse();
    console.log("AST:");
    console.log(ast);

    const typeChecker = new TypeChecker(ast);
    typeChecker.check();

    const ir = IRGenerator.generate(ast);
    const optimizedIR = IROptimizer.optimize(ir, true);

    const finalJS = IRCompiler.compile(optimizedIR);

    const buildDir = path.join(__dirname, "..", "build");
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir);
    }

    const baseName = path.basename(inputFile, ".struct");
    const outputFile = path.join(buildDir, `${baseName}.js`);

    fs.writeFileSync(outputFile, finalJS, "utf-8");
    console.log(`Compilation successful! Output written to ${outputFile}`);
  }
} catch (error) {
  console.error("Compilation error:", error.message);
  process.exit(1);
}
