export default class FilledButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
        <style>@import "${new URL("FilledButton.css", import.meta.url)}";</style>
        <slot></slot>`;
    }

    disabledStateChanged() {
        if (this.getAttribute('disabled')==null) { 
            this.setAttribute('aria-disabled', "false");
            this.setAttribute('tabindex', 0);
        } else { 
            this.setAttribute('aria-disabled', "true");
            this.setAttribute('tabindex', -1);
        }
    }

    render() {
        this.setAttribute('type', "button");
        // tabindex
        this.disabledStateChanged();

        let text = this.textContent;
        // transform
        if (this.getAttribute('transform')=="uppercase") {
            text = text.toUpperCase();
            this.textContent = text;
        }
    }

    connectedCallback() { // 子元素还不存在，例如内部文字
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }

    static get observedAttributes() {
        return ['transform', 'disabled'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }
}

customElements.define("filled-button", FilledButton);