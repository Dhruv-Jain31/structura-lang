//Manages variable scope and execution context
// src/runtime/environment.js
class Environment {
    constructor(parent = null) {
      this.parent = parent;
      this.values = {};
    }
  
    // Define a new variable in the current scope.
    define(name, value) {
      this.values[name] = value;
    }
  
    // Assign to an existing variable (searching upward if needed).
    assign(name, value) {
      if (name in this.values) {
        this.values[name] = value;
      } else if (this.parent !== null) {
        this.parent.assign(name, value);
      } else {
        throw new Error(`Undefined variable '${name}'`);
      }
    }
  
    // Retrieve the value of a variable.
    get(name) {
      if (name in this.values) {
        return this.values[name];
      } else if (this.parent !== null) {
        return this.parent.get(name);
      } else {
        throw new Error(`Undefined variable '${name}'`);
      }
    }
  }
  
  module.exports = Environment;
  