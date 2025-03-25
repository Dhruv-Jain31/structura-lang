// parser.js
const Lexer = require("./lexer.js");

// Operator precedence mapping (for binary expressions)
const PRECEDENCE = {
  "||": 1,
  "&&": 2,
  "==": 3,
  "!=": 3,
  "<": 4,
  ">": 4,
  "<=": 4,
  ">=": 4,
  "+": 5,
  "-": 5,
  "*": 6,
  "/": 6,
};

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

  // Checks whether the tokens after "(" indicate a parameter list.
  isParameterList() {
    // We expect the next token after "(" to be the start of a parameter list
    // if it is an IDENTIFIER followed by ":".
    const parenToken = this.tokens[this.position + 1];
    if (!parenToken || parenToken.value !== "(") return false;
    const tokenAfterParen = this.tokens[this.position + 2];
    if (!tokenAfterParen) return false;
    if (tokenAfterParen.value === ")") return true; // empty list, which is fine
    const tokenColon = this.tokens[this.position + 3];
    return tokenAfterParen.type === "IDENTIFIER" && tokenColon && tokenColon.value === ":";
  }

  // Main parse method: distinguishes type alias declarations, function declarations, and call expressions.
  parse() {
    const ast = [];
    while (this.peek().type !== "EOF") {
      const current = this.peek();
      if (current.type === "IDENTIFIER" || current.type === "KEYWORD") {
        const next = this.tokens[this.position + 1];
        if (next && next.value === "=") {
          ast.push(this.parseTypeAlias());
        } else if (next && next.value === "(") {
          // Use lookahead to decide:
          if (this.isParameterList()) {
            ast.push(this.parseFunction());
          } else {
            ast.push(this.parseCallExpressionStatement());
          }
        } else {
          throw new Error(`Unexpected token ${current.type} (${current.value}) at line ${current.line}`);
        }
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
      line,
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

  // Parse a function declaration. In a declaration, parameters are parsed as Parameter nodes.
  parseFunction() {
    const funcNameToken = this.consumeAny(["KEYWORD", "IDENTIFIER"]);
    const funcName = funcNameToken.value;
    const funcLine = funcNameToken.line;

    this.consume("SYMBOL", "(");
    const args = this.parseArguments(true); // parameter context
    this.consume("SYMBOL", ")");

    // Lexer merges ":" and TYPE into a RETURN_TYPE token.
    const returnTypeToken = this.consume("RETURN_TYPE");
    const returnType = this.parseTypeAnnotationFromString(returnTypeToken.value);

    let body = null;
    if (this.peek().value === "{") {
      body = this.parseFunctionBody();
    } else {
      this.consume("SYMBOL", ";");
    }

    return {
      type: "FunctionDeclaration",
      name: funcName,
      arguments: args,
      returnType,
      body,
      line: funcLine,
    };
  }

  // Parse a call expression statement. In call expressions, all arguments are parsed as expressions.
  parseCallExpressionStatement() {
    const calleeToken = this.consumeAny(["KEYWORD", "IDENTIFIER"]);
    const callee = { type: "Identifier", name: calleeToken.value, line: calleeToken.line };
    this.consume("SYMBOL", "(");
    const args = this.parseArguments(false); // expression context
    this.consume("SYMBOL", ")");
    const returnTypeToken = this.consume("RETURN_TYPE");
    const returnType = this.parseTypeAnnotationFromString(returnTypeToken.value);
    this.consume("SYMBOL", ";");
    return {
      type: "ExpressionStatement",
      expression: {
        type: "CallExpression",
        callee,
        arguments: args,
      },
      returnType,
      line: calleeToken.line,
    };
  }

  // parseArguments accepts a flag: true means parameter context (for declarations), false means expression context (for calls).
  parseArguments(isParamContext) {
    const args = [];
    if (this.peek().value === ")") return args;
    args.push(this.parseArgument(isParamContext));
    while (this.peek().value === ",") {
      this.consume("SYMBOL", ",");
      args.push(this.parseArgument(isParamContext));
    }
    return args;
  }

  // In parameter context, if we see an IDENTIFIER followed by ":", parse a Parameter node.
  // Otherwise, always parse as an expression.
  parseArgument(isParamContext) {
    if (
      isParamContext &&
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

  // Expression parsing with support for binary expressions.
  parseExpression() {
    return this.parseBinaryExpression(0);
  }

  parsePrimary() {
    const token = this.peek();
    if (token.type === "NUMBER_LITERAL") {
      return { type: "NumberLiteral", value: this.consume("NUMBER_LITERAL").value, line: token.line };
    }
    if (token.type === "STRING_LITERAL") {
      return { type: "StringLiteral", value: this.consume("STRING_LITERAL").value, line: token.line };
    }
    if (token.type === "IDENTIFIER") {
      return { type: "Identifier", name: this.consume("IDENTIFIER").value, line: token.line };
    }
    if (token.value === "(") {
      this.consume("SYMBOL", "(");
      const expr = this.parseExpression();
      this.consume("SYMBOL", ")");
      return expr;
    }
    throw new Error(`Unexpected token in primary expression: ${token.type} (${token.value}) at line ${token.line}`);
  }

  parseBinaryExpression(minPrecedence) {
    let left = this.parsePrimary();
    while (true) {
      const token = this.peek();
      if (token.type !== "OPERATOR") break;
      const op = token.value;
      const precedence = PRECEDENCE[op];
      if (precedence === undefined || precedence < minPrecedence) break;
      this.consume("OPERATOR", op);
      let right = this.parseBinaryExpression(precedence + 1);
      left = { type: "BinaryExpression", operator: op, left, right, line: token.line };
    }
    return left;
  }

  // parseStatement: treat an expression followed by a semicolon as an ExpressionStatement.
  parseStatement() {
    const token = this.peek();
    if (token.type === "KEYWORD" && token.value === "return") {
      this.consume("KEYWORD", "return");
      const expr = this.parseExpression();
      this.consume("SYMBOL", ";");
      return { type: "ReturnStatement", expression: expr };
    } else {
      const expr = this.parseExpression();
      this.consume("SYMBOL", ";");
      return { type: "ExpressionStatement", expression: expr };
    }
  }

  parseFunctionBody() {
    const body = [];
    this.consume("SYMBOL", "{");
    while (this.peek().value !== "}") {
      body.push(this.parseStatement());
    }
    this.consume("SYMBOL", "}");
    return body;
  }
}

module.exports = Parser;
