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
  create () {
    const ns = handleNamespace("form-item");
    const content = document.createElement("div");
    const slot = document.createElement("slot");
    content.setAttribute("class", ns.e("content"));
    content.appendChild(slot);
    this.addToShadowRoot(content);
  }
  async doValidate (rules) {
  }
  async validate (trigger, callback) {
  }
  render () {
    this.create();
  }
}
if (!customElements.get("u2-form-item")) {
  customElements.define("u2-form-item", FormItem);
}
