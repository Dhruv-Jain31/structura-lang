const stdlib = require("../src/runtime/stdlib");

function print() {
  return stdlib.print(...arguments);
}

