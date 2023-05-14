export default class OutlinedButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.rendered = false;
        this.shadowRoot.innerHTML = `<style>@import "${new URL("OutlinedButton.css", import.meta.url)}";</style><slot></slot>`;
    }
    setShadowRoot(content) { this.shadowRoot.innerHTML = content; }  // shadowroot
    addToShadowRoot(additionalElement) { this.shadowRoot.appendChild(additionalElement); }
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
    classUnfocued() {
        let icon = this.shadowRoot.children[1];
        icon.textContent = this.getLeadingIcon();
    }
    handleSegmented() {
        if (this.previousElementSibling == null) {
            let icon = this.shadowRoot.children[1];
            this.setAttribute('segmentedtype', 'first');
            icon.textContent = 'check';
        }
        else if (this.nextElementSibling == null) this.setAttribute('segmentedtype', 'end');
        else this.setAttribute('segmentedtype', 'normal');
    }
    leadingIconChanged() {
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
        let text = this.textContent;
        this.setAttribute('value', text);

        this.setAttribute('type', "button");
        this.disabledStateChanged();  // tabindex and disbale state

        if (this.parentNode.tagName == 'SEGMENTED-BUTTON') {
            this.handleSegmented();
            this.addEventListener("click", evt => {
                if (evt.target == this) {
                    let icon = this.shadowRoot.children[1];
                    icon.textContent = 'check';
                }
            })
        }

        // transform
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
        return ['transform', 'disabled', 'class', 'leading-icon'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case 'transform': console.info(oldValue, newValue); break;
            case 'disabled': this.disabledStateChanged(); break;
            case 'class': if (newValue === '') this.classUnfocued(); break;
            case 'leading-icon':
                this.leadingIconChanged(newValue, this.getIconVariant());
                this.setLeadingIcon(newValue);
                break;
            default: break;
        } 
    }
}

customElements.define("outlined-button", OutlinedButton);