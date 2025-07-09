import BasicComponent from "../../class/BasicComponent.js";
import { NavigableKeys, ListController } from "./controller.js";

const NAVIGABLE_KEY_SET = new Set(Object.values(NavigableKeys));

export class List extends BasicComponent {
  listController = new ListController({
    isItem: this.isItem,
    getPossibleItems: this.getPossibleItems.bind(this),
    deactivateItem: this.deactivateItem,
    activateItem: this.activateItem,
    isNavigableKey: this.isNavigableKey,
    isActivatable: this.isActivatable
  });
  constructor () {
    super();
    this.attachShadow({ mode: "open" });
    this.rendered = false;
    this.shadowRoot.innerHTML = `<style>@import "${new URL("List.css", import.meta.url)}";</style>`;
  }
  connectedCallback () {
    if (!this.rendered) {
      this.render();
    }
  }
  disconnectedCallback() {
    this.SLOT.removeEventListener("deactivate-items", 
      this.listController.onDeactivateItems);
    this.SLOT.removeEventListener("slotchange",
      this.listController.onSlotchange);
  }
  get items () {
    return this.listController.items;
  }
  create () {
    const slot = document.createElement("slot");
    this.addToShadowRoot(slot);
    this.setAttribute("role", "list");
    // node:slot
    this.SLOT = this.shadowRoot.children[1];
    this.SLOT.addEventListener("deactivate-items", 
      this.listController.onDeactivateItems);
    this.SLOT.addEventListener("slotchange",
      this.listController.onSlotchange);
  }
  isItem (item) { item.hasAttribute("u2-list-item"); }
  // should bind list's this when pass as parameter of ListController
  getPossibleItems () { return this.slotItems; }
  deactivateItem (item) { return item.tabIndex = -1; }
  activateItem (item) { return item.tabIndex = 0; }
  isNavigableKey (key) { return NAVIGABLE_KEY_SET.has(key); }
  isActivatable (item) {
    return !item.disabled && item.type !== "text"
  }

  render () {
    this.create();
    this.slotItems = this.SLOT.assignedElements();
    this.rendered = true;
  }
}
if (!customElements.get("u2-list")) {
  customElements.define("u2-list", List);
}
