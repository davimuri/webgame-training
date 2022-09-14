import InputHandlerBase from "./InputHandlerBase";

export default class TouchInputHandler extends InputHandlerBase {
  #lastInteractionCoordinates;

  constructor(element) {
    super(element);
    this.#lastInteractionCoordinates = null;
    this.#attachDomListeners();
  }

  _onDownDomEvent(e) {
    this.#lastInteractionCoordinates = super._getInputCoordinates(e);
    super._onDownDomEvent(e);
  }

  _onUpDomEvent(e) {
    super.emit("up", {
            x: this.#lastInteractionCoordinates.x,
            y: this.#lastInteractionCoordinates.y,
            moved: super._moving,
            domEvent: e
        });
    super._stopEventIfRequired(e);
    this.#lastInteractionCoordinates = null;
    super._moving = false;
  }

  _onMoveDomEvent(e) {
    this.#lastInteractionCoordinates = super._getInputCoordinates(e);
    super._onMoveDomEvent(e);
  }

  #attachDomListeners() {
    const el = super.element;
    el.addEventListener("touchstart", this._onDownDomEvent.bind(this), false);
    el.addEventListener("touchend", this._onUpDomEvent.bind(this), false);
    el.addEventListener("touchmove", this._onMoveDomEvent.bind(this), false);
  }
}