export default class TextButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.rendered = false;
        this.shadowRoot.innerHTML = `<style>@import "${new URL("TextButton.css", import.meta.url)}";</style><div><slot></slot></div>`;
    }
    setShadowRoot(content) { this.shadowRoot.innerHTML = content; }  // shadowroot
    addToShadowRoot(additionalElement) { this.shadowRoot.appendChild(additionalElement); }
    setButtonText(buttonText) { this._buttonText = buttonText; }  // button text
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
        if (leadingIcon != null) {
            let style = document.createElement( 'style' );
            let minWidth = buttonWidth + 24 + 24 + 8;
            if (isStringType) tempStr = width != undefined ? `:host{width: ${this.getWidth()}px}` : `:host{min-width: ${minWidth + 24}px}`;
            else tempStr = width != undefined ? `:host{width: ${this.getWidth()}px}` : `:host{min-width: ${minWidth - 8}px}`;
            style.innerHTML = tempStr;
            this.addToShadowRoot(style);
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
        this.disabledStateChanged();
        this.handleLeadingIcon();
        let text = this.textContent;
        this.setAttribute('type', "button");

        // transform
        if (this.getAttribute('transform')=="uppercase") {
            text = text.toUpperCase();
            this.textContent = text;
        }

        if (this.getAttribute('dropdown') != null) {
            this.createDropdownButton();
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

customElements.define("text-button", TextButton);