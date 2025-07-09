import BasicComponent from "../../class/BasicComponent.js";

export class ListItem extends BasicComponent {
  disabled = false;
  handleDisableState (child) {
    const disabled = this.getAttribute("disabled");
    if (disabled === "" || disabled) {
      this.setAttribute("tabindex", -1);
      this.setAttribute("aria-disabled", true);
      child.classList.add("disabled");
    } else {
      this.setAttribute("aria-disabled", false);
      child.classList.remove("disabled");
    }
  }
}
function isItemNotDisabled (item) {
  return !item.disabled;
}
export function getActiveItem (
  items,
  isActivatable = isItemNotDisabled
) {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.tabIndex === 0 && isActivatable(item)) {
      return {
        item,
        index: i
      }
    }
  }
  return null;
}
export function getFirstActivatableItem (
  items,
  isActivatable = isItemNotDisabled
) {
  for (const item of items) {
    if (isActivatable(item)) { return item; }
  }
  return null;
}
export function getLastActivatableItem (
  items,
  isActivatable = isItemNotDisabled,
) {
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (isActivatable(item)) {
      return item;
    }
  }

  return null;
}
