export default class Typography extends HTMLElement {
  
  constructor() {
    super();

    const shadow = this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = `
      <slot><!--page-title--><slot>
      <style>
        @import "${new URL("Typography.css", import.meta.url)}";
      </style>
    `

    const div = document.createElement('div');
    // div.setAttribute('class', 'Page-Title')
    shadow.appendChild(div);
  }

  connectedCallback() {

  }
}

customElements.define('u2-typography', Typography);