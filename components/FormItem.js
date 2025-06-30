import AsyncValidator from '../utils/async-validator/index.js';
import BasicComponent from '../class/BasicComponent.js';
import { handleNamespace } from '../utils/namespace.js';
export default class FormItem extends BasicComponent {
  constructor () {
    super();
    this.attachShadow({ mode: "open" });
    this.rendered = false;
    this.shadowRoot.innerHTML = `<style>@import "${new URL("FormItem.css", import.meta.url)}";</style>`;
    this._componentName = "U2FormItem";
    this.formContext = null;
    this._prop = null;
  }
  connectedCallback () {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
      const parentElement = this.parentElement;
      if (parentElement === null || parentElement.tagName !== "U2-FORM") {
        throw new Error("From item can only be placed in Form.");
      }
      this.formContext = this.parentElement;
      // TODO: handle the async problem, replace setTimeout
      setTimeout(() => {
        this.formContext.addField(this);
      }, 100)
    }
  }
  get componentName () { return this._componentName; }
  set validationState (state) { this._validationState = state; }
  get validationState () { return this._validationState; }
  set prop (value) { this._prop = value; }
  get prop () { return this._prop; }
  set validateMessage (value) { this._validateMessage = value; }
  get validateMessage () { return this._validateMessage; }
  create () {
    const ns = handleNamespace("form-item");
    const prop = this.getAttribute("prop");
    if (!prop) {
      console.error("Form item must have a prop attribute.");
    } else {
      this.prop = prop;
    }
    const content = document.createElement("div");
    const slot = document.createElement("slot");
    content.setAttribute("class", ns.e("content"));
    content.appendChild(slot);
    this.addToShadowRoot(content);
    // error message
    const message = document.createElement("div");
    message.setAttribute("class", ns.e("error") +" "+ ns.e("supporting"));
    this.addToShadowRoot(message);
    // node:message
    this.MESSAGE = message;
  }
  onValidationSucceeded () {
    this.validationState = "success";
    this.dispatch("validation-completed", {
      prop: this.prop,
      isValid: true,
      message: ""
    });
  }
  onValidationFailed (error) {
    const { errors, fields } = error;
    if (!errors || !fields) {
      console.error(error);
    }
    this.validationState = "error";
    this.validateMessage = errors
      ? errors?.[0]?.message ?? `${this.prop} is required`
      : "";
    this.MESSAGE.innerText = this.validateMessage;
    // notify this item is validated
    this.dispatch("validation-completed", {
      prop: this.prop,
      isValid: false,
      message: this.validateMessage
    })
  }
  async doValidate (rules) {
    const modelName = this.prop;
    const validator = new AsyncValidator({
      [modelName]: rules,
    })
    return validator
      .validate({ [modelName]: this.getFieldValue() }, { firstFields: true })
      .then(() => {
        this.onValidationSucceeded();
        return true;
      })
      .catch((err) => {
        this.onValidationFailed(err);
        return Promise.reject(err);
      })
  }
  async validate (trigger, callback) {
    // skip validation if its resetting
    // if (isResettingField || this.prop) {
    //   return false
    // }

    // const hasCallback = isFunction(callback)
    // if (!validateEnabled.value) {
    //   callback?.(false);
    //   return false;
    // }
    const rules = this.getFilteredRule(trigger);

    if (rules.length === 0) {
      callback?.(true);
      return true;
    }

    this.validationState = "validating";

    return this.doValidate(rules)
      .then(() => {
        callback?.(true);
        return true;
      })
      .catch((err) => {
        const { fields } = err
        callback?.(false, fields)
        // return hasCallback ? false : Promise.reject(fields)
        return true ? false : Promise.reject(fields)
      })
  }
  normalizedRules () {
    // TODO: support multiple rules
    const rules = [];
    const formRules = this.formContext?.rules;
    
    if (formRules && this.prop) {
      const _rule = formRules[this.prop];
      if (_rule) {
        rules.push(..._rule);
      }
    }
    return rules;
  }
  getFilteredRule (trigger) {
    const rules = this.normalizedRules();
    return (
      rules
        .filter((rule) => {
          if (!rule.trigger || !trigger) return true
          if (Array.isArray(rule.trigger)) {
            return rule.trigger.includes(trigger)
          } else {
            return rule.trigger === trigger
          }
        })
        // exclude trigger
        .map(({ trigger, ...rule }) => rule)
    )
  }
  dispatch (eventName, detail) {
    this.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      detail
    }));
  }
  getFieldValue () {
    return this.children[0].value;
  }
  render () {
    this.create();
  }
}
if (!customElements.get("u2-form-item")) {
  customElements.define("u2-form-item", FormItem);
}
