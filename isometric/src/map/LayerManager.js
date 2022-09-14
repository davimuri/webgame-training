import GameObject from "../GameObject";

export default class LayerManager extends GameObject {
  #layers;

  constructor() {
    super();
    this.#layers = [];
    this.addListener("up", this.#onUpEvent.bind(this));
  }

  setSize(width, height) {
    super.setSize(width, height);
    for (let i = 0; i < this.#layers.length; i++) {
      this.#layers[i].setSize(width, height);
    }
  }

  setPosition(x, y) {
    super.setPosition(x, y);
    for (let i = 0; i < this.#layers.length; i++) {
      this.#layers[i].setPosition(x, y);
    }
  }

  setDirtyRectManager(dirtyRectManager) {
    super.setDirtyRectManager(dirtyRectManager);
    for (let i = 0; i < this.#layers.length; i++) {
      this.#layers[i].setDirtyRectManager(dirtyRectManager);
    }
  }

  #onUpEvent(e) {
    for (let i = this.#layers.length - 1; i >= 0; i--) {
      this.#layers[i].emit("up", e);
      if (e.stopped) {
        return;
      }
    }
  }

  draw(ctx, dirtyRect) {
    for (let i = 0; i < this.#layers.length; i++) {
      this.#layers[i].draw(ctx, dirtyRect);
    }
  }

  addLayer(layer) {
    const dirtyRectManager = super.getDirtyRectManager();
    if (dirtyRectManager) {
      layer.setDirtyRectManager(dirtyRectManager);
    }
    this.#layers.push(layer);
  }

  getLayerAt(i) {
    return this.#layers[i];
  }
}