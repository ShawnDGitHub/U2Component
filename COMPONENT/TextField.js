import Field from '../JS/Field.js'
export default class TextField extends Field {
  constructor () {
    super();
    this.attachShadow({ mode: "open" });
    this.rendered = false;
    this.shadowRoot.innerHTML = `<style>@import "${new URL("TextField.css", import.meta.url)}";</style>`;
  }
  connectedCallback () {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
  static get observedAttributes() { 
    return ["width", "disabled"];
  }
  attributeChangedCallback (name, oldValue, newValue) {
    switch (name) {
      case "width":
        this.width = newValue;
        break;
      case "disabled":
        this.handleDisableState();
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
  set value (value) { this._value = value; }
  get value () { return this._value; }
  createField () { 
    this.type = "textfield";
    this.classList.add("empty");
    const input = document.createElement("input");
    this.addToShadowRoot(input);
    // node:input
    this.INPUT = this.shadowRoot.childNodes[1];
    // initial value
    const value = this.getAttribute("value");
    if (value) {
      this.value = value;
      this.INPUT.value = value;
      this.classList.add("filled");
    }
    // initial type
    const type = this.getAttribute("type");
    if (type !== "password") this.setAttribute("type", "input");
    else {
      this.type = "password";
      this.INPUT.type = this.type;
    }
    // initial label
    const label = this.getAttribute("label");
    const placeholder = this.getAttribute("placeholder");
    if (label) {
      this.label = label;
      const labelElement = document.createElement("div");
      labelElement.setAttribute("class", "label");
      this.addToShadowRoot(labelElement);
      // node:label
      this.LABEL = this.shadowRoot.childNodes[2]
      this.LABEL.innerText = this.label;
      this.INPUT.ariaPlaceholder = this.label;
      this.INPUT.title = this.getAttribute("title") || `enter ${this.label}`;
      this.INPUT.name = this.label;
      this.handleAutocomplete(this.label);
    } else {
      this.placeholder = placeholder || "placeholder";
      // input's position won't change with :not([placeholder])
      if (placeholder === null) this.setAttribute("placeholder", this.placeholder);
      this.INPUT.placeholder = this.placeholder;
      this.INPUT.name = this.placeholder;
      this.handleAutocomplete(this.placeholder);
    }
    // initial autocomplete
    const autocomplete = this.getAttribute("autocomplete");
    if (autocomplete) { this.INPUT.autocomplete = autocomplete; }

    const style = document.createElement("style");
    const computedStyle = this.computeSize(style);
    this.addToShadowRoot(computedStyle);
  }
  computeSize (style) {
    let sizeLimit = "";
    let minWidth = this.clientWidth;
    let labelWidth = this.label?.length * 16 || this.placeholder.length * 16;
    this.fullWidth = this.getAttribute("fullWidth") ? true : false;
    let attribute_width = this.getAttribute("width");
    if (attribute_width && attribute_width !== "") {
      this.width = attribute_width;
    }
    if (this.label && labelWidth > 90) { // text field's width should wider then label's width
      sizeLimit = this.width ? `:host{width: ${this.width}px}` : `:host{min-width: ${labelWidth + 24}px}`;
      if (labelWidth > 180) {
        sizeLimit += this.fullWidth
          ? ":host > input {width: calc(100% - 2rem)}"
          : ":host > input {min-width: calc(100% - 2rem)}";
      } else {
        sizeLimit += this.fullWidth
          ? ":host > input {width: calc(100% - 2rem)}"
          : ":host > input {max-width: calc(100% - 2rem)}";
      }
    } else {
      minWidth = labelWidth + 38;
      if (minWidth > 112) {
        sizeLimit += this.width
          ? `:host{width: ${this.width}px}:host > input {min-width: ${this.width - 32}px}`
          : `:host{min-width: ${minWidth}px}:host > input {max-width: ${minWidth - 32}px}`;
        sizeLimit += `:host > input {min-width: ${minWidth - 32}px}`;
      } else {
        sizeLimit += this.width
          ? `:host{width: ${this.width}px}:host > input {min-width: ${this.width - 32}px}`
          : `:host{min-width: ${minWidth}px}:host > input {max-width: ${minWidth - 32}px}`; 
      }
    }
    style.innerHTML = sizeLimit;
    return style;
  }
  // need bind this before use
  handleFilledStyle (emptyFn = null, filledFn = null) {
    if (this.INPUT.value === "") {
      emptyFn && emptyFn();
      if (this.classList.contains("filled")) {
        this.classList.remove("filled");
        this.classList.add("empty");
      }
    } else {
      filledFn && filledFn();
      if (this.classList.contains("empty")) {
        this.classList.remove("empty");
        this.classList.add("filled");
      }
    }
  }
  handleAutocomplete (value) {
    if (value === "username" || value === "email" || value === "name"
      || value === "address") {
      const autocomplete = this.getAttribute("autocomplete");
      this.INPUT.autocomplete = autocomplete || "on";
    }
  }
  render () {
    this.handleDisableState();
    this.createField();
    // event listener
    this.INPUT.addEventListener("focus", (evt) => {
      this.state = true;
      evt.stopPropagation();
      this.classList.add("focused");
    })
    // debounce can avoid label shake
    this.addEventListener("click", this.debounce(() => {
      this.state = true;
      this.INPUT.focus();
      this.classList.add("focused");
    }, 100))
    this.INPUT.addEventListener("change", this.debounce(() => {
      this.handleFilledStyle.call(this,
        () => this.value = "",
        () => this.value = this.INPUT.value);
    }, 300))
    this.addEventListener("focus", () => {
      this.classList.add("focused");
    })
    this.addEventListener("blur", () => {
      this.handleFilledStyle.call(this);
      this.state = false;
      this.classList.remove("focused");
    })
  }
}
if (!customElements.get("u2-field")) {
  customElements.define("u2-field", TextField);
}
