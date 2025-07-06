import BasicComponent from "../../class/BasicComponent.js";

export class ListItem extends BasicComponent {
  disabled = false;
  handleDisableState (child) {
    console.log("this.listItemRoot", child);
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
export function getFirstActivatableItem (
  items,
  isActivatable
) {
  for (const item of items) {
    if (isActivatable(item)) { return item; }
  }
  return null;
}