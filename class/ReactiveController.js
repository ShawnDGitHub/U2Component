import BasicComponent from './BasicComponent.js';

export class ReactiveControllerHost extends BasicComponent {
  constructor () {
    super();
    this.updateComplete = null;
  }
  add (controller) {}
  remove (controller) {}
    /**
   * Requests a host update which is processed asynchronously. The update can
   * be waited on via the `updateComplete` property.
   */
  requestUpdate () {}
  /**
   * Returns a Promise that resolves when the host has completed updating.
   * The Promise value is a boolean that is `true` if the element completed the
   * update without triggering another update. The Promise result is `false` if
   * a property was set inside `updated()`. If the Promise is rejected, an
   * exception was thrown during the update.
   *
   * @return A promise of a boolean that indicates if the update resolved
   *     without triggering another update.
   */
  // updateComplete = new Promise((resolve, reject) => {})
}
export class ReactiveController {
  connectedCallback() {}
  disconnectedCallback() {}
  // before the host calls its own update
  hostUpdate () {}
  hostUpdated () {}
}
