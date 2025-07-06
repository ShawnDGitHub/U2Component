import {
  ListItem,
  getFirstActivatableItem
} from "./util.js";
export const NavigableKeys = {
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowUp: 'ArrowUp',
  ArrowRight: 'ArrowRight',
  Home: 'Home',
  End: 'End',
};
export class ListController {
  constructor ({
    isItem,
    getPossibleItems,
    deactivateItem,
    activateItem,
    isNavigableKey,
    isActivatable
  }) {
    this.isItem = isItem;
    this.getPossibleItems = getPossibleItems;
    this.deactivateItem = deactivateItem;
    this.activateItem = activateItem;
    this.isNavigableKey = isNavigableKey;
    this.isActivatable = isActivatable;
  }
  get items () {
    const maybeItems = this.getPossibleItems();
    const items = [];

    for (const itemOrParent of maybeItems) {
      const isItem = this.isItem(itemOrParent);
      if (isItem) {
        items.push(itemOrParent);
        continue;
      }
      // sub-item
      const subItem = itemOrParent.item;
      if (subItem && this.isItem(subItem)) {
        items.push(subItem);
      }
    }
    return items;
  }
  onDeactivateItems = () => {
    const items = this.items;

    for (const item of items) {
      this.deactivateItem(item);
    }
  };
  onSlotchange = () => {
    const items = this.items;
    let encounteredActivated = false;
    for (const item of items) {
      const isActivated = !item.disabled && item.tabIndex > -1;
      if (isActivated && !encounteredActivated) {
        encounteredActivated = true;
        item.tabIndex = 0;
        continue;
      }
      item.tabIndex = -1;
    }
    if (encounteredActivated) { return; }
    const firstActivatableItem = getFirstActivatableItem(
      items,
      this.isActivatable
    );
    if (!firstActivatableItem) { return; }
    firstActivatableItem.tabIndex = 0;
  };
}
