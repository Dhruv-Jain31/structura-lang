const Lexer = require("./lexer.js");

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  peek() {
    return this.tokens[this.position] || { type: "EOF", value: null, line: null };
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
      `Expected ${expectedType}${expectedValue ? " with value " + expectedValue : ""} but found ${token.type} (${token.value}) at line ${token.line}`
    );
  }

  parseFunction() {
    // Capture line number from the function name token
    const funcNameToken = this.consume("KEYWORD");
    const funcName = funcNameToken.value;
    const funcLine = funcNameToken.line;

    this.consume("SYMBOL", "(");
    const args = this.parseArguments(); // Use parseArguments which calls parseArgument()
    this.consume("SYMBOL", ")");

    // Consume return type as a RETURN_TYPE token
    let returnTypeToken = this.consume("RETURN_TYPE");
    const returnType = returnTypeToken.value;

    if (this.peek().value === ";") {
      this.consume("SYMBOL", ";");
    }

    return {
      type: "FunctionDeclaration",
      name: funcName,
      arguments: args,
      returnType,
      line: funcLine
    };
  }

  // Updated: Use parseArgument() to handle parameter declarations
  parseArguments() {
    const args = [];
    if (this.peek().value === ")") return args; // No arguments

    args.push(this.parseArgument());
    while (this.peek().value === ",") {
      this.consume("SYMBOL", ",");
      args.push(this.parseArgument());
    }
    return args;
  }

  // Parses either a parameter declaration (IDENTIFIER ":" TYPE)
  // or, if not a parameter, falls back to parsing an expression.
  parseArgument() {
    // Check if we have a parameter declaration
    if (
      this.peek().type === "IDENTIFIER" &&
      this.tokens[this.position + 1] &&
      this.tokens[this.position + 1].value === ":"
    ) {
      const paramNameToken = this.consume("IDENTIFIER");
      const paramName = paramNameToken.value;
      this.consume("SYMBOL", ":");
      const paramType = this.consume("TYPE").value;
      return { type: "Parameter", name: paramName, paramType, line: paramNameToken.line };
    } else {
      return this.parseExpression();
    }
  }

  parseExpression() {
    const token = this.peek();
    if (token.type === "STRING_LITERAL") {
      return { type: "StringLiteral", value: this.consume("STRING_LITERAL").value, line: token.line };
    }
    if (token.type === "NUMBER_LITERAL") {
      return { type: "NumberLiteral", value: this.consume("NUMBER_LITERAL").value, line: token.line };
    }
    if (token.type === "IDENTIFIER") {
      return { type: "Identifier", name: this.consume("IDENTIFIER").value, line: token.line };
    }
    throw new Error(`Unexpected token in expression: ${token.type} (${token.value}) at line ${token.line}`);
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

module.exports = Parser;
