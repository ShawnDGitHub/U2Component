export default class TextField extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.rendered = false;
        this.shadowRoot.innerHTML = `<style>@import "${new URL("TextField.css", import.meta.url)}";</style>`;
    }

    setShadowRoot(content) { this.shadowRoot.innerHTML = content; }  // shadowroot
    addToShadowRoot(additionalElement) { this.shadowRoot.appendChild(additionalElement); }
    setState(state) { this._focused = state; }  // focus state
    getState() { return this._focused; }
    setLabelText(labelText) { this._labelText = labelText; }  // label text
    getLabelText() { return this._labelText; }
    setTitle(title) { this._title = title; }  // title
    getTitle() { return this._title; }
    setSelectedInfo(index, text) {
        this._selectedIndex = index;
        this._selectedText = text;
    }
    getSelectedInfo() { 
        return {  // return object
            index: this._selectedIndex, 
            text: this._selectedText
        };
    }
    setDropdownContent(content) { this._dropdownContent =  content; }  // TODO 返回 options
    setDropdownContentNameList(nameList) { this._dropdownContentNameList = nameList; }
    getDropdownContentNameList() { return this._dropdownContentNameList; }
    setWidth(width) { this._width = width; }
    getWidth() { return this._width; }
    setHeight(height) { this._height = height; }
    getHeight() { return this._height; }
    setLeadingIcon(leadingIcon) { this._leadingIcon = leadingIcon; }
    getLeadingIcon() { return this._leadingIcon; }
    setTrailingIcon(trailingIcon) { this._trailingIcon = trailingIcon; }
    getTrailingIcon() { return this._trailingIcon; }
    setShouldClearState(clearState) { this._clearState = clearState; }
    getShouldClearState() { return this._clearState; }
    setClearableState(clearableState) { this._clearableState = clearableState; }
    getClearableState() { return this._clearableState; }
    


    textInputDebouce(callback, delay) {  // 输入的防抖，避免每次输入都修改内容
        let timer = null;
        return function() {
            if (timer != null) clearTimeout(timer);
            setTimeout(() => {
                callback.call(this);
            }, delay);
        }
    }
    createTextField() {
        let privateType = this.getAttribute('type');
        if (privateType != 'password') this.setAttribute('type', 'input');
        this.classList.add("empty");
        let inputInsert = document.createElement('input');  // input
        inputInsert.setAttribute('placeholder', ' ');
        this.addToShadowRoot(inputInsert);

        this.INPUT = this.shadowRoot.childNodes[1];  // Node: input

        let labelText = this.getAttribute('placeholder');  // label text
        this.setLabelText(labelText);
        this.INPUT.placeholder = labelText;
        if (this.getAttribute('autocomplete')) {  // autoComplete
            let autoComplete = this.getAttribute('autocomplete');
            this.INPUT.autocomplete = autoComplete;
        }
        if (this.getAttribute('value')) {  // value
            let value = this.getAttribute('value');
            this.INPUT.value = value;
            this.classList.add('filled');
        }
        this.LABEL = undefined;
        let labelElement = document.createElement('div');  // float label
        labelElement.setAttribute('class', 'filled-textfield-label');
        this.addToShadowRoot(labelElement);

        this.LABEL = this.shadowRoot.childNodes[2];    // Node: float label

        this.LABEL.innerText = labelText;
        // Accessibility: aria-label
        this.setAttribute('aria-label', `输入框要求：${labelText}`);
        this.LABEL.setAttribute('aria-label', `界面文字（“${labelText}”）`);
        // Accessibility: aria-placeholder
        this.setAttribute('aria-placeholder', labelText);

        // this.INPUT.role = "textbox";
        if (privateType === 'password') this.INPUT.type = 'password';
        else this.INPUT.type = "text";
        this.INPUT.ariaPlaceholder = labelText;

        this.LABEL.onclick = () => {
            this.INPUT.focus();
        }

        if (this.getAttribute('width')) {  // width
            let width = this.getAttribute('width');
            this.setWidth(width);
        }
        let width = this.getWidth();

        let leadingIcon = this.getAttribute('leading-icon');
        if (leadingIcon != null) {  // leading icon
            this.setLeadingIcon(leadingIcon);
            let leadingIconSpan = document.createElement('span');
            leadingIconSpan.classList.add('leading-icon');
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
            this.INPUT.parentNode.insertBefore(leadingIconSpan, this.INPUT);
        }

        let trailingIcon = this.getAttribute('trailing-icon');
        
        let isPrivate = false;
        if (privateType === 'password') isPrivate = true;

        let clearableType = this.getAttribute('clearable');
        this.setShouldClearState(false);
        this.setClearableState(false);
        let isClearable = clearableType != null;
        if (trailingIcon != null || isPrivate || isClearable) {  // trailing icon
            let trailingIconSpan = document.createElement('span');
            trailingIconSpan.classList.add('trailing-icon');
            if (isPrivate) {
                this.classList.add('invisible-clearable');
                this.setTrailingIcon('visibility');
                trailingIcon = this.getTrailingIcon();
                
                trailingIconSpan.innerText = this.getTrailingIcon();
                trailingIconSpan.addEventListener('click', (evt) => {
                    evt.stopPropagation();
                    let type = this.INPUT.type;
                    if (type == 'text') {
                        this.INPUT.type = 'password';
                        trailingIconSpan.innerText = 'visibility'
                    } else {
                        this.INPUT.type = 'text';
                        trailingIconSpan.innerText = 'visibility_off'
                    }
                })
            } else if (isClearable) {
                this.setShouldClearState(true);
                this.classList.add('invisible-clearable');
                this.setTrailingIcon('cancel');
                trailingIcon = this.getTrailingIcon();

                trailingIconSpan.innerText = this.getTrailingIcon();
                trailingIconSpan.addEventListener('click', (evt) => {
                    evt.stopPropagation();
                    this.setClearableState(false);
                    this.INPUT.value = '';
                    this.setAttribute('value', "");
                    this.classList.add('invisible-clearable');
                    if (this.classList.contains('filled')) {
                        this.classList.remove('filled');
                        this.classList.add('empty');
                    }
                })
            } else {
                this.setTrailingIcon(trailingIcon);
                trailingIconSpan.innerText = trailingIcon;
            }
            let iconVariant = this.getAttribute('icon-variant');  // icon-variant
            if (iconVariant) {
                if (iconVariant == 'outlined') 
                    trailingIconSpan.classList.add('material-symbols-outlined');
                else if (iconVariant == 'rounded') 
                    trailingIconSpan.classList.add('material-symbols-rounded');
                else trailingIconSpan.classList.add('material-symbols-sharp');
            } else {  // add default outlined style
                console.warn('Material Symbols 拥有三类图标变种，分别是 outlined、rounded 和 sharp。传入 icon-variant 属性以隐藏该提示。')
                trailingIconSpan.classList.add('material-symbols-outlined');
            }
            this.INPUT.parentNode.appendChild(trailingIconSpan);
        }

        let tempStr = '';
        let labelWidth = labelText.length * 16;
        if (labelWidth > 90 || leadingIcon || trailingIcon) {  // text field's width should wider then label
            let style = document.createElement( 'style' );

            if (leadingIcon != null && trailingIcon != null) {
                let minWidth = labelWidth + 38 + 12 + 24 + 12 + 24;
                
                if (minWidth > 112) {  // text field has a 112 limited min width
                    tempStr = width != undefined ? `:host{width: ${this.getWidth()}px}` : `:host{min-width: ${minWidth}px !important}`;
                } else tempStr = width != undefined ? `:host{width: ${this.getWidth()}px}` : '';

                let inputWidthAdjustStr = ':host > input {max-width: calc(100% - 4.25rem - 24px - 12px)}';
                style.innerHTML = tempStr + inputWidthAdjustStr;
            } else if (leadingIcon != null) {
                let minWidth = labelWidth + 38 + 12 + 24;
                
                if (minWidth > 112) {  // text field has a 112 limited min width
                    tempStr = width != undefined ? `:host{width: ${this.getWidth()}px}` : `:host{min-width: ${minWidth}px !important}`;
                } else tempStr = width != undefined ? `:host{width: ${this.getWidth()}px}` : '';

                let inputWidthAdjustStr = ':host > input {max-width: calc(100% - 4.25rem)}';
                style.innerHTML = tempStr + inputWidthAdjustStr;
            } else if (trailingIcon != null) {
                let minWidth = labelWidth + 38 + 12 + 24;
                
                if (minWidth > 112) {  // text field has a 112 limited min width
                    tempStr = width != undefined ? `:host{width: ${this.getWidth()}px}` : `:host{min-width: ${minWidth}px}`;
                } else tempStr = width != undefined ? `:host{min-width: ${this.getWidth()}px !important}` : '';

                let inputWidthAdjustStr = ':host > input {max-width: calc(100% - 4.25rem)}';
                style.innerHTML = tempStr + inputWidthAdjustStr;
            } else {
                tempStr = width != undefined ? `:host{width: ${this.getWidth()}px}` : `:host{min-width: ${labelWidth + 12}px}`;
                let inputWidthAdjustStr = ':host > input {max-width: calc(100% - 2rem)}';
                style.innerHTML = tempStr + inputWidthAdjustStr;
            }
            this.addToShadowRoot(style);
        } else {
            let style = document.createElement( 'style' );
            let minWidth = labelWidth + 38;
                
            if (minWidth > 112) {  // text field has a 112 limited min width
                tempStr = width != undefined ? `:host{width: ${this.getWidth()}px}` : `:host{min-width: ${minWidth}px}`;
            } else tempStr = width != undefined ? `:host{width: ${this.getWidth()}px}` : '';

            let inputWidthAdjustStr = ':host > input {max-width: calc(100% - 2rem)}';
            style.innerHTML = tempStr + inputWidthAdjustStr;
            this.addToShadowRoot(style);
        }
        

    }
    createTextareaField() {
        this.classList.add("empty");
        let textareaInsert = document.createElement('textarea');
        textareaInsert.setAttribute('placeholder', ' ');
        this.addToShadowRoot(textareaInsert);

        this.TEXTAREA = this.shadowRoot.childNodes[1];  // Node: textarea

        let labelText = this.getAttribute('placeholder');  // label text
        this.setLabelText(labelText);
        this.TEXTAREA.placeholder = labelText;

        let style = document.createElement( 'style' );
        let minWidth = this.clientWidth;
            
        let tempStr = '';

        if (this.getAttribute('width')) {  // width
            let width = this.getAttribute('width');
            this.setWidth(width);
        }
        if (this.getAttribute('height')) {  // width
            let height = this.getAttribute('height');
            this.setHeight(height);
        }
        let width = this.getWidth();
        let height = this.getHeight();
        if (minWidth > 112) {  // text field has a 112 limited min width
            tempStr = width != undefined ? `:host{width: ${this.getWidth()}px}` : `:host{min-width: ${minWidth}px}`;
        } else tempStr = width != undefined ? `:host{width: ${this.getWidth()}px}` : '';
        let textAreaWidthAdjustStr = ':host > textarea {max-width: calc(100% - 1rem)}';
        let textAreaHeightAdjustStr = height != undefined ? `:host > textarea {min-height: ${height}px}` : '';
        style.innerHTML = tempStr + textAreaWidthAdjustStr + textAreaHeightAdjustStr;
        this.addToShadowRoot(style);
    }
    createDropdownTextField() {
        // initial
        this.classList.add("empty");
        const labelText = this.getAttribute('placeholder');
        const title = this.getAttribute('title');
        this.setLabelText(labelText);
        this.setTitle(title);
        let selectInsert = document.createElement('select');  // insert Select element
        selectInsert.setAttribute('class', 'dropdown-menu');
        selectInsert.setAttribute('title', this.getTitle());
        this.addToShadowRoot(selectInsert);

        this.SELECT = this.shadowRoot.childNodes[1];  // TODO - Node: SELECT

        // listen if need to expand option list
        this.SELECT.addEventListener("focus", (evt) => {
            if (this.getState() == false) {
                this.classList.remove("empty");
                this.classList.add("focused");
                console.info('select - focus 1', this.getState());
                this.setState(true);
                console.info('select - focus 2', this.getState());
                this.SELECT.size = this.getDropdownContentNameList().length;
                evt.stopPropagation();  // 停止冒泡
            } else return;
        });

        let placeholderInsert = document.createElement('div');  // placeholder
        placeholderInsert.setAttribute('class', 'placeholder');
        this.addToShadowRoot(placeholderInsert);

        this.placeholderLabelNode = this.shadowRoot.childNodes[2];  // Node: placeholder type label
        
        // insert options element
        let dropdownContent = this.getAttribute('dropdownContent');  // dropdown content
        this.setDropdownContent(dropdownContent);
        let dropdownContentNameList = dropdownContent.split('/');  // dropdown content name list
        this.setDropdownContentNameList(dropdownContentNameList);
        dropdownContentNameList.forEach(element => {
        // TODO - 加入 divider
            let elementInsert = document.createElement('option');
            elementInsert.innerText = element;
            elementInsert.value = element;
            elementInsert.addEventListener("click", (evt) => {
                evt.stopPropagation();
                this.blur();
                this.setSelectedInfo(elementInsert.index, elementInsert.value);
                this.placeholderLabelNode.innerText = elementInsert.value;
            })
            this.SELECT.add(elementInsert);
        });
        // placeholder initial
        this.placeholderLabelNode.innerText = this.SELECT.options[0].value;
        this.LABEL = undefined;  // Label
        let labelElement = document.createElement('div');
        labelElement.setAttribute('class', 'filled-textfield-label');
        this.addToShadowRoot(labelElement);

        this.LABEL = this.shadowRoot.childNodes[3];  // Node: float label

        this.LABEL.innerText = labelText;
        this.setAttribute('aria-label', labelText);
        this.LABEL.onclick = () => {
            this.SELECT.focus();
        }

        if (this.getAttribute('width')) {  // width
            let width = this.getAttribute('width');
            this.setWidth(width);
        }

        // let labelWidth = labelText.length * 16;
        // if (labelWidth > 90) {
        //     let style = document.createElement( 'style' );
        //     let width = this.getWidth();
        //     console.info(width);
        //     style.innerHTML = [width ? `:host{width: ${this.getWidth()}px}` : `:host{width: ${labelWidth + 38}px}`];
        //     this.addToShadowRoot(style);
        // } else {
        //     let style = document.createElement( 'style' );
        //     let width = this.getWidth();
        //     console.info(width);
        //     if (width) {
        //         style.innerHTML = `:host{width: ${this.getWidth()}px}`;
        //     }
        //     this.addToShadowRoot(style);
        // }
        let width = this.getWidth();

        let leadingIcon = this.getAttribute('leading-icon');
        if (leadingIcon != null) {  // leading icon
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
            this.SELECT.parentNode.insertBefore(leadingIconSpan, this.SELECT);
        }

        let tempStr = '';
        let labelWidth = labelText.length * 16;
        if (labelWidth > 90 || leadingIcon) {  // text field's width should wider then label
            let style = document.createElement( 'style' );

            if (leadingIcon != null) {
                let minWidth = labelWidth + 38 + 12 + 24 + 24;
                
                if (minWidth > 112) {  // text field has a 112 limited min width
                    tempStr = width != undefined ? `:host{width: ${this.getWidth()}px}` : `:host{min-width: ${minWidth}px !important}`;
                } else tempStr = width != undefined ? `:host{width: ${this.getWidth()}px}` : '';

                let inputWidthAdjustStr = ':host > select {max-width: calc(100% - 4.25rem)}';
                style.innerHTML = tempStr + inputWidthAdjustStr;
            } else {
                tempStr = width != undefined ? `:host{width: ${this.getWidth()}px}` : `:host{min-width: ${labelWidth + 12}px}`;
                let inputWidthAdjustStr = ':host > select {max-width: calc(100% - 2rem)}';
                style.innerHTML = tempStr + inputWidthAdjustStr;
            }
            this.addToShadowRoot(style);
        } else {
            let style = document.createElement( 'style' );
            let minWidth = labelWidth + 38 + 24;
                
            if (minWidth > 112) {  // text field has a 112 limited min width
                tempStr = width != undefined ? `:host{width: ${this.getWidth()}px}` : `:host{min-width: ${minWidth}px !important}`;
            } else tempStr = width != undefined ? `:host{width: ${this.getWidth()}px}` : `:host{min-width: ${minWidth}px !important}`;

            let selectWidthAdjustStr = ':host > select {max-width: calc(100% - 2rem)}';
            style.innerHTML = tempStr + selectWidthAdjustStr;
            this.addToShadowRoot(style);
        }


    }
    disabledStateChanged() {
        if (this.getAttribute('disabled')==null) { 
            // 可以聚焦的元素不能加 tab-index, 会引起样式问题
            this.setAttribute('aria-disabled', false);
        }
        else {
            this.setAttribute('tabindex', -1);
            this.setAttribute('aria-disabled', true);
        }
    }
    valueChanged(newValue) {
        if (newValue != "") {
            this.classList.remove('empty');
            this.classList.add('filled');
        }
        else {
            this.classList.remove('filled');
            this.classList.add('empty');
        }
        this.INPUT.value = newValue;
    }
    changeLabelBackgroundColor(backgroundColor) {
        let style = document.createElement( 'style' );
        style.innerText = `:host > .filled-textfield-label{ background-color: ${backgroundColor} !important; }`;
        if(backgroundColor != null) this.addToShadowRoot(style);
    }
    
    render() {
        this.setAttribute('role', "textbox");
        
        this.setState(false);  // initial focus state

        // tabindex
        this.disabledStateChanged();

        if (this.classList.contains('dropdown')) {  // dropdown menu
            this.createDropdownTextField();  // important initial
            this.addEventListener('click', () => {
                let isFocused = this.getState();
                if (isFocused) return;
                this.SELECT.size = this.getDropdownContentNameList().length;
                this.SELECT.focus();
            });
            this.addEventListener("blur", (evt) => {
                evt.stopPropagation();
                this.SELECT.size = 0;
                this.setState(false);
                this.classList.remove('focused');
                this.classList.add('empty');

                let selectedIndex = this.SELECT.selectedIndex;
                let selectText = this.SELECT.options[selectedIndex].value;
                this.setSelectedInfo(selectedIndex, selectText);
                this.placeholderLabelNode.innerText = selectText;
            })
        } else if (this.classList.contains('textarea')) {
            this.createTextareaField();
            this.addEventListener("keyup", () => {
                if (this.TEXTAREA.value == '') { 
                    this.setAttribute('value', "");
                } else {
                    this.setAttribute('value', this.TEXTAREA.value);
                }
            });
        } else {  // text field
            this.createTextField();
            this.INPUT.addEventListener("focus", (evt) => {
                this.setState(true);
                evt.stopPropagation();
                this.classList.add('focused');
            })
            this.addEventListener("click", this.textInputDebouce(
                () => {
                    this.setState(true);
                    this.INPUT.focus();
                    this.classList.add('focused');
                }, 100)
            );

            this.addEventListener("keyup", this.textInputDebouce(
                () => {
                    if (this.INPUT.value == '') { 
                        this.setAttribute('value', "");
                        if (this.classList.contains('filled')) {
                            this.classList.remove('filled');
                            this.classList.add('empty');
                        }
                        this.setClearableState(false);
                        this.classList.add('invisible-clearable');
                    } else {
                        this.setAttribute('value', this.INPUT.value);
                        if (this.classList.contains('empty')) {
                            this.classList.remove('empty');
                            this.classList.add('filled');
                        }
                        if (this.classList.contains('invisible-clearable')) {
                            this.classList.remove('invisible-clearable');
                            if (this.getShouldClearState()) this.setClearableState(true);
                        }
                    }
                }, 300)
            );
            this.addEventListener("focus", () => {
                this.classList.add('focused');
            });
            this.addEventListener("blur", () => {
                if (this.INPUT.value == '') {
                    if (this.classList.contains('filled')) {
                        this.classList.remove('filled');
                        this.classList.add('empty');
                    }
                } else {
                    if (this.classList.contains('empty')) {
                        this.classList.remove('empty');
                        this.classList.add('filled');
                    }
                }
                this.setState(false);
                this.classList.remove('focused');
            });
        }
    }

    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }

        this.disabledStateChanged();
        let labelBackgroundColor = this.getAttribute('label-backgroundColor');
        this.changeLabelBackgroundColor(labelBackgroundColor);
    }

    static get observedAttributes() {
        return ['variant', 'placeholder', 'label-backgroundColor', 'autocomplete', 'disabled', 'value'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case 'disabled': this.disabledStateChanged(); break;
            case 'value': 
                if (newValue != oldValue) this.valueChanged(newValue);
                break;
            default: break;
        } 
    }
}

customElements.define("text-field", TextField);