import EventEmitter from "./EventEmitter";
import Rect from "./Rect";

export default class GameObject extends EventEmitter {
  static #maxId = 1;
  #id;
  #bounds;
  #dirtyRectManager;

  constructor(bounds) {
    super();
    this.#id = GameObject.#maxId++;
    this.#bounds = bounds || new Rect(0, 0, 100, 100);
    this.#dirtyRectManager = null;
  }

  draw(ctx, x, y, dirtyRect) {

  }

  setSize(width, height) {
    this.#bounds.width = width;
    this.#bounds.height = height;
  }

  move(deltaX, deltaY) {
    this.setPosition(this.#bounds.x + deltaX, this.#bounds.y + deltaY);
  }

  setPosition(x, y) {
    if (this.#bounds.x != x || this.#bounds.y != y) {
      const eventData = {
        oldX: this.#bounds.x,
        oldY: this.#bounds.y,
        x: x,
        y: y,
        object: this
      };
      this.#bounds.x = x;
      this.#bounds.y = y;
      this.emit("move", eventData);
    }
  }

  getBounds() {
    return this.#bounds;
  }

  getId() {
    return this.#id;
  }

  setDirtyRectManager(dirtyRectManager) {
    this.#dirtyRectManager = dirtyRectManager;
  }

  getDirtyRectManager() {
    return this.#dirtyRectManager;
  }

  markDirty(x, y, width, height) {
    if (this.#dirtyRectManager) {
        const rect = arguments.length == 1 ? x : new Rect(x, y, width, height);
        this.#dirtyRectManager.markDirty(rect);
    }
  }

}
