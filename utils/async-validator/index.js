import { messages as defaultMessages, newMessages } from './message.js';
import validators from './validator/index.js';
import {
  asyncMap,
  complementError,
  deepMerge,
  convertFieldsError
} from './util.js';

export default class AsyncValidator {
  static messages = defaultMessages;
  static validators = validators;
  // instance
  _messages = defaultMessages;

  constructor (descriptor) {
    this.define(descriptor);
  }

  define(rules) {
    if (!rules) {
      throw new Error('Cannot configure a schema with no rules');
    }
    if (typeof rules !== 'object' || Array.isArray(rules)) {
      throw new Error('Rules must be an object');
    }
    this.rules = {};

    Object.keys(rules).forEach(name => {
      const item = rules[name];
      this.rules[name] = Array.isArray(item) ? item : [item];
    });
  }
  messages (messages) {
    if (messages) {
      this._messages = deepMerge(newMessages(), messages);
    }
    return this._messages;
  }
  validate (source_, o, oc = () => {}) {
    let source = source_;
    let options = o;
    let callback = oc;
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    if (!this.rules || Object.keys(this.rules).length === 0) {
      if (callback) {
        callback(null, source);
      }
      return Promise.resolve(source);
    }

    function complete(results) {
      let errors = [];
      let fields = {};
      function add(e) {
        if (Array.isArray(e)) {
          errors = errors.concat(...e);
        } else {
          errors.push(e);
        }
      }
      for (let i = 0; i < results.length; i++) {
        add(results[i]);
      }
      if (!errors.length) {
        callback(null, source);
      } else {
        fields = convertFieldsError(errors);
        callback(errors, fields);
      }
    }    
    if (options.messages) {
      let messages = this.messages();
      if (messages === defaultMessages) {
        messages = newMessages();
      }
      deepMerge(messages, options.messages);
      options.messages = messages;
    } else {
      options.messages = this.messages();
    }

    const series = {};
    const keys = options.keys || Object.keys(this.rules);
    keys.forEach(k => {
      const arr = this.rules[k];
      let value = source[k];
      arr.forEach(r => {
        let rule = r;        
        if (typeof rule === "function") {
          rule = {
            validator: rule,
          };
        } else {
          rule = { ...rule };
        }
        // Fill validator if not set. Skip if nothing need to validate
        rule.validator = this.getValidationMethod(rule);
        if (!rule.validator) {
          return;
        }
        rule.field = k;
        rule.fullField = rule.fullField || k;
        rule.type = this.getType(rule);
        series[k] = series[k] || [];
        series[k].push({
          rule,
          value,
          source,
          field: k,
        });
      });
    });
    const errorFields = {};
    const validateFuncBound = this.validateFunc.bind(this, source, options);
    return asyncMap (
      series,
      options,
      (data, doIt) => validateFuncBound(data, doIt),
      results => { complete(results); },
      source
    );
  }
  getValidationMethod (rule) {
    if (typeof rule.validator === "function") {
      return rule.validator;
    }
    const keys = Object.keys(rule);
    const messageIndex = keys.indexOf("message");
    if (messageIndex !== -1) {
      keys.splice(messageIndex, 1);
    }
    if (keys.length === 1 && keys[0] === "required") {
      return validators.required;
    }
    return validators[this.getType(rule)] || undefined;
  }
  getType (rule) {
    if (rule.type === undefined && rule.pattern instanceof RegExp) {
      rule.type = "pattern";
    }
    if (
      typeof rule.validator !== "function" &&
      rule.type &&
      !validators.hasOwnProperty(rule.type)
    ) {
      // TODO: format
      throw new Error(`Unknown rule type ${rule.type}`);
    }
    return rule.type || "string";
  }
  validateFunc (source, options, data, doIt) {
    const rule = data.rule;
    let deep = 
    (rule.type === "object" || rule.type === "array") &&
    (typeof rule.fields === "object" ||
      typeof rule.defaultField === "object");
    deep = deep && (rule.required || (!rule.required && data.value));
    rule.field = data.field;

    function addFullField (key, schema) {
      return {
        ...schema,
        fullField: `${rule.fullField}.${key}`,
        fullFields: rule.fullFields ? [...rule.fullFields, key] : [key],
      }
    }

    function cb (e) {
      let errorList = Array.isArray(e) ? e : [e];
      // TODO: Schema.warning
      if (errorList.length && rule.message !== undefined) {
        errorList = [].concat(rule.message);
      }
      let filledErrors = errorList.map(complementError(rule, source));
      if (options.first && filledErrors.length) {
        errorFields[rule.field] = 1;
        return doIt(filledErrors);
      }

      if (!deep) {
        doIt(filledErrors); // will return reject or resolve
      } else {
        if (rule.required && !data.value) {
          if (rule.message !== undefined) {
            filledErrors = []
              .concat(rule.message)
              .map(complementError(rule, source));
          } else if (options.error) {
            filledErrors = [
              options.error(
                rule,
                // TODO: format
                `${options.messages.required}-${rule.field}`,
              ),
            ];
          }
          return doIt(filledErrors);
        }
      }
      let fieldsSchema = {};
      if (rule.defaultField) {
        Object.keys(data.value).map(key => {
          fieldsSchema[key] = rule.defaultField;
        });
      }
      fieldsSchema = {
        ...fieldsSchema,
        ...data.rule.fields,
      };
      const paredFieldsSchema = {};

      Object.keys(fieldsSchema).forEach(field => {
        const fieldSchema = fieldsSchema[field];
        const fieldSchemaList = Array.isArray(fieldSchema)
          ? fieldSchema
          : [fieldSchema];
        paredFieldsSchema[field] = fieldSchemaList.map(
          addFullField.bind(null, field),
        );
      });
      const schema = new AsyncValidator(paredFieldsSchema);
      // TODO: schema.messages(options.messages);
      if (data.rule.options) {
        data.rule.options.messages = options.messages;
        data.rule.options.error = options.error;
      }
      schema.validate(data.value, data.rule.options || options, errs => {
        const finalErrors = [];
        if (filledErrors && filledErrors.length) {
          finalErrors.push(...filledErrors);
        }
        if (errs && errs.length) {
          finalErrors.push(...errs);
        }
        doIt(finalErrors.length ? finalErrors : null);
      });
    }

    let res;
    // TODO: rule.asyncValidator
    if (rule.validator) {
      try {
        res = rule.validator(rule, data.value, cb, data.source, options);
      } catch (error) {
        console.error?.(error);
        if (!options.suppressValidatorError) {
          setTimeout(() => {
            throw error;
          }, 0);
        }
        cb(error.message);
      }
      if (res === true) {
        cb();
      } else if (res === false) {
        cb(
          typeof rule.message === "function"
            ? rule.message(rule.fullField || rule.field)
            : rule.message || `${rule.fullField || rule.field} fails`,
          );
      } else if (res instanceof Array) {
        cb(res);
      } else if (res instanceof Error) {
        cb(res.message);
      }
    }
    if (res && (res).then) {
      (res).then(
        () => cb(),
        e => cb(e),
      );
    }
  }
}
