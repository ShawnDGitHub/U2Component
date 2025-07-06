import BasicComponent from "../class/BasicComponent.js";

export class Item extends BasicComponent {
  constructor () {
    super();
    this.attachShadow({ mode: "open" });
    this.rendered = false;
    this.shadowRoot.innerHTML = `<style>@import "${new URL("Item.css", import.meta.url)}";</style>`;
    this.textSlots = null;
  }
  connectedCallback () {
    if (!rendered) {
      this.render();
    }
  }
  create () {
    const fragment = document.createDocumentFragment();
    const slotContainer = document.createElement("slot");
    const slotStart = document.createElement("slot");
    const slotEnd = document.createElement("slot");
    const slotText = document.createElement("div");
    const slotDefault = document.createElement("slot");
    const slotHeadline = document.createElement("slot");

    slotContainer.setAttribute("name", container);
    slotStart.setAttribute("name", "start");
    slotStart.setAttribute("class", "non-text");
    slotEnd.setAttribute("name", "end");
    slotEnd.setAttribute("class", "non-text");
    slotText.setAttribute("class", "text");
    slotDefault.setAttribute("class", "default-slot");
    // TODO: default slot event
    slotHeadline.setAttribute("name", "headline");
    // TODO: headline event

    slotText.appendChild(slotDefault);
    slotText.appendChild(slotHeadline);

    fragment.appendChild(slotContainer);
    fragment.appendChild(slotStart);
    fragment.appendChild(slotText);
    fragment.appendChild(slotEnd);

    this.addToShadowRoot(fragment);
  }
  render () {
    this.create();
    this.textSlots = this.shadowRoot.querySelector(".text slot");
    this.rendered = true;
  }
}
if (!customElements.get("u2-item")) {
  customElements.define("u2-item", Item);
}
