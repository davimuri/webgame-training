import GameObject from "../GameObject";
import Rect from "../Rect";

export default class RoundStateButton extends GameObject {
  static TERRAIN = "terrain";
  static OBJECTS = "objects";
  static MOVE = "move";
  static STATES = [RoundStateButton.TERRAIN, RoundStateButton.OBJECTS, RoundStateButton.MOVE];
  #image;
  #frame;

  /*
   * The RoundStateButton constructor accepts the image with three frames:
   * one frame for each state. frameWidth and frameHeight are the dimensions * of the single frame
   */
  constructor(image, frameWidth, frameHeight) {
    super(new Rect(0, 0, frameWidth, frameHeight || image.height));
    this.#image = image;
    this.#frame = 2;
    this.addListener("up", this.#onUpEvent.bind(this));
  }

  #onUpEvent(e) {
    e.stopped = true;
    this.nextFrame();
  }

  draw(ctx, dirtyRect, viewportX, viewportY) {
    const bounds = super.getBounds();
    ctx.drawImage(
      this.#image,
      bounds.width*this.#frame,
      0,
      bounds.width,
      bounds.height,
      bounds.x - viewportX || 0,
      bounds.y - viewportY || 0,
      bounds.width,
      bounds.height
    );
  }

  setFrame(frame) {
    this.#frame = frame; 
  }

  /**
   * Switch to the next state.
   * This function is executed when user taps the button.
   * Emits the event to notify the outer world about the change
   */
  nextFrame() {
    this.#frame = (this.#frame + 1) % 3;
    super.emit("change", {object: this});
  }
  
  getState() {
    return RoundStateButton.STATES[this.#frame];
  }
}