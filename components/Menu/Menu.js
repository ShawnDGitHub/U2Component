
import {
  updateInnerStyle,
  getActiveItem
} from './util.js'
import {
  ReactiveControllerHost
} from '../../class/ReactiveController.js'
import {
  SurfacePositionController
} from '../Menu/surfacePositionController.js'
export {Corner} from './surfacePositionController.js';

import { EASING, createAnimationSignal } from '../../motion/motion.js'
import {
  ListController,
  NavigableKeys
} from '../List/controller.js';
import { Corner, FocusState } from './shared.js';
import {
  getFirstActivatableItem,
  getLastActivatableItem
} from '../List/util.js';

const submenuNavKeys = new Set([
  NavigableKeys.ArrowDown,
  NavigableKeys.ArrowUp,
  NavigableKeys.Home,
  NavigableKeys.End,
]);

const menuNavKeys = new Set([
  NavigableKeys.ArrowLeft,
  NavigableKeys.ArrowRight,
  ...submenuNavKeys,
]);
function getFocusedElement (activeDoc = document) {
  let activeEl = activeDoc.activeElement;
  while (activeEl && activeEl?.shadowRoot?.activeElement) {
    activeEl = activeEl.shadowRoot.activeElement;
  }
  return activeEl;
}
function getProperties () {
  return {
    anchorCorner: this.anchorCorner,
    surfaceCorner: this.menuCorner,
    surfaceEl: this.surfaceEl,
    anchorEl: this.anchorElement,
    positioning:
      this.positioning === "popover" ? "document" : this.positioning,
    isOpen: this.open,
    xOffset: this.xOffset,
    yOffset: this.yOffset,
    disableBlockFlip: this.noVerticalFlip,
    disableInlineFlip: this.noHorizontalFlip,
    onOpen: this.onOpened.bind(this),
    beforeClose: this.beforeClose.bind(this),
    onClose: this.onClosed.bind(this),
    repositionStrategy:
      this.hasOverflow && this.positioning !== "popover"
        ? "move"
        : "resize",
  }
}
// SurfacePositionController needs a host implements the ReactiveControllerHost
export class Menu extends ReactiveControllerHost {
  constructor () {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `<style>@import "${new URL("Menu.css", import.meta.url)}";</style>`;
    this._open = false;

    this.surfaceEL = null;
    this.slotEl = null;
    this.anchor = "";
    this.positioning = "absolute";
    this.hasOverflow = false;
    this.xOffset = 0;
    this.yOffset = 0;
    this.noHorizontalFlip = false;
    this.noVerticalFlip = false;
    this.anchorCorner = Corner.END_START;
    this.menuCorner = Corner.START_START;
    this.defaultFocus = FocusState.FIRST_ITEM;
    this.isSubmenu = false;
    this.isRepositioning = false;
    this.lastFocuesdElement = null;
    this.currentAnchorElement = null;

    this.openCloseAnimationSignal = createAnimationSignal();
    this.listController = new ListController({
      isItem: this.isItem,
      getPossibleItems: this.getPossibleItems.bind(this),
      deactivateItem: this.deactivateItem,
      activateItem: this.activateItem,
      isNavigableKey: this.isNavigableKey,
    });
    this.menuPositionController = new SurfacePositionController(
      this,
      getProperties.bind(this)
    );

    this._resolveUpdatePromise = null;
    this._pendingStyle = {}; // could be update to newest
  }
  connectedCallback () {
    if (!this.rendered) {
      this.render();
    }
    if (this.open) {
      this.setUpGlobalEventListeners();
    }
  }
  disconnectedCallback () {
    this.cleanUpGlobalEventListeners();
    this.SLOT.removeEventListener("deactivate-items", 
      this.listController.onDeactivateItems);
    this.SLOT.removeEventListener("slotchange",
      this.listController.onSlotchange);
  }
  static get observedAttributes() { 
    return ["anchor", "anchor-corner", "x-offset", "y-offset"];
  }
  attributeChangedCallback (name, oldValue, newValue) {
    switch (name) {
      case "anchor":
        this.anchor = newValue;
        break;
      case "anchor-corner":
        this.anchorCorner = newValue;
        this.menuPositionController.onUpdate();
        break;
      case "x-offset":
        this.xOffset = newValue;
        this.menuPositionController.onUpdate();
        break;
      case "y-offset":
        this.yOffset = newValue;
        this.menuPositionController.onUpdate();
        break;
      default: break;
    }
  }
  set open (value) {
    const oldValue = this._open;
    const newValue = Boolean(value); // 确保是布尔值

    if (oldValue !== newValue) {
      this._open = newValue;
      this.menuPositionController.onUpdate();
    }
  }
  get open () { return this._open; }
  get items () {
    return this.listController.items;
  }
  get openDirection () {
    const menuCornerBlock = this.menuCorner.split("-")[0];
    return menuCornerBlock === "start" ? "DOWN" : "UP";
  }
  set anchorElement (element) {
    this.currentAnchorElement = element;
    // requestUpdate is extend from ReactiveControllerHost
    // this.requestUpdate("anchorElement");
  }
  get anchorElement () {
    if (this.anchor) {
      return this.getRootNode().querySelector(`#${this.anchor}`);
    }
    return this.currentAnchorElement;
  }

  isItem (item) { item.hasAttribute("u2-menu-item"); }
  getPossibleItems () { return this.slotItems; }
  deactivateItem (item) {
    item.selected = false;
    item.tabIndex = -1;
  }
  activateItem (item) {
    item.selected = true;
    item.tabIndex = 0;
   }
  isNavigableKey (key) {
    if (!this.isSubmenu) {
      return menuNavKeys.has(key);
    }
    const arrowOpen = NavigableKeys.ArrowRight; // TODO: Rtl
    if (key === arrowOpen) { return true; }
    return submenuNavKeys.has(key);
  }
  create () {
    const menu = document.createElement("div");
    const itemsContainer = document.createElement("div");
    const itemsPadding = document.createElement("div");

    const menuClasses = this.getMenuClasses();
    menu.setAttribute("class", "menu " + menuClasses);

    itemsContainer.setAttribute("class", "items");
    itemsPadding.setAttribute("class", "item-padding");

    const menuItemsSlot = this.renderMenuItems();
    // node:slot
    this.SLOT = menuItemsSlot;
    itemsPadding.appendChild(menuItemsSlot);
    itemsContainer.appendChild(itemsPadding);
    menu.appendChild(itemsContainer);
    // style
    const surfaceStyles = this.menuPositionController.surfaceStyles;
    updateInnerStyle(menu, surfaceStyles);
    
    this.addToShadowRoot(menu);
    this.setAttribute("role", "list");
  }
  renderMenuItems() {
    const slot = document.createElement("slot");
    slot.addEventListener("slotchange", this.listController.onSlotchange);
    return slot;
  }
  getMenuClasses () {
    const classes = "";
    if (this.open) classes += "open ";
    if (this.positioning === "fixed") classes += "fixed "
    return classes;
  }
  async animateOpen () {
    const surfaceEl = this.surfaceEl;
    const slotEl = this.slotEl;

    if (!surfaceEl || !slotEl) return;

    const openDirection = this.openDirection;
    this.dispatchEvent(new Event("opening"));

    surfaceEl.classList.toggle("animating", true);

    const signal = this.openCloseAnimationSignal.start();
    const height = surfaceEl.offsetHeight;
    const openingUpwards = openDirection === "UP";
    const children = this.items;

    const FULL_DURATION = 300;
    const SURFACE_OPACITY_DURATION = 50;
    const ITEM_OPACITY_DURATION = 250;
    const DELAY_BETWEEN_ITEMS =
      (FULL_DURATION - ITEM_OPACITY_DURATION) / children.length;

    const surfaceHeightAnimation = surfaceEl.animate(
      [{height: "0"}, {height: `${height}px`}],
      {
        duration: FULL_DURATION,
        easing: EASING.EMPHASIZED
      }
    );
    const upPositionCorrectionAnimation = slotEl.animate(
      [
        {transform: openingUpwards ? `translateY(-${height}px)` : ''},
        {transform: ''},
      ],
      {duration: FULL_DURATION, easing: EASING.EMPHASIZED},
    );
    const surfaceOpacityAnimation = surfaceEl.animate(
      [{opacity: 0}, {opacity: 1}],
      SURFACE_OPACITY_DURATION,
    );

    const childrenAnimations = [];

    for (let i = 0; i < children.length; i++) {
      const directionalIndex = openingUpwards ? children.length - 1 - i : i;
      const child = children[directionalIndex];
      const animation = child.animate([{opacity: 0}, {opacity: 1}], {
        duration: ITEM_OPACITY_DURATION,
        delay: DELAY_BETWEEN_ITEMS * i,
      })

      child.classList.toggle("u2-menu-hidden", true);
      animation.addEventListener("finish", () => {
        child.classList.toggle("u2-menu-hidden", false);
      });

      childrenAnimations.push([child, animation]);
    }

    let resolveAnimation = (value) => {};
    const animationFinished = new Promise((resolve) => {
      resolveAnimation = resolve;
    });

    signal.addEventListener("abort", () => {
      surfaceHeightAnimation.cancel();
      upPositionCorrectionAnimation.cancel();
      surfaceOpacityAnimation.cancel();
      childrenAnimations.forEach(([child, animation]) => {
        child.classList.toggle('u2-menu-hidden', false);
        animation.cancel();
      });
      resolveAnimation(true);
    })
    surfaceHeightAnimation.addEventListener("finish", () => {
      surfaceEl.classList.toggle("animating", false);
      this.openCloseAnimationSignal.finish();
      resolveAnimation(false);
    });

    return await animationFinished;
  }
  async animateClose () {
    const surfaceEl = this.surfaceEl;
    const slotEl = this.slotEl;

    if (!surfaceEl || !slotEl) return;

    const openDirection = this.openDirection;
    const closingDownwards = openDirection === "UP";
    this.dispatchEvent(new Event("closing"));
    surfaceEl.classList.toggle("animating", true);

    const signal = this.openCloseAnimationSignal.start();
    const height = surfaceEl.offsetHeight;
    const children = this.items;

    const FULL_DURATION = 150;
    const SURFACE_OPACITY_DURATION = 50;
    // The surface fades away at the very end
    const SURFACE_OPACITY_DELAY = FULL_DURATION - SURFACE_OPACITY_DURATION;
    const ITEM_OPACITY_DURATION = 50;
    const ITEM_OPACITY_INITIAL_DELAY = 50;
    const END_HEIGHT_PERCENTAGE = 0.35;

    const DELAY_BETWEEN_ITEMS =
      (FULL_DURATION - ITEM_OPACITY_INITIAL_DELAY - ITEM_OPACITY_DURATION) /
      children.length;

    const surfaceHeightAnimation = surfaceEl.animate(
      [
        {height: `${height}px`},
        {height: `${height * END_HEIGHT_PERCENTAGE}px`},
      ],
      {
        duration: FULL_DURATION,
        easing: EASING.EMPHASIZED_ACCELERATE,
      },
    );
    const downPositionCorrectionAnimation = slotEl.animate(
      [
        {transform: ""},
        {
          transform: closingDownwards
            ? `translateY(-${height * (1 - END_HEIGHT_PERCENTAGE)}px)`
            : "",
        },
      ],
      {duration: FULL_DURATION, easing: EASING.EMPHASIZED_ACCELERATE},
    );
    const surfaceOpacityAnimation = surfaceEl.animate(
      [{opacity: 1}, {opacity: 0}],
      {duration: SURFACE_OPACITY_DURATION, delay: SURFACE_OPACITY_DELAY},
    );

    const childrenAnimations = [];

     for (let i = 0; i < children.length; i++) {
      // If the animation is closing upwards, then reverse the list of
      // children so that we animate in the opposite direction.
      const directionalIndex = closingDownwards ? i : children.length - 1 - i;
      const child = children[directionalIndex];
      const animation = child.animate([{opacity: 1}, {opacity: 0}], {
        duration: ITEM_OPACITY_DURATION,
        delay: ITEM_OPACITY_INITIAL_DELAY + DELAY_BETWEEN_ITEMS * i,
      });

      // Make sure the items stay hidden at the end of each child animation.
      // We clean this up at the end of the overall animation.
      animation.addEventListener("finish", () => {
        child.classList.toggle('u2-menu-hidden', true);
      });
      childrenAnimations.push([child, animation]);
    }
    let resolveAnimation = (value) => {};
    const animationEnded = new Promise((resolve) => {
      resolveAnimation = resolve;
    });

    signal.addEventListener("finish", () => {
      surfaceHeightAnimation.cancel();
      downPositionCorrectionAnimation.cancel();
      surfaceOpacityAnimation.cancel();
      childrenAnimations.forEach(([child, animation]) => {
        animation.cancel();
        child.classList.toggle("u2-menu-hidden", false);
      });
      resolveAnimation(false);
    });
    surfaceHeightAnimation.addEventListener("finish", () => {
      surfaceEl.classList.toggle('animating', false);
      childrenAnimations.forEach(([child]) => {
        child.classList.toggle("u2-menu-hidden", false);
      });
      this.openCloseAnimationSignal.finish();
      this.dispatchEvent(new Event("closed"));
      resolveAnimation(true);
    });

    return await animationEnded;
  }
  async onOpened () {
    this.lastFocuesdElement = getFocusedElement();
    const items = this.items;
    const activeItemRecord = getActiveItem(items);

    if (activeItemRecord && this.defaultFocus !== FocusState.NONE) {
      activeItemRecord.item.tabIndex = -1;
    }
    // TODO: quick
    let animationAborted = await this.animateOpen();

    switch (this.defaultFocus) {
      case FocusState.FIRST_ITEM:
        const first = getFirstActivatableItem(items);
        if (first) {
          first.tabIndex = 0;
          first.focus();
          await first.updateComplete;
        }
        break;
      case FocusState.LAST_ITEM:
        const last = getLastActivatableItem(items);
        if (last) {
          last.tabIndex = 0;
          last.focus();
          await last.updateComplete;
        }
        break;
      case FocusState.LIST_ROOT:
        this.focus();
        break;
      default:
      case FocusState.NONE:
        break;
    }

    if (!animationAborted) {
      this.dispatchEvent(new Event("opened"));
    }
  }
  async beforeClose () {
    this.open = false;
    // TODO: skipRetoreFocus
    this.lastFocuesdElement?.focus?.();
    await this.animateClose();
  }
  onClosed () {
    // TODO: this.quick
    this.dispatchEvent(new Event("closing"));
    this.dispatchEvent(new Event("closed"));
  }
  getBoundingClientRect () {
    if (!this.surfaceEl) {
      return super.getBoundingClientRect();
    }
    return this.surfaceEl.getBoundingClientRect();
  }
  getClientRects () {
    if (!this.surfaceEl) {
      return super.getClientRects();
    }
    return this.surfaceEl.getClientRects();
  }
  setUpGlobalEventListeners () {
    document.addEventListener("click", this.onDocumentClick, {capture: true});
    window.addEventListener("pointerdown", this.onWindowPointerdown);
    document.addEventListener("resize", this.onWindowResize, {passive: true});
    window.addEventListener("resize", this.onWindowResize, {passive: true});
  }
  cleanUpGlobalEventListeners() {
    document.removeEventListener("click", this.onDocumentClick, {
      capture: true,
    });
    window.removeEventListener("pointerdown", this.onWindowPointerdown);
    document.removeEventListener("resize", this.onWindowResize);
    window.removeEventListener("resize", this.onWindowResize);
  }
  onWindowPointerdown (event) {
    this.pointerPath = event.composedPath();
  }
  onDocumentClick (event) {
    if (!this.open) {
      return;
    }

    const path = event.composedPath();

    if (
      !this.stayOpenOnOutsideClick &&
      !path.includes(this) &&
      !path.includes(this.anchorElement)
    ) {
      this.open = false;
    }
  }
  onWindowResize () {
    if (
      this.isRepositioning ||
      (this.positioning !== "document" &&
        this.positioning !== "fixed" &&
        this.positioning !== "popover")
    ) {
      return;
    }
    this.isRepositioning = true;
    this.reposition();
    this.isRepositioning = false;
  }
  close() {
    this.open = false;
    const maybeSubmenu = this.slotItems;
    maybeSubmenu.forEach((item) => {
      item.close?.();
    });
  }
  show() {
    this.open = true;
  }
  reposition() {
    if (this.open) {
      this.menuPositionController.position();
    }
  }

  render () {
    this.create();
    this.surfaceEl = this.shadowRoot.querySelector(".menu");
    this.slotEl = this.SLOT;
    this.slotItems = this.SLOT.assignedElements();
    this.rendered = true;
  }
  // override
  // method in LitElement
  // update(changed) {
  //   if (changed.has("open")) {
  //     if (this.open) {
  //       this.setUpGlobalEventListeners();
  //     } else {
  //       this.cleanUpGlobalEventListeners();
  //     }
  //   }

  //   // Firefox does not support popover. Fall-back to using fixed.
  //   if (
  //     changed.has("positioning") &&
  //     this.positioning === "popover" &&
  //     // type required for Google JS conformance
  //     !this.showPopover
  //   ) {
  //     this.positioning = "fixed";
  //   }

  //   super.update(changed);
  // }
  requestUpdate (style) { // 接收传入的最新 style
    // 每次调用 requestUpdate 都更新待处理的样式
    this._pendingStyle = style;
    // console.log("🚀 ~ Menu ~ requestUpdate ~ style:", style); // 这个日志会打印两次

    // 只有在没有正在进行的更新时才调度新的微任务
    if (!this.updatePromise) {
      this.updatePromise = new Promise(resolve => {
        this._resolveUpdatePromise = resolve;
      });
      // 调度异步更新
      queueMicrotask(() => {
        this._doUpdate(); // _doUpdate 不再接收参数
      });
    }
    // 返回 updateComplete Promise，供 position 函数 await
    return this.updateComplete;
  }
  _doUpdate () {
    if (this._pendingStyle) {
      updateInnerStyle(this.surfaceEl, this._pendingStyle);
      this._pendingStyle = null;
    }

    if (this._resolveUpdatePromise) {
      this._resolveUpdatePromise(true);
      this.updatePromise = null;
      this._resolveUpdatePromise = null;
    }
  }
}
if (!customElements.get("u2-menu")) {
  customElements.define("u2-menu", Menu);
}
