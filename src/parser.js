// parser.js
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

  consumeAny(types) {
    const token = this.peek();
    if (types.includes(token.type)) {
      this.position++;
      return token;
    }
    throw new Error(
      `Expected one of [${types.join(", ")}] but found ${token.type} (${token.value}) at line ${token.line}`
    );
  }

  // Main parse method: distinguishes type alias declarations, built-in function declarations, and user-defined functions.
  parse() {
    const ast = [];
    while (this.peek().type !== "EOF") {
      const current = this.peek();
      if (current.type === "IDENTIFIER") {
        const next = this.tokens[this.position + 1];
        if (next && next.value === "=") {
          ast.push(this.parseTypeAlias());
        } else if (next && next.value === "(") {
          // Check if there's a function body following the declaration.
          const funcNode = this.parseFunction();
          ast.push(funcNode);
        } else {
          throw new Error(`Unexpected token ${current.type} (${current.value}) at line ${current.line}`);
        }
      } else if (current.type === "KEYWORD") {
        ast.push(this.parseFunction());
      } else if (current.value === ";") {
        this.consume("SYMBOL", ";");
      } else {
        throw new Error(`Unexpected token ${current.type} (${current.value}) at line ${current.line}`);
      }
    }
    return ast;
  }

  parseTypeAlias() {
    const aliasToken = this.consume("IDENTIFIER");
    const aliasName = aliasToken.value;
    const line = aliasToken.line;
    this.consume("SYMBOL", "=");
    const typeAnnotation = this.parseTypeAnnotation();
    if (this.peek().value === ";") {
      this.consume("SYMBOL", ";");
    }
    return {
      type: "TypeAlias",
      alias: aliasName,
      typeAnnotation,
      line
    };
  }

  parseTypeAnnotation() {
    const token = this.peek();
    if (token.type === "TYPE") {
      const tokenVal = this.consume("TYPE").value;
      return this.parseTypeAnnotationFromString(tokenVal);
    } else if (token.type === "IDENTIFIER") {
      return { kind: "alias", name: this.consume("IDENTIFIER").value };
    } else {
      throw new Error(`Expected type annotation at line ${token.line}`);
    }
  }

  parseTypeAnnotationFromString(typeStr) {
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

  parseFunction() {
    // Consume a KEYWORD or IDENTIFIER as function name.
    const funcNameToken = this.consumeAny(["KEYWORD", "IDENTIFIER"]);
    const funcName = funcNameToken.value;
    const funcLine = funcNameToken.line;

    this.consume("SYMBOL", "(");
    const args = this.parseArguments();
    this.consume("SYMBOL", ")");

    const returnTypeToken = this.consume("RETURN_TYPE");
    const returnType = this.parseTypeAnnotationFromString(returnTypeToken.value);

    // If the next token is a "{" then it's a user-defined function with a body.
    let body = null;
    if (this.peek().value === "{") {
      body = this.parseFunctionBody();
    } else {
      // Otherwise, it's a built-in declaration (without body).
      this.consume("SYMBOL", ";");
    }

    return {
      type: "FunctionDeclaration",
      name: funcName,
      arguments: args,
      returnType,
      body, // body is either null or a list of statements
      line: funcLine
    };
  }

  parseArguments() {
    const args = [];
    if (this.peek().value === ")") return args;
    args.push(this.parseArgument());
    while (this.peek().value === ",") {
      this.consume("SYMBOL", ",");
      args.push(this.parseArgument());
    }
    return args;
  }

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

  // Very simple function body parser: expects a block { ... } with at least one return statement.
  parseFunctionBody() {
    const body = [];
    this.consume("SYMBOL", "{");
    while (this.peek().value !== "}") {
      body.push(this.parseStatement());
    }
    this.consume("SYMBOL", "}");
    return body;
  }

  parseStatement() {
    // We handle only return statements in this simple example.
    if (this.peek().type === "KEYWORD" && this.peek().value === "return") {
      this.consume("KEYWORD", "return");
      const expr = this.parseExpression();
      this.consume("SYMBOL", ";");
      return { type: "ReturnStatement", expression: expr };
    }
    // Otherwise, we could parse other statements.
    throw new Error(`Unsupported statement at line ${this.peek().line}`);
  }
}

module.exports = Parser;
