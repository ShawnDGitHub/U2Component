export default class FilledButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.rendered = false;
        this.shadowRoot.innerHTML = `<style>@import "${new URL("FilledButton.css", import.meta.url)}";</style><slot></slot>`;
    }
    setShadowRoot(content) { this.shadowRoot.innerHTML = content; }  // shadowroot
    addToShadowRoot(additionalElement) { this.shadowRoot.appendChild(additionalElement); }
    setButtonText(buttonText) { this._buttonText = buttonText; }
    getButtonText() { return this._buttonText; }
    setWidth(width) { this._width = width; }
    getWidth() { return this._width; }
    setLeadingIcon(leadingIcon) { this._leadingIcon = leadingIcon; }
    getLeadingIcon() { return this._leadingIcon; }
    setIconVariant(iconVariant) { this._iconVariant = iconVariant; }
    getIconVariant() { return this._iconVariant; }

    disabledStateChanged() {
        if (this.getAttribute('disabled')==null) { 
            this.setAttribute('aria-disabled', "false");
            this.setAttribute('tabindex', 0);
        } else { 
            this.setAttribute('aria-disabled', "true");
            this.setAttribute('tabindex', -1);
        }
    }

    handleLeadingIcon() {
        let leadingIcon = this.getAttribute('leading-icon');
        if (leadingIcon != null) {
            this.setLeadingIcon(leadingIcon);
            let leadingIconSpan = document.createElement('span');
            leadingIconSpan.innerText = leadingIcon;
            let iconVariant = this.getAttribute('icon-variant');  // icon-variant
            if (iconVariant) {
                if (iconVariant == 'outlined') 
                    leadingIconSpan.classList.add('material-symbols-outlined');
                else if (iconVariant == 'rounded') 
                    leadingIconSpan.classList.add('material-symbols-rounded');
                else leadingIconSpan.classList.add('material-symbols-sharp');
            } else {  // add default outlined style
                console.warn('Material Symbols 拥有三类图标变种，分别是 outlined、rounded 和 sharp。传入 icon-variant 属性以隐藏该提示。')
                leadingIconSpan.classList.add('material-symbols-outlined');
            }
            let slot = this.shadowRoot.childNodes[1];
            slot.parentNode.insertBefore(leadingIconSpan, slot);
        }
    }

    render() {
        this.setAttribute('type', "button");
        this.disabledStateChanged();
        this.handleLeadingIcon();
        let text = this.textContent;

        if (this.getAttribute('transform')=="uppercase") {
            text = text.toUpperCase();
            this.textContent = text;
        }
    }

    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }

    static get observedAttributes() {
        return ['transform', 'disabled'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // leading-icon
        let leadingIcon = this.getAttribute('leading-icon');
        this.setLeadingIcon(leadingIcon);
        let iconVariant = this.getAttribute('icon-variant');
        this.setIconVariant(iconVariant);
        switch(name) {
            case 'leading-icon':
                this.handleLeadingIcon();
                this.setLeadingIcon(newValue);
                break;
            case 'icon-variant':
                this.handleLeadingIcon();
                this.setIconVariant(newValue);
                break;
            case 'transform': console.info(oldValue, newValue); break;
            case 'disabled': this.disabledStateChanged(); break;
            default: break;
        } 
    }
}

customElements.define("filled-button", FilledButton);