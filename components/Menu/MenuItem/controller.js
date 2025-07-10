import { ReactiveController } from '../../../class/ReactiveController.js';

export class MenuItemController extends ReactiveController {
  getHeadlineElements = () => {};
  getDefaultElements = () => {};

  constructor (
    host,
    {
      getHeadlineElements,
      getDefaultElements
    }
  ) {
    super();
    this.host = host;
    this.getHeadlineElements = getHeadlineElements;
    this.getDefaultElements = getDefaultElements;
    this.host.add(this);
  }

  get tagName () {
    const type = this.host.type;
    switch (type) {
      case "button": 
        return "button";
      default:
      case "option":
      case "menuitem":
        return "li";
    }
  }
  get role () {
    return this.host.type === "option" ? "option" : "menuitem";
  }
  hostConnected() {
    this.host.toggleAttribute("u2-menu-item", true);
  }
  // set event
}
