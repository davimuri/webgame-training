import EventEmitter from "../EventEmitter";
import InputHandler from "./InputHandler";

export default class Joystick extends EventEmitter {
  #canvas;
  #ctx;
  #x;
  #y;
  #controllerRadius;
  #azimuth;
  #radius;
  #deltaX;
  #deltaY;

  constructor(canvas) {
    super();
    this.#canvas = canvas;
    this.#ctx = canvas.getContext("2d");

    // The position of joystic inside the canvas
    this.#x = 0;
    this.#y = 0;
    this.#controllerRadius = 100;

    // Current azimuth and radius
    this.#azimuth = 0;
    this.#radius = 0;

    // Current position of the stick relative to the center
    this.#deltaX = 0;
    this.#deltaY = 0;

    const input = new InputHandler(canvas);

    // Joystic is all about movement. We don't need any thresholds here
    input.setMoveThreshold(0);

    // Bind DOM listeners
    const bindedDownOrMove = this.#onDownOrMove.bind(this);
    input.on("move", bindedDownOrMove);
    input.on("down", bindedDownOrMove);
    input.on("up", this.#onUp.bind(this));
  }

  draw() {
    this.#ctx.fillStyle = "lightgreen";
    this.#ctx.strokeStyle = "darkgray";
    this.#ctx.lineWidth = 5;

    this.#ctx.beginPath();
    this.#ctx.arc(this.#x, this.#y, this.#controllerRadius, 0, Math.PI*2, false);
    this.#ctx.fill();
    this.#ctx.stroke();

    this.#ctx.fillStyle = "lightblue";
    this.#ctx.beginPath();
    this.#ctx.arc(this.#x + this.#deltaX, this.#y + this.#deltaY, 30, 0, Math.PI*2, false);
    this.#ctx.fill();
    this.#ctx.stroke();
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

  get controllerRadius() {
    return this.#controllerRadius;
  }

  set controllerRadius(controllerRadius) {
    this.#controllerRadius = controllerRadius;
  }

  get radius() {
    return this.#radius;
  }

  get azimuth() {
    return this.#azimuth;
  }

  #onDownOrMove(coords) {
    // When we receive the "down" or "move" events we save current
    // deltas and update radius and azimuth
    const deltaX = coords.x - this.#x;
    const deltaY = coords.y - this.#y;
    this.#updateJoystickValues(deltaX, deltaY);
  }

  #onUp() {
    // If there's no interaction, restore the idle state
    this.#updateJoystickValues(0, 0);
  }

  #updateJoystickValues(deltaX, deltaY) {
    let newAzimuth = 0;
    let newRadius = 0;

    // In case if the joystick is idle, we don't need to proceed with calculations
    if (deltaX != 0 || deltaY != 0) {
      newRadius = Math.sqrt(deltaX*deltaX + deltaY*deltaY)/this.#controllerRadius;

      // User slided too far away, joystick is returned to idle state
      if (newRadius > 1) {
        deltaX = 0;
        deltaY = 0;
        newRadius = 0;
      } else {
        newAzimuth = Math.atan2(deltaY, deltaX);
      }
    }

    // If the values have actually changed, notify listeners
    if (this.#azimuth != newAzimuth || this.#radius != newRadius) {
      this.#azimuth = newAzimuth;
      this.#radius = newRadius;
      this.#deltaX = deltaX;
      this.#deltaY = deltaY;
      this.emit("joystickchange", {
        azimuth: newAzimuth,
        radius: newRadius
      });
    }
  }
}