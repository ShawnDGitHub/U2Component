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
        let text = this.textContent;
        this.setAttribute('value', text);

        this.setAttribute('type', "button");
        this.disabledStateChanged();  // tabindex and disbale state
        this.handleLeadingIcon();
        if (this.parentNode.tagName == 'SEGMENTED-BUTTON') {
            this.handleSegmented();
            this.addEventListener("click", evt => {
                if (evt.target == this) {
                    let icon = this.shadowRoot.children[1];
                    icon.textContent = 'check';
                }
            })
        } else {
            let buttonText = this.childNodes[0].textContent;
            let tempStr = '';
            let isStringType = isNaN(Number(buttonText, 10));
            let buttonWidth = buttonText.length * 16;

            let style = document.createElement( 'style' );
            let minWidth = buttonWidth + 24;
            if (isStringType) tempStr = `:host{min-width: ${minWidth + 24}px}`;
            else tempStr = `:host{min-width: ${minWidth - 8}px}`;
            style.innerHTML = tempStr;
            this.addToShadowRoot(style);
        }

        // transform
        if (this.getAttribute('transform')=="uppercase") {
            text = text.toUpperCase();
            this.textContent = text;
        }
    }

    connectedCallback() { // 子元素还不存在，例如内部文字 当自定义元素第一次被连接到文档 DOM 时被调用
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }

    static get observedAttributes() {
        return ['transform', 'disabled', 'class'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case 'transform': console.info(oldValue, newValue); break;
            case 'disabled': this.disabledStateChanged(); break;
            case 'class': if (newValue === '') this.classUnfocued(); break;
            default: break;
        } 
    }
}

customElements.define("outlined-button", OutlinedButton);