import EventEmitter from "../EventEmitter";

/**
 * Listen to events from DOM element,
 * transform the events from DOM element to high level events ("up", "move", "down")
 * and emit those events to listeners.
 */
export default class InputHandlerBase extends EventEmitter {
  _element;
  #lastMoveCoordinates;
  _moving;
  #moveThreshold;
  #stopDomEvents;

  /**
   * 
   * @param element DOM element
   */
  constructor(element) {
    super();
    this._element = element;
    // Last known "move" coordinates, to calculate deltas
    this.#lastMoveCoordinates = null;
    // flag that indicates that we passed the "movement" threshold 
    // if true, then this is the real movement, not trembling
    this._moving = false;
    // the value of the move threshold in pixels
    this.#moveThreshold = 10;
    // If the listener should call stopPropagation/preventDefault on DOM events
    this.#stopDomEvents = true;
  }

  /**
   * Listens to the "down" DOM events: mousedown and touchstart. 
   * @param e DOM Event
   */
  _onDownDomEvent(e) {
    // We must save this coordinates to support the moveThreshold
    // This may be the starting point of the movement.
    const coords = this.#lastMoveCoordinates = this._getInputCoordinates(e);
    // Emit "down" event - all coordinates together with the
    // original DOM event are passed to listeners 
    super.emit("down", {x: coords.x, y: coords.y, domEvent: e});
    // Usually we want to stop the original DOM events from further browser processing.
    this._stopEventIfRequired(e);
  };

  /**
   * Listens to the "move" DOM events: mousemove and touchmove.
   * It keeps track of the distance travelled since the last
   * "move" action, besides it ignores the movement and swallows the event if we are
   * still within the #moveThreshold
   * @param e DOM event
   */
  _onMoveDomEvent(e) {
    const coords = this._getInputCoordinates(e);
    // Calculate deltas
    const deltaX = coords.x - this.#lastMoveCoordinates.x;
    const deltaY = coords.y - this.#lastMoveCoordinates.y;
    // Check threshold, if the distance from the initial tap to the current position
    // is more than the threshold value - qualify it as a real movement
    if (!this._moving && Math.sqrt(deltaX*deltaX + deltaY*deltaY) > this.#moveThreshold) {
      this._moving = true;
    }
    // If the current interaction is "moving" (we crossed the threshold already) 
    // then emit the event, otherwise, just ignore the interaction.
    if (this._moving) {
      super.emit("move", {x: coords.x, y: coords.y, deltaX: deltaX, deltaY: deltaY, domEvent: e});
      this.#lastMoveCoordinates = coords;
    }
    this._stopEventIfRequired(e);
  }

  /**
   * Listens to the "up" DOM events: mouseup and touchend. Touchend
   * doesn't have any coordinates associated with it so this function
   * will be overridden in TouchInputHandler
   * @param e DOM Event
   */
  _onUpDomEvent(e) {
    // Works exactly the same way as onDownDomEvent
    const coords = this._getInputCoordinates(e);
    super.emit("up", {x: coords.x, y: coords.y, moved: this._moving, domEvent: e});
    this._stopEventIfRequired(e);
    // The interaction is ended. Reset the flag
    this._moving = false;
  }

  get element() {
    return this._element;
  }

  /**
   * Supports compatibility with firefox events that use clientX and clientY
   * and consider the case when web page has scrolls
   * @param e 
   * @returns object with x and y coordinates
   */
  _getInputCoordinates(e) {
    const element = this._element;
    const coords = e.targetTouches ? e.targetTouches[0] : e;
    return {
      x: (coords.pageX || coords.clientX + document.body.scrollLeft) - element.offsetLeft,
      y: (coords.pageY || coords.clientY + document.body.scrollTop) - element.offsetTop
    };
  }

  _stopEventIfRequired(e) {
    console.log("InputHandlerBase._stopEventIfRequired()");
    console.log(e);
    if (this.#stopDomEvents) {
      e.stopPropagation();
      e.preventDefault();
    }
  }
}