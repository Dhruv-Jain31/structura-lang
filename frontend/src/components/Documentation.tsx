// src/components/Documentation.tsx
import React from 'react';

function Documentation() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-6">Structura Documentation</h1>

      {/* Table of Contents */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Table of Contents</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Introduction</li>
          <li>Language Overview</li>
          <li>Syntax and Semantics</li>
          <li>Data Types and Type Aliases</li>
          <li>Function Declarations and Calls</li>
          <li>Control Flow Constructs</li>
          <li>Array Literals and Variable Declarations</li>
          <li>Compiler Architecture</li>
          <li>Lexer</li>
          <li>Parser</li>
          <li>Type Checker</li>
          <li>Intermediate Representation (IR) Generator</li>
          <li>IR Optimizer</li>
          <li>IR Compiler</li>
          <li>Built-in Functions and Standard Library</li>
          <li>Using the Compiler</li>
          <li>Command-Line Interface (CLI)</li>
          <li>Web-Based Interface</li>
          <li>Examples</li>
          <li>Troubleshooting and Tips</li>
          <li>Future Work and Extensions</li>
        </ol>
      </section>

      {/* 1. Introduction */}
      <section className="mb-8">
        <h2 className="text-3xl font-bold mb-4">1. Introduction</h2>
        <p className="mb-4">
          Structura is a custom programming language designed with simplicity, strong type checking, and a modern development workflow in mind. Its compiler translates Structura code into JavaScript, enabling rapid prototyping and integration with standard JavaScript environments. This manual explains the language features, compiler components, and how to use the compiler effectively.
        </p>
      </section>

      {/* 2. Language Overview */}
      <section className="mb-8">
        <h2 className="text-3xl font-bold mb-4">2. Language Overview</h2>
        <h3 className="text-2xl font-semibold mb-2">Syntax and Semantics</h3>
        <p className="mb-4">
          Structura is designed with a syntax similar to popular languages like TypeScript and JavaScript. Programs consist of function declarations, type aliases, variable declarations, control flow statements (if/else, for, while), and expressions. Every function declaration includes a parameter list and a return type.
        </p>

        <h3 className="text-2xl font-semibold mb-2">Data Types and Type Aliases</h3>
        <p className="mb-4">
          <strong>Primitive Types:</strong> number, string, boolean, void, any.
        </p>
        <p className="mb-4">
          <strong>Arrays and Unions:</strong> You can create array types by appending <code>[]</code> to a type (e.g. <code>number[]</code>). Unions are specified using the pipe (<code>|</code>) symbol.
        </p>
        <p className="mb-4">
          <strong>Type Aliases:</strong> Type aliases let you define a custom name for a type. For example:
        </p>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded mb-4 overflow-x-auto">
NumberArr = number[];
StringArr = string[];
        </pre>

        <h3 className="text-2xl font-semibold mb-2">Function Declarations and Calls</h3>
        <p className="mb-4">
          Functions are declared with a name, a parameter list (with types), a return type, and an optional body. For built-in functions (those provided by the runtime library), no function body is needed.
        </p>
        <p className="mb-4">Example of a built-in function declaration:</p>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded mb-4 overflow-x-auto">
abs(a: number): number;
        </pre>
        <p className="mb-4">Example of a user-defined function:</p>

        <p className="mb-4">
          <strong>Function Calls:</strong> Calls are made with arguments wrapped in either parentheses or square brackets:
        </p>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded mb-4 overflow-x-auto">
print(24): number;
print(abs(-0.5)): number;
        </pre>
      </section>

      {/* 3. Compiler Architecture */}
      <section className="mb-8">
        <h2 className="text-3xl font-bold mb-4">3. Compiler Architecture</h2>
        <p className="mb-4">
          The Structura compiler is modular and comprises several key stages:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li><strong>Lexer:</strong> Tokenizes the input source code into a stream of tokens (keywords, identifiers, literals, symbols, etc.).</li>
          <li><strong>Parser:</strong> Converts the token stream into an Abstract Syntax Tree (AST) representing the program’s structure.</li>
          <li><strong>Type Checker:</strong> Verifies that the AST is type-safe.</li>
          <li><strong>Intermediate Representation (IR) Generator:</strong> Transforms the AST into an intermediate representation (IR) that simplifies code generation.</li>
          <li><strong>IR Optimizer:</strong> Applies optimization passes on the IR (e.g., constant folding, dead code elimination).</li>
          <li><strong>IR Compiler:</strong> Compiles the optimized IR into JavaScript code.</li>
        </ul>
      </section>

      {/* 4. Built-in Functions and Standard Library */}
      <section className="mb-8">
        <h2 className="text-3xl font-bold mb-4">4. Built-in Functions and Standard Library</h2>
        <p className="mb-4">
          Structura uses a standard runtime library (<code>stdlib.js</code>) that implements built-in functions such as:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li><code>abs(x: number): number</code> – Returns the absolute value of x.</li>
          <li><code>min(a: number, b: number): number</code> – Returns the minimum of two numbers.</li>
          <li><code>max(a: number, b: number): number</code> – Returns the maximum of two numbers.</li>
          <li><code>push(arr: number[], value: number): number</code> – Appends a value to an array and returns the new length.</li>
          <li><code>pop(arr: number[]): number</code> – Removes the last element from an array and returns it.</li>
          <li><code>print(...args: any): void</code> – Prints the arguments to the console.</li>
          <li><code>sumNumbers(arr: number[]): number</code> – Sums the numbers in an array.</li>
          <li><code>concatStrings(arr: string[]): string</code> – Concatenates an array of strings.</li>
        </ul>
        <p className="mb-4">
          The type checker includes these functions in its built-in signatures to verify calls without needing a function body.
        </p>
      </section>

      {/* 5. Using the Compiler */}
      <section className="mb-8">
        <h2 className="text-3xl font-bold mb-4">5. Using the Compiler</h2>
        <h3 className="text-2xl font-semibold mb-2">Command-Line Interface (CLI)</h3>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded mb-4 overflow-x-auto">
node src/index.js examples/hello.struct
        </pre>
        <h3 className="text-2xl font-semibold mb-2">Web-Based Interface</h3>
        <ul className="list-disc list-inside mb-4">
          <li>A code editor for Structura source.</li>
          <li>Buttons to view tokens, the parse tree, and final output.</li>
          <li>A playground to run and see the compiler output live.</li>
        </ul>
      </section>

      {/* 6. Examples */}
      <section className="mb-8">
        <h2 className="text-3xl font-bold mb-4">6. Examples</h2>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded mb-4 overflow-x-auto">
abs(a: number): number;
print(msg: number): number;

// Top-level call:
print(abs(-3)): number;
        </pre>
      </section>

      {/* 7. Troubleshooting and Tips */}
      <section className="mb-8">
        <h2 className="text-3xl font-bold mb-4">7. Troubleshooting and Tips</h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            <strong>Missing Parentheses:</strong> Ensure that your function declarations include proper parentheses around parameter lists.
          </li>
          <li>
            <strong>Type Aliases vs. Array Literals:</strong> Use type aliases for types (e.g. <code>number[]</code>) and array literals for values (e.g. <code>[1,2,3]</code>).
          </li>
          <li>
            <strong>Lexer Merging:</strong> The lexer merges a colon and a TYPE token into a RETURN_TYPE token when a colon follows a closing parenthesis. Ensure your source code adheres to the expected syntax.
          </li>
          <li>
            <strong>Error Messages:</strong> The compiler emits descriptive error messages, indicating the token type and line number where issues occur. Use these messages to pinpoint syntax errors.
          </li>
        </ul>
      </section>

      {/* 8. Future Work and Extensions */}
      <section className="mb-8">
        <h2 className="text-3xl font-bold mb-4">8. Future Work and Extensions</h2>
        <ul className="list-disc list-inside mb-4">
          <li>Extended Type System: Support for generics, interfaces, or enums.</li>
          <li>Improved Control Flow: Adding switch-case statements and error handling (try/catch).</li>
          <li>Module System: Support for importing and exporting code modules.</li>
          <li>Optimization Passes: Additional IR optimizations such as inlining, constant propagation, or dead code elimination.</li>
          <li>Enhanced Web Playground: A fully interactive web-based compiler playground with real-time feedback.</li>
        </ul>
      </section>
    </div>
  );
}

export default Documentation;
