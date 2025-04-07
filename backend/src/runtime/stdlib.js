// src/runtime/stdlib.js

function abs(x) {
  if (typeof x !== "number") throw new Error(`abs() expects number.`);
  return Math.abs(x);
}

function min(a, b) {
  if (typeof a !== "number" || typeof b !== "number")
    throw new Error("min() expects two numbers.");
  return Math.min(a, b);
}

function max(a, b) {
  if (typeof a !== "number" || typeof b !== "number")
    throw new Error("max() expects two numbers.");
  return Math.max(a, b);
}

function push(arr, value) {
  if (!Array.isArray(arr)) throw new Error("push() expects array.");
  arr.push(value);
  return arr.length;
}

function pop(arr) {
  if (!Array.isArray(arr)) throw new Error("pop() expects array.");
  return arr.pop();
}

function print(...args) {
  console.log(...args);
}

function sumNumbers(arr) {
  if (!Array.isArray(arr) || !arr.every(n => typeof n === "number"))
    throw new Error("sumNumbers() expects array of numbers.");
  return arr.reduce((sum, num) => sum + num, 0);
}

function concatStrings(arr) {
  if (!Array.isArray(arr) || !arr.every(s => typeof s === "string"))
    throw new Error("concatStrings() expects array of strings.");
  return arr.join("");
}

function clamp(value, min, max) {
  if ([value, min, max].some(v => typeof v !== "number"))
    throw new Error("clamp() expects three numbers.");
  return Math.max(min, Math.min(max, value));
}

function sqrt(x) {
  if (typeof x !== "number") throw new Error("sqrt() expects a number.");
  return Math.sqrt(x);
}

function reverse(arr) {
  if (!Array.isArray(arr) && typeof arr !== "string")
    throw new Error("reverse() expects array or string.");
  return typeof arr === "string"
    ? arr.split("").reverse().join("")
    : [...arr].reverse();
}

function len(x) {
  if (typeof x !== "string" && !Array.isArray(x))
    throw new Error("len() expects a string or array.");
  return x.length;
}

function toUpperCase(str) {
  if (typeof str !== "string") throw new Error("toUpperCase() expects string.");
  return str.toUpperCase();
}

function toLowerCase(str) {
  if (typeof str !== "string") throw new Error("toLowerCase() expects string.");
  return str.toLowerCase();
}

function substring(str, start, end) {
  if (typeof str !== "string") throw new Error("substring() expects string.");
  return str.substring(start, end);
}

function replace(str, searchValue, newValue) {
  if (typeof str !== "string" || typeof searchValue !== "string" || typeof newValue !== "string")
    throw new Error("replace() expects three strings.");
  return str.replace(searchValue, newValue);
}

function includes(container, item) {
  if (typeof container !== "string" && !Array.isArray(container))
    throw new Error("includes() expects string or array.");
  return container.includes(item);
}

function startsWith(str, prefix) {
  if (typeof str !== "string" || typeof prefix !== "string")
    throw new Error("startsWith() expects two strings.");
  return str.startsWith(prefix);
}

function endsWith(str, suffix) {
  if (typeof str !== "string" || typeof suffix !== "string")
    throw new Error("endsWith() expects two strings.");
  return str.endsWith(suffix);
}

function unique(arr) {
  if (!Array.isArray(arr)) throw new Error("unique() expects array.");
  return [...new Set(arr)];
}

function hcf(a, b) {
  if (!Number.isInteger(a) || !Number.isInteger(b))
    throw new Error("hcf() expects two integers.");
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return Math.abs(a);
}

function lcm(a, b) {
  if (!Number.isInteger(a) || !Number.isInteger(b))
    throw new Error("lcm() expects two integers.");
  return Math.abs((a * b) / hcf(a, b));
}

function capitalize(str) {
  if (typeof str !== "string") throw new Error("capitalize() expects string.");
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function isURL(str) {
  if (typeof str !== "string") throw new Error("isURL() expects string.");
  const pattern = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6})(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)*\/?$/i;
  return pattern.test(str);
}

function coalesce(...values) {
  return values.find(v => v !== null && v !== undefined);
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
  clamp,
  sqrt,
  reverse,
  len,
  toUpperCase,
  toLowerCase,
  substring,
  replace,
  includes,
  startsWith,
  endsWith,
  unique,
  hcf,
  lcm,
  capitalize,
  isURL,
  coalesce,
};
