const Lexer = require("./lexer.js");

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  peek() {
    return this.tokens[this.position] || { type: "EOF", value: null };
  }

  consume(expectedType, expectedValue = null) {
    const token = this.tokens[this.position];
    if (
      token.type === expectedType &&
      (expectedValue === null || token.value === expectedValue)
    ) {
      this.position++;
      return token;
    }
    throw new Error(
      `Expected ${expectedType}${expectedValue ? " with value " + expectedValue : ""} but found ${token.type} (${token.value})`
    );
  }

  parseFunction() {
    // Consume function name (e.g., abs, print, push, pop)
    const funcName = this.consume("KEYWORD").value;

    // Consume '(' then parse arguments then consume ')'
    this.consume("SYMBOL", "(");
    const args = this.parseArguments();
    this.consume("SYMBOL", ")");

    // Enforce required return type (as a RETURN_TYPE token)
    if (this.peek().type === "RETURN_TYPE") {
      var returnType = this.consume("RETURN_TYPE").value;
    } else {
      throw new Error(`Missing return type in function '${funcName}'`);
    }

    // Consume trailing semicolon if present
    if (this.peek().value === ";") {
      this.consume("SYMBOL", ";");
    }

    return {
      type: "FunctionDeclaration",
      name: funcName,
      arguments: args,
      returnType,
    };
  }

  parseArguments() {
    const args = [];
    if (this.peek().value === ")") return args; // no arguments

    args.push(this.parseArgument());
    while (this.peek().value === ",") {
      this.consume("SYMBOL", ",");
      args.push(this.parseArgument());
    }
    return args;
  }

  parseArgument() {
    // If we see an IDENTIFIER followed by a colon, it's a parameter declaration.
    if (
      this.peek().type === "IDENTIFIER" &&
      this.tokens[this.position + 1] &&
      this.tokens[this.position + 1].value === ":"
    ) {
      const paramName = this.consume("IDENTIFIER").value;
      this.consume("SYMBOL", ":");
      const paramType = this.consume("TYPE").value;
      return { type: "Parameter", name: paramName, paramType };
    } else {
      return this.parseExpression();
    }
  }

  parseExpression() {
    const token = this.peek();
    if (token.type === "STRING_LITERAL") {
      return { type: "StringLiteral", value: this.consume("STRING_LITERAL").value };
    }
    if (token.type === "NUMBER_LITERAL") {
      return { type: "NumberLiteral", value: this.consume("NUMBER_LITERAL").value };
    }
    if (token.type === "IDENTIFIER") {
      return { type: "Identifier", name: this.consume("IDENTIFIER").value };
    }
    throw new Error(`Unexpected token in expression: ${token.type} (${token.value})`);
  }

  parse() {
    const ast = [];
    while (this.peek().type !== "EOF") {
      if (this.peek().value === ";") {
        this.consume("SYMBOL", ";");
        continue;
      }
      ast.push(this.parseFunction());
    }
    return ast;
  }
}

// Example test
const lexer = new Lexer(`
    abs(a: number): number;
    print(msg: string): void;
    push(arr, 10): number;
    pop(arr): any;
`);

const tokens = lexer.tokenize();
console.log("Tokens:", tokens);

const parser = new Parser(tokens);
const ast = parser.parse();
console.log("AST:", JSON.stringify(ast, null, 2));

module.exports = Parser;
