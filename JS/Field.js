export default class Field extends HTMLElement { // basic class for variant field
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
  createField () { 
    throw new Error("createField() must be implemented by subclasses");
  }
  computeSize (style) {
    console.error("computeSize() must be implemented by subclasses")
    return style;
  }
  handleDisableState () {
    const disabled = this.getAttribute('disabled');
    if (disabled === "" || disabled) {
      this.setAttribute('tabindex', -1);
      this.setAttribute('aria-disabled', true);
    } else {
      this.setAttribute('aria-disabled', false);
    }
  }
  render () {
    throw new Error("render() must be implemented by subclasses");
  }
  // util function:debounce
  debounce (callback, delay) {
    let timer = null;
    return function() {
      if (timer != null) clearTimeout(timer);
      setTimeout(() => {
        callback.call(this);
      }, delay);
    }
  }
}
