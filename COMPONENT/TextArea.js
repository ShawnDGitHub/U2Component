import Field from '../JS/Field.js'
export default class TextArea extends Field {
  constructor () {
    super();
    this.attachShadow({ mode: "open" });
    this.rendered = false;
    this.shadowRoot.innerHTML = `<style>@import "${new URL("TextArea.css", import.meta.url)}";</style>`;
  }
  connectedCallback () {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
  static get observedAttributes() { 
    return ["width", "height"];
  }
  attributeChangedCallback (name, oldValue, newValue) {
    switch (name) {
      case "width":
        this.width = newValue;
        break;
      case "height":
        this.height = newValue;
        break;
      default: break;
    }
  }
  // setter and getter
  set type (value) { this._type = value; }
  get type () { return this._type; }
  set width (value) { this._width = value; }
  get width () { return this._width; }
  set height (value) { this._height = value; }
  get height () { return this._height; }
  set state (value) { this._focused = value; }
  get state () { return this._focused; }
  createField () { 
    this.type = "textarea";
    this.classList.add("empty");
    const element = document.createElement("textarea");
    this.addToShadowRoot(element);
    // the main element node
    this.TEXTAREA = this.shadowRoot.childNodes[1];
    const style = document.createElement("style");
    const computedStyle = this.computeSize(style);
    this.addToShadowRoot(computedStyle);
  }
  computeSize (style) {
    let sizeLimit = "";
    let minWidth = this.clientWidth;
    // TODO: should I do this?
    let attribute_width = this.getAttribute("width");
    let attribute_height = this.getAttribute("height");
    if (attribute_width && attribute_width !== "") {
      this.width = attribute_width;
    }
    if (attribute_height && attribute_height !== "") {
      this.height = attribute_height;
    }
    // text field in MD doc has a 112 min width limitation
    if (minWidth > 112) {
      sizeLimit = this.width
        ? `:host{width: ${this.width}px}`
        : `:host{min-width: ${minWidth}px}`;
    } else {
      sizeLimit = this.width
        ? `:host{width: ${this.width}px}` : "";
    }
    // min height limitation
    if (this.height) { sizeLimit += `:host > textarea {min-height: ${this.height}px}`; }
    sizeLimit += ":host > textarea {max-width: calc(100% - 1rem)}"; // max width
    style.innerHTML = sizeLimit;
    return style;
  }
  render () {
    this.handleDisableState();
    this.setAttribute('role', "textbox");
    this.createField();
    // event listener
    this.addEventListener("keyup", () => {
      if (this.TEXTAREA.value == "") { this.setAttribute("value", ""); }
      // TODO: what dose this used for?
      else { this.setAttribute("value", this.TEXTAREA.value); }
    });
  }
}
if (!customElements.get('custom-textarea')) {
  customElements.define('custom-textarea', TextArea);
}
