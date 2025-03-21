const Lexer = require('./lexer.js');
const Parser = require('./parser.js');
const TypeChecker = require('./type_checker.js');
const IRGenerator = require('./ir_generator.js');

// Sample Structura source code
const sourceCode = `
    abs(a: number): number;
    print(msg: string): void;
    push(arr, 10): number;
    pop(arr): any;
`;

// Tokenize
const lexer = new Lexer(sourceCode);
const tokens = lexer.tokenize();
console.log("Tokens:", tokens);

// Parse into AST
const parser = new Parser(tokens);
const ast = parser.parse();
console.log("AST:", JSON.stringify(ast, null, 2));

// Type Check (if you have already integrated this)
const typeChecker = new TypeChecker(ast);
try {
  typeChecker.check();
  console.log("Type check passed.");
} catch (e) {
  console.error("Type check error:", e.message);
  process.exit(1);
}

// Generate IR from AST
const ir = IRGenerator.generate(ast);
console.log("Intermediate Representation (IR):", JSON.stringify(ir, null, 2));
