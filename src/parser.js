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

  // Parse the entire source into an AST. It can contain function declarations or type alias declarations.
  parse() {
    const ast = [];
    while (this.peek().type !== "EOF") {
      if (this.peek().type === "IDENTIFIER" && this.tokens[this.position + 1] && this.tokens[this.position + 1].value === "=") {
        ast.push(this.parseTypeAlias());
      } else if (this.peek().type === "KEYWORD") {
        ast.push(this.parseFunction());
      } else if (this.peek().value === ";") {
        this.consume("SYMBOL", ";");
      } else {
        throw new Error(`Unexpected token ${this.peek().type} (${this.peek().value}) at line ${this.peek().line}`);
      }
    }
    return ast;
  }

  // Parse a type alias declaration, e.g.:
  //   NumberArr = number[];
  //   mixedArr = number|string[];
  parseTypeAlias() {
    const aliasToken = this.consume("IDENTIFIER");
    const aliasName = aliasToken.value;
    const line = aliasToken.line;
    // Consume "=" as a SYMBOL (not an OPERATOR)
    this.consume("SYMBOL", "=");
    const typeAnnotation = this.parseTypeAnnotation();
    if (this.peek().value === ";") {
      this.consume("SYMBOL", ";");
    }
    return {
      type: "TypeAlias",
      alias: aliasName,
      typeAnnotation, // structured type (see below)
      line
    };
  }

  // Parse a type annotation.
  // If the next token is a TYPE, then parse union/array from it.
  // Otherwise, if it's an IDENTIFIER, treat it as a type alias reference.
  parseTypeAnnotation() {
    const token = this.peek();
    if (token.type === "TYPE") {
      const tokenVal = this.consume("TYPE").value;
      return this.parseTypeAnnotationFromString(tokenVal);
    } else if (token.type === "IDENTIFIER") {
      // This is a type alias reference.
      return { kind: "alias", name: this.consume("IDENTIFIER").value };
    } else {
      throw new Error(`Expected type annotation at line ${token.line}`);
    }
  }

  // Helper: Given a string like "number", "number[]", or "string|number", return a structured type.
  parseTypeAnnotationFromString(typeStr) {
    // Split union types by "|"
    const unionParts = typeStr.split("|").map(part => part.trim());
    const types = unionParts.map(part => {
      if (part.endsWith("[]")) {
        return { kind: "array", elementType: { kind: "primitive", name: part.slice(0, -2) } };
      } else {
        return { kind: "primitive", name: part };
      }
    });
    if (types.length === 1) {
      return types[0];
    } else {
      return { kind: "union", types };
    }
  }

  // Parse a function declaration.
  parseFunction() {
    const funcNameToken = this.consume("KEYWORD");
    const funcName = funcNameToken.value;
    const funcLine = funcNameToken.line;

    this.consume("SYMBOL", "(");
    const args = this.parseArguments();
    this.consume("SYMBOL", ")");

    // Consume return type: our lexer merged ":" and TYPE into a RETURN_TYPE token.
    const returnTypeToken = this.consume("RETURN_TYPE");
    const returnType = this.parseTypeAnnotationFromString(returnTypeToken.value);

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

  // Parse either a parameter declaration or an expression.
  parseArgument() {
    if (
      this.peek().type === "IDENTIFIER" &&
      this.tokens[this.position + 1] &&
      this.tokens[this.position + 1].value === ":"
    ) {
      const paramNameToken = this.consume("IDENTIFIER");
      const paramName = paramNameToken.value;
      this.consume("SYMBOL", ":");
      const paramType = this.parseTypeAnnotation();
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
}

module.exports = Parser;
