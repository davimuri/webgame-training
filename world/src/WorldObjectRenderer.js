export default class WorldObjectRenderer {
  #objects;
  #viewportWidth;
  #viewportHeight;
  #x;
  #y;

  constructor(objects, viewportWidth, viewportHeight) {
    this.#objects = objects;
    this.#objects.sort((o1, o2) => {
      var bounds1 = o1.getBounds();
      var bounds2 = o2.getBounds();
      return (bounds1.y + bounds1.h) - (bounds2.y + bounds2.h);
      });
    this.#viewportWidth = viewportWidth;
    this.#viewportHeight = viewportHeight;
    this.#x = 0;
    this.#y = 0;
  }

  move(deltaX, deltaY) {
    this.#x += deltaX;
    this.#y += deltaY;
  }

  setViewportSize(viewportWidth, viewportHeight) {
    this.#viewportWidth = viewportWidth;
    this.#viewportHeight = viewportHeight;
  }

  draw(ctx) {
    for (let i = 0; i < this.#objects.length; i++) {
      const pos = this.#objects[i].getPosition();
      this.#objects[i].draw(ctx, this.#x + pos.x, this.#y + pos.y);
    }
  }
}