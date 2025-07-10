import { MenuItem } from '../util.js';
import { MenuItemController } from './controller.js'

export class MenuItemEl extends MenuItem {
  menuItemController = new MenuItemController(
    this,
    {
      getHeadlineElements: () => this.headlineElements,
      getDefaultElements: () => this.defaultElements
    }
  )
  constructor () {
    super();
    this.attachShadow({
      mode: "open",
      delegatesFocus: true
    });
    this.rendered = false;
    this.shadowRoot.innerHTML = `<style>@import "${new URL("MenuItem.css", import.meta.url)}";</style>`;
    this.listItemRoot = null;
    this.disabled = false;
    this.type = "menuitem";
    this.target = ""; // '_blank' | '_parent' | '_self' | '_top' | ''
    this.keepOpen = this.getAttribute("keep-open");
    this.selected = false;

    this.headlineElements = null;
    this.defaultElements = null;
  }
  connectedCallback () {
    if (!this.rendered) {
      this.render();
    }
  }
  static get observedAttributes() { 
    return ["keep-open"];
  }
  attributeChangedCallback (name, oldValue, newValue) {
    switch (name) {
      case "keep-open":
        break;
      default: break;
    }
  }
  create () {
    // TODO: use u2-item here
    const menuItemChild = document.createElement("div");

    const slotStart = document.createElement("slot");
    const slotDefault = document.createElement("slot");
    const slotEnd = document.createElement("slot");

    this.defaultElements = slotDefault;

    slotStart.setAttribute("slot", "start");
    slotEnd.setAttribute("slot", "end");

    slotStart.setAttribute("name", "start");
    slotEnd.setAttribute("name", "end");

    menuItemChild.appendChild(slotStart);
    menuItemChild.appendChild(slotDefault);
    menuItemChild.appendChild(slotEnd);

    const bodyContents = this.renderBody();
    bodyContents.forEach(slot => menuItemChild.appendChild(slot));
    
    const tag = this.renderListItem(menuItemChild);

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
    tag.setAttribute("class", `menu-item ${this.disabled ? "disabled" : "" }`);

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

    const slotHeadline = document.createElement("slot");
    slotHeadline.setAttribute("slot", "headline");
    slotHeadline.setAttribute("name", "headline");
    this.headlineElements = slotHeadline;
    // TODO: supporting-text slot and so on
    body.push(slotHeadline);
    return body;
  }

  render () {
    this.create();
    this.listItemRoot = this.shadowRoot.querySelector(".menu-item");
    this.handleDisableState(this.listItemRoot);
    this.rendered = true;
  }
}
if (!customElements.get("u2-menu-item")) {
  customElements.define("u2-menu-item", MenuItemEl);
}
