import Animator from "./Animator";
import PropertyAnimator from "./PropertyAnimator";
import { getRandomInt } from "./util";

export default class Ball {
  static MIN_RADIUS = 10;
  static MAX_RADIUS = 80;
  static MIN_X = 20;
  static MAX_X = 1300;
  static MIN_Y = 20;
  static MAX_Y = 500;
  #propertyAnimator;
  #radius;
  #x;
  #y;

  constructor(x, y) {
    this.#x = x;
    this.#y = y;
    this.#radius = Ball.MIN_RADIUS;
    this.#initPropertyAnimator();
  }

  #initPropertyAnimator() {
    const self = this;
    const random = getRandomInt(3);
    let animationSetting = {
      "setter": r => self.setRadius(r),
      "start": Ball.MIN_RADIUS,
      "end": Ball.MAX_RADIUS
    };
    if (random == 1) {
      animationSetting = {
        "setter": v => self.setX(v),
        "start": self.#x,
        "end": Ball.MAX_X
      };
    } else if (random == 2) {
      animationSetting = {
        "setter": v => self.setY(v),
        "start": self.#y,
        "end": Ball.MAX_Y
      };
    }
    this.#propertyAnimator = new PropertyAnimator(1000, [animationSetting]);
    this.#propertyAnimator.setRepeatCount(Animator.INFINITE);
    this.#propertyAnimator.setRepeatBehavior(Animator.REPEAT_BEHAVIOR.REVERSE);
    this.#propertyAnimator.setAcceleration(0.8);
    this.#propertyAnimator.setDeceleration(0.15);
  }

  startAnimation() {
    this.#propertyAnimator.start();
  }

  stopAnimation() {
    this.#propertyAnimator.stop();
  }

  update(deltaTime) {
    this.#propertyAnimator.update(deltaTime);
  }

  draw(ctx) {
    const grad = ctx.createRadialGradient(this.#x + 5, this.#y - 5, 4, this.#x + 5, this.#y - 5, this.#radius + 2);
    grad.addColorStop(0, "yellow");
    grad.addColorStop(1, "red");
    ctx.fillStyle = grad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.#x, this.#y, this.#radius, 0, 2*Math.PI, false);
    ctx.fill();
  }

  isPointInside(x, y) {
    const deltaX = this.#x - x;
    const deltaY = this.#y - y;
    return deltaX * deltaX + deltaY * deltaY <= this.#radius * this.#radius;
  }

  move(deltaX, deltaY) {
    this.#x += deltaX;
    this.#y += deltaY;
  }

  restartAnimation() {
    this.#initPropertyAnimator();
    this.startAnimation();
  }

  setRadius(radius) {
    this.#validate_range(radius, Ball.MIN_RADIUS, Ball.MAX_RADIUS);
    this.#radius = radius;
  }

  setX(x) {
    this.#validate_range(x, Ball.MIN_X, Ball.MAX_X);
    this.#x = x;
  }

  setY(y) {
    this.#validate_range(y, Ball.MIN_Y, Ball.MAX_Y);
    this.#y = y;
  }

  #validate_range(value, min, max) {
    if (value < min || value > max) {
      throw "Wrong value";
    }
  }
}