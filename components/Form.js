import BasicComponent from '../class/BasicComponent.js';
export default class Form extends BasicComponent {
  constructor () {
    super();
    this.attachShadow({ mode: "open" });
    this.rendered = false;
    this.shadowRoot.innerHTML = `<style>@import "${new URL("Form.css", import.meta.url)}";</style>`;
    this._componentName = "U2Form";
    this.formItemContext = null;
    this.fields = [];
    this._allValidationState = new Map();
    this._rules = {}; // for validation
  }
  connectedCallback () {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
      this.formItemContext = this.childNodes[1];
    }
    this.addEventListener("validation-completed", this._handleValidated);
  }
  disconnectedCallback() {
    this.removeEventListener("validation-completed", this._handleValidated);
  }
  get componentName () { return this._componentName; }
  get allValidationState () { return this._allValidationState; }
  set rules (rules) { this._rules = rules; }
  get rules () { return this._rules; }
  create () {
    const form = document.createElement("form");
    const slot = document.createElement("slot");
    form.appendChild(slot);
    this.addToShadowRoot(form);
  }
  addField (field) {
    if (field.prop === null) {
      console.warn(`Forget to set ${field.tagName}'s prop.`)
    }
    if (this._allValidationState.has(field.prop)) {
      throw new Error(`${field.prop} already added to form.`)
    }
    this.fields.push(field);
    this._allValidationState.set(field.prop, {
      isValid: "initial",
      message: ""
    });
  }
  async validateField (modelProps = [], callback) {
    let result = false;
    try {
      result = await this.doValidateField(modelProps);
      await callback?.(result);
      return result;
    } catch (e) {
      if (e instanceof Error) throw e;
      const invalidFields = e;
      // TODO: scroll into view
      !result && (await callback?.(false, invalidFields));
      // TODO: shouldThrow
      return true && Promise.reject(invalidFields);
    }
  }
  async doValidateField (props) {
    const fields = this.fields; // TODO: obtainValidateFields(props)
    if (fields.length === 0) return true;
    let validationErrors = {};
    for (const field of fields) {
      try {
        await field.validate("");
        if (field.validateState === "error") {
          field.resetField()
        }
      } catch (fields) {
        validationErrors = {
          ...validationErrors,
          ...(fields),
        };
      }
    }
    if (Object.keys(validationErrors).length === 0) return true;
    return Promise.reject(validationErrors);
  }
  async validate (callback) {
    this.validateField(undefined, callback);
  }
  _handleValidated (event) {
    const { prop, isValid, message } = event.detail;
    this._allValidationState.set(prop, { isValid, message });
  }
  render () {
    this.create();
  }
}
if (!customElements.get("u2-form")) {
  customElements.define("u2-form", Form);
}
