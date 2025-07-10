import { ReactiveControllerHost } from '../../class/ReactiveController.js';

export class MenuItem extends ReactiveControllerHost {
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
  selected = false;
  type = "menuitem"; // menuitem | option | button
  keepOpen = false;
  focus = () => {};
  constructor () {
    super();
  }
}
export function updateInnerStyle (element, style) {
  for (let key in style) {
    element.style[key] = style[key];
  }
}
export function getActiveItem (
  items,
  isActivatable = isItemNotDisabled,
) {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.tabIndex === 0 && isActivatable(item)) {
      return {
        item,
        index: i,
      };
    }
  }
  return null;
}
function isItemNotDisabled (item) {
  return !item.disabled;
}
