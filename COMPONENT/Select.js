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
  set label (value) { this._label = value; }
  get label () { return this._label; }
  set title (value) { this._title = value; }
  get title () { return this._title; }
  set state (value) { this._state = value; }
  get state () { return this._state; }
  set value (value) { this._value = value; }
  get value () { return this._value; }

  createField () { 
    this.type = "select";
    this.classList.add("empty");
    const label = this.getAttribute("label") || "label";
    const title = this.getAttribute("title");
    if (label) this.label = label;
    if (title) this.title = title;
    const element = document.createElement("select");
    element.setAttribute("class", "select");
    element.setAttribute("title", title ? this.title : "click to select value.");
    element.setAttribute("name", label ? this.label : "selector");
    this.addToShadowRoot(element);
    // node:the main element
    this.SELECT = this.shadowRoot.childNodes[1];
    const slot = document.createElement("slot");
    // options node - add slot to SELECT
    // the SELECT require option to be its child directly (*)
    // we use slot to collect options and delete slot later
    this.SELECT.appendChild(slot);
    const labelElement = document.createElement("div");
    labelElement.setAttribute("class", "label");
    this.addToShadowRoot(labelElement);
    // node:label
    this.LABEL = this.shadowRoot.childNodes[2];
    this.LABEL.innerText = this.label;
    this.setAttribute("aria-label", this.label);
    const placeholder = document.createElement("div");
    placeholder.setAttribute("class", "placeholder");
    this.addToShadowRoot(placeholder);
    // node:placeholder
    this.PLACEHOLDER = this.shadowRoot.childNodes[3];
    // node:options
    const optionsData = slot.assignedElements();
    // set default
    this.PLACEHOLDER.innerText = optionsData[0].label || optionsData[0].text
    this.value = optionsData[0].value || optionsData[0].text
    // so add them to select (**)
    optionsData.forEach(option => {
      const optionElement = document.createElement("option");
      optionElement.value = option.value || option.text;
      optionElement.textContent = option.label || option.text;
      this.SELECT.appendChild(optionElement);
    });
    slot.remove();

    const style = document.createElement("style");
    const computedStyle = this.computeSize(style);
    this.addToShadowRoot(computedStyle);
  }
  computeSize (style) {
    let sizeLimit = "";
    let minWidth = this.clientWidth;
    let labelWidth = this.label.length * 16;
    let attribute_width = this.getAttribute("width");
    if (attribute_width && attribute_width !== "") {
      this.width = attribute_width;
    }
    if (labelWidth > 90) { // text field's width should wider then label's width
      sizeLimit = this.width ? `:host{width: ${this.width}px}` : `:host{min-width: ${labelWidth + 24}px}`;
      sizeLimit += ":host > select {max-width: calc(100% - 2rem)}"; // max width
    } else {
      minWidth = labelWidth + 38 + 24;
      sizeLimit += this.width
        ? `:host{width: ${this.width}px}`
        : `:host{min-width: ${minWidth}px !important}`;
    }
    sizeLimit += `:host > select {max-width: calc(100% - 2rem)}`;
    sizeLimit += `:host .placeholder {max-width: calc(100% - 2rem)}`;
    style.innerHTML = sizeLimit;
    return style;
  }
  handleDisableState () {
    const disabled = this.getAttribute("disabled");
    if (disabled === "" || disabled) {
      this.setAttribute("tabindex", -1);
      this.setAttribute("aria-disabled", true);
    } else {
      this.setAttribute("aria-disabled", false);
    }
  }
  render () {
    this.handleDisableState();
    this.createField();
    // event listeners
    this.SELECT.addEventListener("focus", (event) => {
      if (this.state === false) {
        this.classList.remove("empty");
        this.classList.add("focused");
        this.state = true;
        event.stopPropagation();
      } else return;
    })
    this.addEventListener("click", () => {
      let focused = this.state;
      if (focused) return;
      this.SELECT.focus();
    })
    this.addEventListener("blur", (event) => {
      event.stopPropagation();
      this.state = false;
      this.classList.remove("focused");
      this.classList.add("empty");
    })
    this.SELECT.addEventListener("change", (event) => {
      const selectedValue = event.target.value;
      const selectedText = event.target.options[event.target.selectedIndex].textContent;
      this.value = selectedValue;
      this.PLACEHOLDER.innerText = selectedText;
      // expose this event
      this.dispatchEvent(new CustomEvent("select-change", {
        detail: {
          value: selectedValue,
          text: selectedText
        },
        bubbles: true,
        composed: true // event can break Shadow DOM border
      }));
    })
  }
}
if (!customElements.get("u2-select")) {
  customElements.define("u2-select", Select);
}
