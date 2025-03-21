class Lexer {
    constructor(code) {
      this.code = code;
      this.tokens = [];
      this.position = 0;
    }

    tokenPatterns = [
      { type: "KEYWORD", regex: /\b(min|max|print|len|reverse|abs|sqrt|sum|push|pop|toUpperCase|toLowerCase|substring|replace|includes|clamp|startsWith|endsWith|unique|range)\b/ },
      { type: "TYPE", regex: /\b(number|string|boolean|void|any|any\[\])\b/ },
      { type: "IDENTIFIER", regex: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/ },
      { type: "NUMBER_LITERAL", regex: /\b\d+(\.\d+)?\b/ },
      { type: "STRING_LITERAL", regex: /"([^"]*)"/ },
      { type: "SYMBOL", regex: /[():,;={}\[\]]/ },
      { type: "OPERATOR", regex: /[+\-*/=]/ },
      { type: "WHITESPACE", regex: /\s+/, ignore: true },
    ];

    tokenize() {
      while (this.position < this.code.length) {
        let match = false;

        for (let { type, regex, ignore } of this.tokenPatterns) {
          const result = this.code.slice(this.position).match(regex);
          if (result && result.index === 0) {
            if (!ignore) {
              const value = result[0].trim();
              this.tokens.push({ type, value });
            }
            this.position += result[0].length;
            match = true;
            break;
          }
        }

        if (!match) {
          throw new Error(`Unexpected character at position ${this.position}: '${this.code[this.position]}'`);
        }
      }
  
      // Post-process tokens to merge return type tokens.
      // If a ":" token immediately follows a ")" and is followed by a TYPE token,
      // then merge ":" and TYPE into a RETURN_TYPE token.
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
          // Merge into a RETURN_TYPE token whose value is just the type.
          processedTokens.push({ type: "RETURN_TYPE", value: this.tokens[i + 1].value });
          i++; // Skip the TYPE token
        } else {
          processedTokens.push(token);
        }
      }

      processedTokens.push({ type: "EOF", value: null });
      this.tokens = processedTokens;
      return this.tokens;
    }
  }

  module.exports = Lexer;
