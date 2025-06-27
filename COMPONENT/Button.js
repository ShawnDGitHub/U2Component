export default class Button extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: "open" });
    this.rendered = false;
    this.shadowRoot.innerHTML = `<style>@import "${new URL("Button.css", import.meta.url)}";</style><slot></slot>`;
  }
  connectedCallback () {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
  static get observedAttributes() { 
    return ["disabled", "class"];
  }
  attributeChangedCallback (name, oldValue, newValue) {
    switch(name) {
      case "disabled": this.handleDisableState(); break;
      default: break;
    } 
  }
  addToShadowRoot (element) { this.shadowRoot.appendChild(element); }
  // setter and getter
  set type (value) { this._type = value; }
  get type () { return this._type; }
  set width (value) { this._width = value; }
  get width () { return this._width; }
  set height (value) { this._height = value; }
  get height () { return this._height; }
  set value (value) { this._value = value; }
  get value () { return this._value; }
  createButton () { 
    this.handleDisableState();
    this.type = this.handleType();
    this.value = this.textContent;
    if (!this.value && this.value === "") throw new Error("Button needs an inner text.")
    this.setAttribute('type', "button");
    if (this.type !== "button") return;
    // below content is for normal button
    const style = document.createElement("style");
    const computedStyle = this.computeSize(style);
    this.addToShadowRoot(computedStyle);
  }
  computeSize (style) {
    let sizeLimit = "";
    const text = `${this.textContent}`;
    let buttonWidth = text.length * 8;
    let minWidth = buttonWidth + 24;
    sizeLimit += `:host{min-width: ${minWidth - 8}px}`;
    style.innerHTML = sizeLimit;
    return style;
  }
  handleDisableState () {
    const disabled = this.getAttribute('disabled');
    if (disabled === "" || disabled) {
      this.setAttribute('tabindex', -1);
      this.setAttribute('aria-disabled', true);
    } else {
      this.setAttribute('aria-disabled', false);
      this.setAttribute('tabindex', 0);
    }
  }
  handleType () {
    if (this.parentNode.tagName === 'SEGMENTED-BUTTON') {
      return "child button";
    } else { return "button"; }
  }
  render () {
    this.handleDisableState();
    this.createButton();
    // event listener
  }
}
if (!customElements.get('custom-button')) {
  customElements.define('custom-button', Button);
}
