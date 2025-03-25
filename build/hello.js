(function() {
const stdlib = require("../src/runtime/stdlib");

// Type alias: NumberArr = [object Object]
// Type alias: StringArr = [object Object]

function abs(a) {
  return stdlib.abs(a);
}

function sumNumbers(arr) {
  return stdlib.sumNumbers(arr);
}

function concatStrings(arr) {
  return stdlib.concatStrings(arr);
}

function myFunc(a) {
  return a + 1;
}

function print() {
  return stdlib.print();
}

})();
