export default class TextButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `<style>@import "${new URL("TextButton.css", import.meta.url)}";</style><div><slot></slot></div>`;

        this.setAttribute('type', "button");
        // tabindex
        this.disabledStateChanged();
        let text = this.textContent;
        // transform
        if (this.getAttribute('transform')=="uppercase") {
            text = text.toUpperCase();
            this.textContent = text;
        }

        if (this.getAttribute('dropdown') != null) {
            this.createDropdownButton();
        }

    }
    setShadowRoot(content) { this.shadowRoot.innerHTML = content; }  // shadowroot
    addToShadowRoot(additionalElement) { this.shadowRoot.appendChild(additionalElement); }
    setButtonText(buttonText) { this._buttonText = buttonText; }  // button text
    getButtonText() { return this._buttonText; }
    setWidth(width) { this._width = width; }
    getWidth() { return this._width; }
    setLeadingIcon(leadingIcon) { this._leadingIcon = leadingIcon; }
    getLeadingIcon() { return this._leadingIcon; }
    disabledStateChanged() {
        if (this.getAttribute('disabled')==null) { 
            this.setAttribute('aria-disabled', "false");
            this.setAttribute('tabindex', 0);
        } else { 
            this.setAttribute('aria-disabled', "true");
            this.setAttribute('tabindex', -1);
        }
    }
    createDropdownButton() {
        let buttonText = this.childNodes[0].textContent;
        this.setButtonText(buttonText);

        if (this.getAttribute('width')) {  // width
            let width = this.getAttribute('width');
            this.setWidth(width);
        }

        let width = this.getWidth();

        let tempStr = '';
        let isStringType = isNaN(Number(buttonText, 10));
        let buttonWidth = buttonText.length * 16;
        let leadingIcon = this.getAttribute('leading-icon');
        if (buttonWidth > 90 || leadingIcon) {  // button's width should wider then inner content
            // let style = document.createElement( 'style' );

            // if (leadingIcon != null) {
            //     let minWidth = buttonWidth + 38 + 12 + 24 + 24;
                
            //     if (minWidth > 112) {  // text field has a 112 limited min width
            //         tempStr = width != undefined ? `:host{width: ${this.getWidth()}px}` : `:host{min-width: ${minWidth}px !important}`;
            //     } else tempStr = width != undefined ? `:host{width: ${this.getWidth()}px}` : '';

            //     let inputWidthAdjustStr = ':host > select {max-width: calc(100% - 4.25rem)}';
            //     style.innerHTML = tempStr + inputWidthAdjustStr;
            // } else {
            //     tempStr = width != undefined ? `:host{width: ${this.getWidth()}px}` : `:host{min-width: ${labelWidth + 12}px}`;
            //     let inputWidthAdjustStr = ':host > select {max-width: calc(100% - 2rem)}';
            //     style.innerHTML = tempStr + inputWidthAdjustStr;
            // }
            // this.addToShadowRoot(style);
        } else {
            let style = document.createElement( 'style' );
            let minWidth = buttonWidth + 24;
            if (isStringType) tempStr = width != undefined ? `:host{width: ${this.getWidth()}px}` : `:host{min-width: ${minWidth + 24}px}`;
            else tempStr = width != undefined ? `:host{width: ${this.getWidth()}px}` : `:host{min-width: ${minWidth - 8}px}`;
            style.innerHTML = tempStr;
            this.addToShadowRoot(style);
        }
    }

    render() {

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

customElements.define("text-button", TextButton);