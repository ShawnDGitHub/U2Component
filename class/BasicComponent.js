export default class BasicComponent extends HTMLElement { // basic class for components
  constructor () {
    super();
    this.rendered = false; // avoid render again at the same page
    // subclass must set style to shadowRoot's innerHTML
  }
  connectedCallback () {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
  static get observedAttributes() { return []; }
  attributeChangedCallback (name, oldValue, newValue) {
    console.error("remember to implement attributeChangedCallback()", name, oldValue, newValue)
    throw new Error("attributeChangedCallback() must be implemented by subclasses");
  }
  // shadowRoot actions
  setShadowRoot (DOM) { this.shadowRoot.innerHTML = DOM; }
  addToShadowRoot (element) { this.shadowRoot.appendChild(element); }
  render () {
    throw new Error("render() must be implemented by subclasses");
  }
}
