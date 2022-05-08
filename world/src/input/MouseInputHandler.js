import InputHandlerBase from "./InputHandlerBase";

/**
 * The implementation of the InputHandler for the desktop
 * browser based on the mouse events.
 */
export default class MouseInputHandler extends InputHandlerBase {
  #mouseDown;

  constructor(element) {
    super(element);
    this.#mouseDown = false;
    this.#attachDomListeners();
  }

  /**
   * This method (and the next one) is overridden,
   * because we have to track the state of the mouse.
   * This could also be done in the separate listener.
   */
  _onDownDomEvent(e) {
    this.#mouseDown = true;
    console.log("MouseInputHandler._onDownDomEvent()");
    super._onDownDomEvent(e);
  }

  _onUpDomEvent(e) {
    this.#mouseDown = false;
    super._onUpDomEvent(e);
  }

  /**
   * We process the move event only if the mouse button is
   * pressed, otherwise the DOM event is ignored.
   */
  _onMoveDomEvent(e) {
    if (this.#mouseDown) {
      console.log("MouseInputHandler._onMoveDomEvent()");
      super._onMoveDomEvent(e);
    }
  }

  _onMouseOut() {
    this.#mouseDown = false;
  }

  /**
   * Attach the listeners to the mouseXXX DOM events
   */
  #attachDomListeners() {
    const el = super.element;
    el.addEventListener("mousedown", this._onDownDomEvent.bind(this), false);
    el.addEventListener("mouseup", this._onUpDomEvent.bind(this), false);
    el.addEventListener("mousemove", this._onMoveDomEvent.bind(this));
    el.addEventListener("mouseout", this._onMouseOut.bind(this));
  }
}