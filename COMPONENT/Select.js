import Field from '../JS/Field.js'
export default class Select extends Field {
  constructor () {
    super();
    this.attachShadow({ mode: "open" });
    this.rendered = false;
    this.shadowRoot.innerHTML = `<style>@import "${new URL("Select.css", import.meta.url)}";</style>`;
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
  set label (value) { this._label = value; }
  get label () { return this._label; }
  // set title (value) { this._title = value; }
  // get title () { return this._title; }
  set state (value) { this._state = value; }
  get state () { return this._state; }

  createField () { 
    this.type = "dropdown";
    this.classList.add("empty");
    const label = this.getAttribute("placeholder") || "fill this blank...";
    // const title = this.getAttribute("title");
    if (label) this.label = label;
    // if (title) this.title = title;
    const element = document.createElement("select");
    element.setAttribute("class", "dropdown-menu");
    // element.setAttribute("title", this.title);
    this.addToShadowRoot(element);
    // the main element node
    this.SELECT = this.shadowRoot.childNodes[1];
    const slot = document.createElement("slot");
    // options node - add slot to SELECT
    this.SELECT.appendChild(slot);
    const placeholder = document.createElement("div");
    placeholder.setAttribute("class", "placeholder");
    this.addToShadowRoot(placeholder);
    // placeholder node
    this.PLACEHOLDER = this.shadowRoot.childNodes[2];
    this.PLACEHOLDER.innerText = "请插入 slot 选项";
    const labelElement = document.createElement("div");
    labelElement.setAttribute("class", "filled-textfield-label");
    this.addToShadowRoot(labelElement);
    // label node
    this.LABEL = this.shadowRoot.childNodes[3];
    this.LABEL.innerText = this.label;
    this.setAttribute("aria-label", this.label);
    
    const style = document.createElement("style");
    const computedStyle = this.computeSize(style);
    this.addToShadowRoot(computedStyle);

    // TODO: set event listener
  }
  computeSize (style) {
    let sizeLimit = "";
    let minWidth = this.clientWidth;
    let labelWidth = this.label.length * 16;
    let attribute_width = this.getAttribute("width");
    let attribute_height = this.getAttribute("height");
    if (attribute_width && attribute_width !== "") {
      this.width = attribute_width;
    }
    if (attribute_height && attribute_height !== "") {
      this.height = attribute_height;
    }
    if (labelWidth > 90) { // text field's width should wider then label width
      sizeLimit = this.width ? `:host{width: ${this.width}px}` : `:host{min-width: ${labelWidth + 12}px}`;
      sizeLimit += ":host > select {max-width: calc(100% - 2rem)}"; // max width
      style.innerHTML = sizeLimit;
    } else {
      minWidth = labelWidth + 38 + 24;
      sizeLimit += this.width
        ? `:host{width: ${this.width}px}`
        : `:host{min-width: ${minWidth}px !important}`;
    }
    sizeLimit += `:host > select {max-width: calc(100% - 2rem)}`;
    style.innerHTML = sizeLimit;
    return style;
  }
  render () {
    this.setAttribute('role', "textbox");
    this.createField();
    // event listener

  }
}
if (!customElements.get('custom-select')) {
  customElements.define('custom-select', Select);
}
