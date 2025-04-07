(function() {
const stdlib = require("../src/runtime/stdlib");


function print() {
  return stdlib.print(...arguments);
}

function hcf() {
  return stdlib.hcf(...arguments);
}

function lcm() {
  return stdlib.lcm(...arguments);
}

function capitalize() {
  return stdlib.capitalize(...arguments);
}

// Top-level statements:
print(hcf(10, 5));
print(lcm(4, 6));
print(capitalize("hello"));
})();
