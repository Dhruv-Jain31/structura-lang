(function() {
const stdlib = require("../src/runtime/stdlib");


function abs(a) {
  return stdlib.abs(...arguments);
}

function print(msg) {
  return stdlib.print(...arguments);
}

function max(a, b) {
  return stdlib.max(...arguments);
}

function min(a, b) {
  return stdlib.min(...arguments);
}

// Top-level statements:
print(4);
print(abs(0.5));
print(max(1, 10));
print(min(0, 5));
})();
