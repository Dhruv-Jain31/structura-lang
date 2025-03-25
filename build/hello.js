(function() {
const stdlib = require("../src/runtime/stdlib");

// Type alias: NumberArr = [object Object]
// Type alias: StringArr = [object Object]

function abs(a) {
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
