class Lexer {
    constructor(code) {
        this.code = code;
        this.tokens = [];
        this.position = 0;
    }

    // Define token patterns using regex
    tokenPatterns = [
        { type: "KEYWORD",
            regex: /\b(min|max|print|len|reverse|abs|sqrt|sum|push|pop|toUpperCase|toLowerCase|substring|replace|includes|clamp|startsWith|endsWith|unique|range)\b/ 
        },
        { type: "TYPE", regex: /\b(number|string|boolean|any|void)\b/ },
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
                        this.tokens.push({ type, value: result[0] });
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

        this.tokens.push({ type: "EOF", value: null });
        return this.tokens;
    }
}

// Test the Lexer
const code = `
min(a: number, b: number);
print("Hello, Structura!");
push(arr, 10);
`;

const lexer = new Lexer(code);
console.log(lexer.tokenize());
