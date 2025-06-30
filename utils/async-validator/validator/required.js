
import rules from '../rule/index.js';
const required = (rule, value, callback, source, options) => {
  const errors = [];
  const type = Array.isArray(value) ? "array" : typeof value;
  rules.required(rule, value, source, errors, options, type);
  // callback is the cb in validate() of index.js
  callback(errors);
};  

export default required;
