import { ListItem } from "../util.js";

export class ListItemEl extends ListItem {
  constructor () {
    super();
    this.attachShadow({
      mode: "open",
      delegatesFocus: true
    });
    this.rendered = false;
    this.shadowRoot.innerHTML = `<style>@import "${new URL("ListItem.css", import.meta.url)}";</style>`;
    this.listItemRoot = null;
    this.disabled = false;
    this.type = "text";
    this.isListItem = true;
    this.target = "";
  }
  connectedCallback() {
    if (!this.rendered) {
      this.render();
    }
  }
  static get observedAttributes() { 
    return ["disabled"];
  }
  attributeChangedCallback (name, oldValue, newValue) {
    switch (name) {
      case "disabled":
        if (this.rendered) {
          this.handleDisableState(this.listItemRoot);
        }
        break;
      default: break;
    }
  }
  create () {
    const listItemChild = document.createElement("u2-item");

    const container = document.createElement("div");
    const slotStart = document.createElement("slot");
    const slotEnd = document.createElement("slot");

    container.setAttribute("slot", "container");
    slotStart.setAttribute("slot", "start");
    slotEnd.setAttribute("slot", "end");

    slotStart.setAttribute("name", "start");
    slotEnd.setAttribute("name", "end");

    listItemChild.appendChild(container);
    listItemChild.appendChild(slotStart);
    listItemChild.appendChild(slotEnd);

    const bodyContents = this.renderBody();
    bodyContents.forEach(slot => listItemChild.appendChild(slot));
    
    const tag = this.renderListItem(listItemChild);

    this.addToShadowRoot(tag);
  }

  renderListItem (content) {
    let tag;
    switch (this.type) {
      case "button":
        tag = document.createElement("button");
        break;
      default:
      case "text":
        tag = document.createElement("li");
        break;
    }
    const isInteractive = this.type !== "text";
    tag.setAttribute("id", "item");
    tag.setAttribute("tabindex", `${this.disabled || !isInteractive ? -1 : 0}`);
    if (this.disabled) tag.setAttribute("disabled", this.disabled);
    tag.setAttribute("role", "listitem");
    tag.setAttribute("class", `list-item ${this.disabled ? "disabled" : "" }`);

    const setAriaAttr = this.setAriaAttribute.bind(this, tag);
    setAriaAttr("aria-selected");
    setAriaAttr("aria-checked");
    setAriaAttr("aria-expanded");
    // setAriaAttr("aria-haspopup");

    tag.appendChild(content);
    return tag;
  }
  setAriaAttribute (element, attrName) {
    this[attrName] && element.setAttribute(attrName, this[attrName]);
  }
  renderBody () {
    const body = [];
    const slotDefault = document.createElement("slot");
    const slotHeadline = document.createElement("slot");
    slotHeadline.setAttribute("slot", "headline");
    slotHeadline.setAttribute("name", "headline");
    // TODO: supporting-text slot and so on
    body.push(slotDefault);
    body.push(slotHeadline);
    return body;
  }

  render () {
    this.create();
    this.listItemRoot = this.shadowRoot.querySelector(".list-item");
    this.handleDisableState(this.listItemRoot);
    this.rendered = true;
  }
}
if (!customElements.get("u2-list-item")) {
  customElements.define("u2-list-item", ListItemEl);
}
