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
  console.log(...args); // Print to console
}

function sumNumbers(arr) {
  if (!Array.isArray(arr) || !arr.every(item => typeof item === 'number')) {
    throw new Error("sumNumbers() expects an array of numbers.");
  }
  return arr.reduce((sum, num) => sum + num, 0);
}

function concatStrings(arr) {
  if (!Array.isArray(arr) || !arr.every(item => typeof item === 'string')) {
    throw new Error("concatStrings() expects an array of strings.");
  }
  return arr.join('');
}

module.exports = {
  abs,
  min,
  max,
  push,
  pop,
  print,
  sumNumbers,
  concatStrings,
  myFunc,
};