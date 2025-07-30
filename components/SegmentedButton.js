export default class SegmentedButton extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: "open" });
    this.rendered = false;
    this.shadowRoot.innerHTML = `<style>@import "${new URL("SegmentedButton.css", import.meta.url)}";</style><slot></slot>`;
  }
  connectedCallback () {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
  set value (value) { this._value = value; }
  get value () { return this._value; }
  createButton () { 
    const button_start = this.children[0];
    this.start = button_start;
    const value = this.getButtonValue(this.start);
    this.value = value;
    this.start.classList.add("focused");
  }
  getButtonValue (button) {
    if (!button) {
      return null;
    }
    const buttonValue = button.hasAttribute("value");
    if (buttonValue) {
      return buttonValue;
    } else {
      return button.textContent.trim();
    }
  }
  handleSelect (button, selectedButton) {
    if (selectedButton) {
      selectedButton.classList.remove("focused");
    }
    selectedButton = button;
    selectedButton.classList.add("focused");
  }
  handleEvent (event) {
    const previousValue = this.value;
    let button = event.target;
    while (button && button.parentNode !== this) {
      button = button.parentNode;
    }
    if (button) {
      this.value = this.getButtonValue(button);
      if (previousValue !== this.value) {
        this.handleSelect(button, this.start);
      }
      this.start = button;
    }
  }
  render () {
    this.createButton();
    // event listener
    this.addEventListener("click", event => { this.handleEvent(event); })
    this.addEventListener("keydown", event => {
      if (event.key == "Enter") this.handleEvent(event);
    })
  }
}
if (!customElements.get("segmented-button")) {
  customElements.define("segmented-button", SegmentedButton);
}
