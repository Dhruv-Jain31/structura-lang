// index.js
const Lexer = require('./lexer.js');
const Parser = require('./parser.js');
const TypeChecker = require('./type_checker.js');
const IRGenerator = require('./ir_generator.js');
const IROptimizer = require('./ir_optimizer.js');

const sourceCode = `
    // Built-in functions (strict):
    abs(a: number): number;
    print("Hello", "World"): string;
    print(42, 52): number;
    push(arr, 10): number;
    pop(arr): any;

    // Type alias declarations:
    NumberArr = number[];
    StringArr = string[];
    MixedArr = string|number[];

    // Built-in sample functions with strict types:
    sumNumbers(arr: NumberArr): number;
    concatStrings(arr: StringArr): string;
    processMixed(arr: MixedArr): string|number;

    /* User-defined function (correct):
    myFunc(a: number): number {
        return a + 1;
    }*/

    // User-defined function (incorrect, return type mismatch):
     myFuncError(a: string): string {
         return a + "dhruv";
    }

    // User-defined function (union return type, correct if returning number):
    //myFuncUnion(a: number): number|string {
    //    return a + 1;
    //}
`;

// Tokenize
const lexer = new Lexer(sourceCode);
const tokens = lexer.tokenize();
console.log("Tokens:", tokens);

// Parse into AST
const parser = new Parser(tokens);
const ast = parser.parse();
console.log("AST:", JSON.stringify(ast, null, 2));

// Type Check
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

const optimizedIR = IROptimizer.optimize(ir);
console.log("Optimized IR:", JSON.stringify(optimizedIR, null, 2));
