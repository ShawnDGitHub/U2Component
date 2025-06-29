import BasicComponent from '../class/BasicComponent.js';
import { handleNamespace } from '../utils/namespace.js';
export default class Form extends BasicComponent {
  constructor () {
    super();
    this.attachShadow({ mode: "open" });
    this.rendered = false;
    this.shadowRoot.innerHTML = `<style>@import "${new URL("Form.css", import.meta.url)}";</style>`;
    this._componentName = "U2Form";
    this.formItemContext = null;
    this.fields = [];
  }
  connectedCallback () {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
      this.formItemContext = this.childNodes[1];
    }
  }
  get componentName () { return this._componentName; }
  create () {
    const form = document.createElement("form");
    const slot = document.createElement("slot");
    form.appendChild(slot);
    this.addToShadowRoot(form);
  }
  addField (field) {
    this.fields.push(field);
  }
  render () {
    this.create();
  }
}
if (!customElements.get("u2-form")) {
  customElements.define("u2-form", Form);
}
