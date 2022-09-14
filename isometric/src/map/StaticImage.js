import GameObject from "../GameObject";
import Rect from "../Rect";

export default class StaticImage extends GameObject {
  #image;

  constructor(image, x, y, w, h) {
    super(new Rect(x, y, w || image.width, h || image.height));
    this.setPosition(x, y)
    this.#image = image;
  }

  draw(ctx, viewportX, viewportY, dirtyRect) {
    const bounds = this.getBounds();
    ctx.drawImage(this.#image, bounds.x - viewportX, bounds.y - viewportY);
  }
}