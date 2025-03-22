// lexer.js
class Lexer {
  constructor(code) {
    this.code = code;
    this.tokens = [];
    this.position = 0;
    this.line = 1; // Start at line 1
  }

  // Updated token patterns:
  tokenPatterns = [
    // Comments (ignored)
    { type: "COMMENT", regex: /\/\/[^\n]*/, ignore: true },           // single-line comments
    { type: "COMMENT", regex: /\/\*[\s\S]*?\*\//, ignore: true },        // multi-line comments
    { 
      type: "KEYWORD", 
      regex: /\b(min|max|print|len|reverse|abs|sqrt|sum|push|pop|toUpperCase|toLowerCase|substring|replace|includes|clamp|startsWith|endsWith|unique|range|return)\b/ 
    },
    { 
      // TYPE regex supports basic types, optional array brackets, and unions.
      type: "TYPE", 
      regex: /(?:number|string|boolean|void|any)(?:\[\])*(?:\|(?:number|string|boolean|void|any)(?:\[\])*)*/
    },
    { type: "IDENTIFIER", regex: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/ },
    { type: "NUMBER_LITERAL", regex: /\b\d+(\.\d+)?\b/ },
    { 
      // Combined regex for double or single quoted strings.
      type: "STRING_LITERAL", 
      regex: /(?:"([^"]*)"|'([^']*)')/ 
    },
    { type: "SYMBOL", regex: /[():,;=]/ },
    // Multi-character operators
    { type: "OPERATOR", regex: /&&|\|\|/ },
    // Single-character operators (includes | if it appears outside a type context)
    { type: "OPERATOR", regex: /[+\-*/<>!|]/ },
    { type: "WHITESPACE", regex: /\s+/, ignore: true },
  ];

  tokenize() {
    while (this.position < this.code.length) {
      let matchFound = false;

      for (let { type, regex, ignore } of this.tokenPatterns) {
        const result = this.code.slice(this.position).match(regex);
        if (result && result.index === 0) {
          const value = result[0];

          // Always update line count even for ignored tokens.
          if (value.includes("\n")) {
            this.line += value.split("\n").length - 1;
          }

          if (!ignore) {
            this.tokens.push({ type, value: value.trim(), line: this.line });
          }
          this.position += value.length;
          matchFound = true;
          break;
        }
      }

      if (!matchFound) {
        throw new Error(
          `Unexpected character at position ${this.position}: '${this.code[this.position]}' (line ${this.line})`
        );
      }
    }

    // Merge ":" and following TYPE into a RETURN_TYPE token.
    const processedTokens = [];
    for (let i = 0; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      if (
        token.type === "SYMBOL" && token.value === ":" &&
        i > 0 &&
        this.tokens[i - 1].type === "SYMBOL" && this.tokens[i - 1].value === ")" &&
        i + 1 < this.tokens.length &&
        this.tokens[i + 1].type === "TYPE"
      ) {
        processedTokens.push({ type: "RETURN_TYPE", value: this.tokens[i + 1].value, line: this.tokens[i + 1].line });
        i++; // Skip the TYPE token.
      } else {
        processedTokens.push(token);
      }
    }
    processedTokens.push({ type: "EOF", value: null, line: this.line });
    this.tokens = processedTokens;
    return this.tokens;
  }
}

module.exports = Lexer;
