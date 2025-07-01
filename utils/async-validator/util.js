
const formatRegExp = /%[sdj%]/g;

function asyncParallelArray (
  arr,
  func,
  callback,
) {
  const results= [];
  let total = 0;
  const arrLength = arr.length;

  function count(errors) {
    results.push(...(errors || []));
    total++;
    if (total === arrLength) {
      callback(results);
    }
  }
  arr.forEach(a => {
    func(a, count);
  });
}
// callback = (errors) => {}
function asyncSerialArray (
  arr,
  func,
  callback,
) {
  let index = 0;
  const arrLength = arr.length;
  function next(errors) {
    if (errors && errors.length) {
      callback(errors);
      return;
    }
    const original = index;
    index = index + 1;
    if (original < arrLength) {
      func(arr[original], next);
    } else {
      callback([]);
    }
  }
  // TODO: the reason of execute next twice?
  next([]);
}
function flattenObjArr (objArr) {
  const ret = [];
  Object.keys(objArr).forEach(k => {
    ret.push(...(objArr[k] || []));
  });
  return ret;
}
export class AsyncValidationError extends Error {
  errors;
  fields;
  constructor (errors, fields) {
    super("Async Validation Error");
    this.errors = errors;
    this.fields = fields;
  }
}
export function convertFieldsError (
  errors
) {
  if (!errors || !errors.length) return null;
  const fields = {};
  errors.forEach(error => {
    const field = error.field;
    fields[field] = fields[field] || [];
    fields[field].push(error);
  });
  return fields;
}
export function format(
  template,
  ...args
) {
  let i = 0;
  const len = args.length;
  if (typeof template === 'function') {
    return template.apply(null, args);
  }
  if (typeof template === 'string') {
    let str = template.replace(formatRegExp, x => {
      if (x === '%%') {
        return '%';
      }
      if (i >= len) {
        return x;
      }
      switch (x) {
        case '%s':
          return String(args[i++]);
        case '%d':
          return Number(args[i++]);
        case '%j':
          try {
            return JSON.stringify(args[i++]);
          } catch (_) {
            return '[Circular]';
          }
          break;
        default:
          return x;
      }
    });
    return str;
  }
  return template;
}
export function asyncMap (objArr, option, func, callback, source) {
  if (option.first) {
    const pending = new Promise((resolve, reject) => {
      const next = (errors) => {
        callback(errors);
        return errors.length
          ? reject(new AsyncValidationError(errors, convertFieldsError(errors)))
          : resolve(source);
      };
      const flattenArr = flattenObjArr(objArr);
      asyncSerialArray(flattenArr, func, next);
    });
    pending.catch(e => e);
    return pending;
  }
  const firstFields =
    option.firstFields === true
      ? Object.keys(objArr)
      : option.firstFields || [];
  const objArrKeys = Object.keys(objArr);
  const objArrLength = objArrKeys.length;
  let total = 0;

  const results = [];
  const pending = new Promise((resolve, reject) => {
    const next = (errors) => {
      results.push.apply(results, errors);
      total++;
      if (total === objArrLength) {
        callback(results);
        return results.length
          ? reject(
              new AsyncValidationError(results, convertFieldsError(results)),
            )
          : resolve(source);
      }
    };
    if (!objArrKeys.length) {
      callback(results);
      resolve(source);
    }
    objArrKeys.forEach(key => {
      const arr = objArr[key];
      if (firstFields.indexOf(key) !== -1) {
        asyncSerialArray(arr, func, next);
      } else {
        asyncParallelArray(arr, func, next);
      }
    });
  });
  pending.catch(e => e);
  return pending;
}
function isErrorObj(
  obj
){
  return !!(obj && obj.message !== undefined);
}
export function complementError (rule, source) {
  return (oe) => {
    let fieldValue;
    if (rule.fullFields) {
      // TODO: get field value
      fieldValue = getValue(source, rule.fullFields) || "";
    } else {
      fieldValue = source[(oe).field || rule.fullField];
    }
    if (isErrorObj(oe)) {
      oe.field = oe.field || rule.fullField;
      oe.fieldValue = fieldValue;
      return oe;
    }
    return {
      message: typeof oe === "function" ? oe() : oe,
      fieldValue,
      field: oe.field || rule.fullField,
    };
  };
}
export function deepMerge (target, source) {
  if (source) {
    for (const s in source) {
      if (source.hasOwnProperty(s)) {
        const value = source[s];
        if (typeof value === "object" && typeof target[s] === "object") {
          target[s] = {
            ...target[s],
            ...value,
          };
        } else {
          target[s] = value;
        }
      }
    }
  }
  return target;
}
