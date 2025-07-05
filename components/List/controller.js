export class ListController {
  constructor ({
    isItem,
    getPossibleItems,
    deactivateItem,
    activateItem,
    isNavigableKey
  }) {
    this.isItem = isItem;
    this.getPossibleItems = getPossibleItems;
    this.deactivateItem = deactivateItem;
    this.activateItem = activateItem;
    this.isNavigableKey = isNavigableKey;
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

}
