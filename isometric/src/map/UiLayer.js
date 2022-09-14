import Arrays from "../Arrays";
import GameObject from "../GameObject";
import Rect from "../Rect";

export default class UiLayer extends GameObject {
  #objects;

  constructor(objects) {
    super();
    this.#objects = objects;
    this.#addChangeListeners();
    this.addListener("up", this.#onUpEvent.bind(this));
  }

  setPosition(x, y) {
    // Ignore
  }

  move(deltaX, deltaY) { 
    // Ignore
  }

  draw(ctx, dirtyRect) {
    // If no dirtyRect is provided – draw every visible object
    const layerBounds = super.getBounds();
    dirtyRect = dirtyRect || layerBounds;
    for (let i = 0; i < this.#objects.length; i++) {
      const obj = this.#objects[i];
      const bounds = obj.getBounds();
      // Draw only those objects that intersect the dirty rect
      if (bounds.intersects(dirtyRect)) {
        obj.draw(ctx, dirtyRect, layerBounds.x, layerBounds.y);
      }
    }
  }

  addObject(obj) {
    this.#objects.push(obj);
  }

  removeObject(obj) {
    if (this.#objects.includes(obj)) {
      Arrays.remove(obj, this.#objects);
    }
  }

  #onUpEvent(e) {
    if (e.moved)
      return;
    
    const obj = this.getObjectAt(e.x, e.y);
    if (obj) {
      obj.emit("up", e);
      this.emit("objectClicked", {object: obj, layer: this, cause: e});
    }
  }

  /**
   * Returns the object at a given x, y coordinates,
   * if no object there – return null
   */
  getObjectAt(x, y) {
    for (let i = 0; i < this.#objects.length; i++) {
      if (this.#objects[i].getBounds().containsPoint(x, y)) {
        return this.#objects[i];
      }
    }
    return null;
  }

  /**
   * If one of the objects says that it has changed – mark the area as dirty.
   * Objects of this layer are stored in screen coordinates so there’s no need
   * to translate from world coordinates in this function.
   */
  #onObjectChange(e) {
    const obj = e.object;
    this.markDirty(obj.getBounds());
  }

  /**
   * Track change events on every object
   */
  #addChangeListeners() {
    const boundOnChange = this.#onObjectChange.bind(this);
    for (let i = 0; i < this.#objects.length; i++) {
      this.#objects[i].addListener("change", boundOnChange);
    }
  }

}