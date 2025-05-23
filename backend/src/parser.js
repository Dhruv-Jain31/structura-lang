// parser.js
const Lexer = require("./lexer.js");

// Reserved built-in function names that cannot be re-declared by the user.
const RESERVED_BUILTINS = [
  "abs",
  "print",
  "max",
  "min",
  "hcf",
  "lcm",
  "capitalize",
  "isURL",
  "coalesce",
  "slugify",
  // Optionally include other built-ins if needed.
];

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
    // Assume current token is function name. Next token must be "(".
    const parenToken = this.tokens[this.position + 1];
    if (!parenToken || parenToken.value !== "(") return false;
    const tokenAfterParen = this.tokens[this.position + 2];
    if (!tokenAfterParen) return false;
    if (tokenAfterParen.value === ")") return true; // empty list
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

  // Parse a function declaration.
  parseFunction() {
    const funcNameToken = this.consumeAny(["KEYWORD", "IDENTIFIER"]);
    const funcName = funcNameToken.value;
    const funcLine = funcNameToken.line;

    // Check against reserved built-in names.
    if (RESERVED_BUILTINS.includes(funcName)) {
      throw new Error(`Cannot override built-in function '${funcName}' at line ${funcNameToken.line}.`);
    }

    this.consume("SYMBOL", "(");
    const args = this.parseArguments(true); // parameter context = true
    this.consume("SYMBOL", ")");
    
    // Lexer merges ":" and TYPE/IDENTIFIER into a RETURN_TYPE token.
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

  // Parse a call expression statement. In calls, all arguments are parsed as expressions.
  parseCallExpressionStatement() {
    const calleeToken = this.consumeAny(["KEYWORD", "IDENTIFIER"]);
    const callee = { type: "Identifier", name: calleeToken.value, line: calleeToken.line };
    this.consume("SYMBOL", "(");
    const args = this.parseArguments(false); // expression context = false
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

  // parseArguments: isParamContext flag tells us whether to parse parameters or expressions.
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

  // In parameter context, if an IDENTIFIER is followed by ":" then parse a Parameter node.
  // Otherwise, parse as an expression.
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

  // parsePrimary is updated to support member access and nested call expressions.
  parsePrimary() {
    let expr;
    const token = this.peek();
    if (token.type === "NUMBER_LITERAL") {
      expr = { type: "NumberLiteral", value: this.consume("NUMBER_LITERAL").value, line: token.line };
    } else if (token.type === "STRING_LITERAL") {
      expr = { type: "StringLiteral", value: this.consume("STRING_LITERAL").value, line: token.line };
    } else if (token.type === "IDENTIFIER" || (token.type === "KEYWORD" && token.value !== "return")) {
      expr = { type: "Identifier", name: this.consume(token.type).value, line: token.line };
    } else if (token.value === "(") {
      this.consume("SYMBOL", "(");
      expr = this.parseExpression();
      this.consume("SYMBOL", ")");
    } else {
      throw new Error(`Unexpected token in primary expression: ${token.type} (${token.value}) at line ${token.line}`);
    }

    // Support for member access and nested call expressions.
    while (true) {
      const next = this.peek();
      // Member access: handle dot operator.
      if (next.value === ".") {
        this.consume("SYMBOL", ".");
        const propertyToken = this.consume("IDENTIFIER");
        expr = {
          type: "MemberExpression",
          object: expr,
          property: { type: "Identifier", name: propertyToken.value, line: propertyToken.line },
          line: propertyToken.line
        };
        continue;
      }
      // Function call (either on the original identifier or as a result of member access)
      if (next.value === "(") {
        this.consume("SYMBOL", "(");
        const args = this.parseArguments(false); // expression context for call arguments
        this.consume("SYMBOL", ")");
        expr = {
          type: "CallExpression",
          callee: expr,
          arguments: args,
          line: expr.line
        };
        continue;
      }
      break;
    }
    return expr;
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
