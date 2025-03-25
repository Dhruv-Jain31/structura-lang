(function() {
const stdlib = require("../src/runtime/stdlib");

// Type alias: NumberArr = [object Object]
// Type alias: StringArr = [object Object]

function abs(a) {
  return stdlib.abs(...arguments);
}

function print(msg) {
  return stdlib.print(...arguments);
}

function sumNumbers(arr) {
  return stdlib.sumNumbers(...arguments);
}

function concatStrings(arr) {
  return stdlib.concatStrings(...arguments);
}

// Top-level statements:
print("This code runs without an explicit main function!");
abs(0.5);
})();
