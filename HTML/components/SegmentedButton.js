export default class SegmentedButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `<style>@import "${new URL("SegmentedButton.css", import.meta.url)}";</style><slot></slot>`;
    }
    setValue(value) {
        this._value = value;
    }
    getValue() {
        return this._value;
    }
    getButtonValue(button) {
        if (!button) {
            return null;
        }

        if (button.hasAttribute("value")) {
            return button.getAttribute('value');
        } else {
            return button.textContent.trim();
        }
    }
    focusButton(button, selectedButton) {
        if (selectedButton) {  // 移除现有的聚焦显示，如果有的话
            selectedButton.classList.remove('focused');
        }
        selectedButton = button;
        selectedButton.classList.add('focused');
    }
    eventFunc(evt) {
        let previousValue = this.getValue();
        let button = evt.target;
        
        while (button && button.parentNode !== this) {
            button = button.parentNode;
        }

        if (button) {
            this.setValue(this.getButtonValue(button));
            this.setAttribute('value', this.getValue());
            if (previousValue !== this.getValue()) {
                this.focusButton(button, this.previousButton);
            }
            this.previousButton = button;
        }
    }

    render() {
        let firstButton = this.children[0];
        this.previousButton = this.children[0];
        let value = this.getButtonValue(firstButton);
        this.setValue(value);
        firstButton.classList.add('focused');

        this.setAttribute('value', this.getValue());

        this.addEventListener("click", evt => {
            this.eventFunc(evt);
        })

        this.addEventListener("keydown", evt => {
            if (evt.key == 'Enter') this.eventFunc(evt);
        })
    }

    connectedCallback() { // 子元素还不存在，例如内部文字
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }

    static get observedAttributes() {
        return [];
    }
}

customElements.define("segmented-button", SegmentedButton);