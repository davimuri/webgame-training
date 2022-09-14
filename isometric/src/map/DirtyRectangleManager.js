import Rect from '../Rect';

export default class DirtyRectangleManager {
  #allDirtyThreshold;
  #viewport;
  #dirtyRect;
  #allDirty;

  /**
   * The constructor accepts the single parameter, the value of the threshold.
   * The value is the number between 0 and 1.
   * 0 means – every time there is the dirty rectangle,
   * repaint the whole screen, 1 means – never use the threshold, * repaint the whole frame only when it is really all dirty
   */
  constructor(allDirtyThreshold) {
    // Save the threshold value, default is 0.5
    this.#allDirtyThreshold = allDirtyThreshold == undefined ? 0.5 : allDirtyThreshold;
    // The parameters of the viewport
    this.#viewport = new Rect(0, 0, 100, 100);
    // Current dirty rectangle that covers all smaller dirty areas
    this.#dirtyRect = null;
    // true when we have reached the trheshold
    this.#allDirty = true;
    // We start from marking all screen as dirty.
    // Need to repaint it all for the first time!
    this.markAllDirty();
  }

  /**
   * Set the size of the viewport.
   */
  setViewport(width, height) {
    if (this.#viewport.width == width && this.#viewport.height == height) {
      return;
    }
    this.#viewport.width = width;
    this.#viewport.height = height;
    this.markAllDirty();
  }
  
  /**
   * Mark the given area as dirty. This is the main function used by the
   * layers API to notify that the part of the layer has changed during the update
   * and it has to be repainted on the next frame
   */
  markDirty(rect) {
    if (!(rect.width || rect.height) || this.#allDirty) {
      return;
    }
    // We are only interested in the rectangles that intersect the viewport
    // if a rectangle is far away beyond the visible part of the world, there’s no
    // sense to track it
    rect = this.#viewport.intersection(rect);
    if (!rect) {
      return;
    }
    // If there is already some area marked as dirty, we find the rectangle that covers
    // both the current dirty rectangle and the new one
    if (this.#dirtyRect) {
      this.#dirtyRect = this.#dirtyRect.convexHull(rect);
    } else {
      // If this is the first dirty rectangle, save it as the dirty area.
      this.#dirtyRect = this.#viewport.intersection(rect);
    }
    // Check for threshold. If it is reached, mark the whole screen dirty
    if (this.#dirtyRect.width * this.#dirtyRect.height >
        this.#allDirtyThreshold*this.#viewport.width*this.#viewport.height) {
      this.markAllDirty();
    }
  }

  /**
   * Clear the dirty regions. This is usually done after the repaint, when all dirty
   * parts have the new content and they are clean again.
   */
  clear() {
    this.#dirtyRect = null;
    this.#allDirty = false;
  }

  /**
   * Mark the whole viewport as dirty.
   */
  markAllDirty() {
    this.#allDirty = true;
    this.#dirtyRect = this.#viewport.copy();
  }

  /**
   * Returns true if there are no dirty rectangles registered this frame
   * (no need to repaint anything at all)
   */
  isAllClean() {
    return !(this.#dirtyRect);
  }

  /**
   * Returns true if the whole viewport is dirty
   * (repaint everything)
   */
  isAllDirty() {
    return this.#allDirty;
  }

  /**
   * Returns the current dirty rectangle that covers all registered dirty areas
   */
  getDirtyRect() {
    return this.#dirtyRect;
  }
}