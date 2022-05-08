export default class WorldObject {
  #spriteSheet;
  #frame;
  #x;
  #y;

  constructor(spriteSheet, frame) {
    this.#spriteSheet = spriteSheet;
    this.#frame = frame;
    this.#x = 0;
    this.#y = 0;
  }

  getPosition() {
    return {
      x: this.#x,
      y: this.#y
    }
  }

  setPosition(x, y) {
    this.#x = x;
    this.#y = y;
  }

  draw(ctx, x, y) {
    this.#spriteSheet.drawFrame(ctx, this.#frame, x, y);
  }

  getBounds() {
    return this.#spriteSheet.getFrameBounds(this.#frame, this.#x, this.#y); 
  }

}