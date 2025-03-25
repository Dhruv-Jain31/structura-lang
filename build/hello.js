(function() {
const stdlib = require("../src/runtime/stdlib");

// Type alias: NumberArr = number[]
// Type alias: StringArr = string[]

function abs() {
  return stdlib.abs(...arguments);
}

function sumNumbers(arr) {
  return stdlib.sumNumbers(...arguments);
}

function concatStrings(arr) {
  return stdlib.concatStrings(...arguments);
}

function myFunc(a) {
  return a + 1;
}

function print() {
  return stdlib.print(...arguments);
}

})();
