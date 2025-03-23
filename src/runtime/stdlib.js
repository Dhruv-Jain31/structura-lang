// Implementations of built-in functions (min, max, print, etc.)

// src/runtime/stdlib.js

function abs(x) {
    if (typeof x !== "number") {
      throw new Error(`abs() expects a number, got ${typeof x}`);
    }
    return Math.abs(x);
  }
  
  function min(a, b) {
    if (typeof a !== "number" || typeof b !== "number") {
      throw new Error("min() expects two numbers.");
    }
    return Math.min(a, b);
  }
  
  function max(a, b) {
    if (typeof a !== "number" || typeof b !== "number") {
      throw new Error("max() expects two numbers.");
    }
    return Math.max(a, b);
  }
  
  function push(arr, value) {
    if (!Array.isArray(arr)) {
      throw new Error("push() expects the first argument to be an array.");
    }
    arr.push(value);
    return arr.length;
  }
  
  function pop(arr) {
    if (!Array.isArray(arr)) {
      throw new Error("pop() expects an array.");
    }
    return arr.pop();
  }
  
  function print(...args) {
    // For runtime type-checking, you could add validations here if desired.
    console.log(...args);
  }
  
  module.exports = {
    abs,
    min,
    max,
    push,
    pop,
    print,
    // Additional built-in functions can be added here.
  };
  