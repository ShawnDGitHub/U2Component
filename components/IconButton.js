import BasicComponent from "../class/BasicComponent.js";
export default class IconButton extends BasicComponent {
  constructor () {
    super();
    this.attachShadow({ mode: "open" });
    this.rendered = false;
    this.shadowRoot.innerHTML = `<style>@import "${new URL("IconButton.css", import.meta.url)}";</style><slot></slot>`;
  }
  connectedCallback () {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
  static get observedAttributes() { 
    return ["disabled"];
  }
  attributeChangedCallback (name, oldValue, newValue) {
    switch(name) {
      case "disabled": this.handleDisableState(); break;
      default: break;
    } 
  }
  createButton () { 
    this.handleDisableState();
    this.setAttribute('type', "button");
  }
  handleDisableState () {
    const disabled = this.getAttribute("disabled");
    if (disabled === "" || disabled) {
      this.setAttribute("tabindex", -1);
      this.setAttribute("aria-disabled", true);
    } else {
      this.setAttribute("aria-disabled", false);
      this.setAttribute("tabindex", 0);
    }
  }
  render () {
    this.handleDisableState();
    this.createButton();
  }
}
if (!customElements.get("u2-icon-button")) {
  customElements.define("u2-icon-button", IconButton);
}
