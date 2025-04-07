(function() {
const stdlib = require("../src/runtime/stdlib");


function abs() {
  return stdlib.abs(...arguments);
}

function print() {
  return stdlib.print(...arguments);
}

function max() {
  return stdlib.max(...arguments);
}

function min() {
  return stdlib.min(...arguments);
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

function isURL() {
  return stdlib.isURL(...arguments);
}

function coalesce() {
  return stdlib.coalesce(...arguments);
}

function slugify() {
  return stdlib.slugify(...arguments);
}

// Top-level statements:
print(4);
print(abs(-0.5));
print(max(1, 10));
print(min(0, 5));
print(hcf(10, 5));
print(lcm(4, 6));
print(capitalize("hello"));
print(coalesce(0, null, "fallback"));
})();
