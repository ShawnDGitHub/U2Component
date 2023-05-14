export default class IconButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.rendered = false;
        this.shadowRoot.innerHTML = `<style>@import "${new URL("IconButton.css", import.meta.url)}";</style>`;
        // icon
        let iconName = this.getAttribute('icon');
        this.setIconName(iconName);
        let iconVariant = this.getAttribute('icon-variant');
        this.setIconVariant(iconVariant);
    }
    setShadowRoot(content) { this.shadowRoot.innerHTML = content; }  // shadowroot
    addToShadowRoot(additionalElement) { this.shadowRoot.appendChild(additionalElement); }
    setIconName(iconName) { this._iconName = iconName; }
    getIconName() { return this._iconName; }
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
    iconChanged(iconName, iconVariant) {
        let spanIcon = this.shadowRoot.children[1];
        if (spanIcon != undefined) spanIcon.parentNode.removeChild(spanIcon);

        // icon
        if (iconName) {
            let spanInsert = document.createElement('span');
            spanInsert.innerText = iconName;

            if (iconVariant != null) {
                if (iconVariant == 'outlined') spanInsert.classList.add('material-symbols-outlined');
                else if (iconVariant == 'rounded') 
                    spanInsert.classList.add('material-symbols-rounded');
                else spanInsert.classList.add('material-symbols-sharp');
            } else {  // add default variant
                console.warn('Material Symbols 拥有三类图标变种，分别是 outlined、rounded 和 sharp。传入 icon-variant 属性以隐藏该提示。')
                spanInsert.classList.add('material-symbols-outlined');
            }
            this.addToShadowRoot(spanInsert);
        } else console.error('图标式按钮必须拥有一个图标，传入 icon 属性以解决该问题。');
    }

    render() {
        this.setAttribute('type', "button");
        this.disabledStateChanged();  // tabindex
    }

    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }

    static get observedAttributes() {
        return ['icon', 'icon-variant', 'disabled'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case 'icon':
                this.iconChanged(newValue, this.getIconVariant());
                this.setIconName(newValue);
                break;
            case 'icon-variant':
                this.iconChanged(this.getIconName(), newValue);
                this.setIconVariant(newValue);
                break;
            case 'disabled': this.disabledStateChanged(); break;
            default: break;
        }    
    }
}

customElements.define("icon-button", IconButton);