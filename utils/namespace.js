/**
 * 
 * @param {*} namespace 
 * @param {*} block 
 * @param {*} blockSuffix 
 * @param {*} element 
 * @param {*} modifier 
 * @returns
 */
const _bem = (
  namespace,
  block,
  blockSuffix,
  element,
  modifier
) => {
  let cls = `${namespace}-${block}`
  if (blockSuffix) {
    cls += `-${blockSuffix}`
  }
  if (element) {
    cls += `__${element}`
  }
  if (modifier) {
    cls += `--${modifier}`
  }
  return cls
}
/**
 * 
 * @param {*} block
 * @param {*} namespace
 */
export const handleNamespace = (
  block,
  namespace = "u2"
) => {
  const b = (blockSuffix = '') =>
    _bem(namespace, block, blockSuffix, '', '')
  const e = (element) =>
    element ? _bem(namespace, block, "", element, "") : ""
  const m = (modifier) =>
    modifier ? _bem(namespace, block, "", "", modifier) : ""
  return {
    namespace,
    b,
    e,
    m
  }
}
