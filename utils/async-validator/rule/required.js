const required = (rule, value, source, errors, options, type) => {
  if (
    rule.required &&
    (!source.hasOwnProperty(rule.field) ||
      isEmptyValue(value, type || rule.type))
  ) {
    // TODO: format
    errors.push(`error -${options.messages.required}, ${rule.fullField}`);
  }    
};
function isEmptyValue (value, type) {
  if (value === undefined || value === null) {
    return true;
  }
  if (type === "array" && Array.isArray(value) && !value.length) {
    return true;
  }
  return false;
}
export default required;
