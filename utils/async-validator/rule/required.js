import { format } from '../util.js'
const required = (rule, value, source, errors, options, type) => {
  if (
    rule.required &&
    (!source.hasOwnProperty(rule.field) ||
      isEmptyValue(value, type || rule.type))
  ) {
    errors.push(format(options.messages.required, rule.fullField));
  }    
};
function isEmptyValue (value, type) {
  // for required value, "" is not acceptable
  if (value === undefined || value === null || value === "") {
    return true;
  }
  if (type === "array" && Array.isArray(value) && !value.length) {
    return true;
  }
  return false;
}
export default required;
