/**
 * EventEmitter is the class responsible
 * for holding the registry of listeners
 * and notifying them about the new events
 */
export default class EventEmitter {
  #listeners;

  constructor() {
    this.#listeners = {};
  }

  /**
   * Registers the function as the listener to receive the notifications
   * about the events of the given type
   * @param type the type of the event
   * @param listener the function to add to the list of listeners
   */
  addListener(type, listener) {
    if (typeof listener !== "function") {
      throw "Listener must be a function";
    }
    if (!this.#listeners[type]) {
      this.#listeners[type] = [];
    }
    this.#listeners[type].push(listener)
  }

  /*
   * Unsubscribes the given listerer from the given event type
   * @param type the type of the event
   * @param listener the function to remove from the list of listeners
   */
  removeListener(type, listener) {
    if (typeof listener !== "function") {
      throw "Listener must be a function";
    }
    if (!this.#listeners[type]) {
      return;
    }
    const position = this.#listeners[type].indexOf(listener);
    if (position != -1) {
      this.#listeners[type].splice(position, 1);
    }
  }

  /**
   * Remove all listeners registered for the given type of the
   * event. If type is omitted, removes all listeners from the object. * @param type the type of the event (optional)
   */
  removeAllListeners(type) {
    if (type) {
      this.#listeners[type] = [];
    } else {
      this.#listeners = {};
    }
  }

  /**
   * Notifies all listeners subscribed to the given event type,
   * passing the event object as the parameter
   * @param type the type of the event
   * @param event the event object
   */
  emit(type, event) {
    if (!(this.#listeners[type] && this.#listeners[type].length)) {
      return;
    }
    for (let i = 0; i < this.#listeners[type].length; i++) {
      this.#listeners[type][i](event);
    }
  }
}