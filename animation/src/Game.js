import Ball from './Ball';

export default class Game {
  #entities;
  #entitySelected;
  #canvas;
  #ctx;

  constructor(canvas) {
    this.#canvas = canvas;
    this.#ctx = canvas.getContext("2d");
    this.#entities = new Array();
    this.#entitySelected = undefined;
  }

  handleClick(x, y) {
    const ball = new Ball(x, y);
    ball.startAnimation();
    this.#entities.push(ball);
    console.log("Game.handleClick()");
    console.log(this.#entities);
  }

  handleDown(event) {
    console.log("handleDown");
    this.#entities.forEach(e => {
      if (e.isPointInside(event.x, event.y)) {
        this.#entitySelected = e;
        this.#entitySelected.stopAnimation();
      }
    });
    console.log(this.#entitySelected);
  }

  handleMove(event) {
    console.log("handleMove");
    console.log(this.#entitySelected);
    if (this.#entitySelected) {
      this.#entitySelected.move(event.deltaX, event.deltaY);
    }
  }

  handleUp(event) {
    console.log("handleUp");
    if (this.#entitySelected) {
      this.#entitySelected.restartAnimation();
      this.#entitySelected = undefined;
    } else {
      this.#createBall(event.x, event.y);
    }
  }

  update(deltaTime) {
    this.#entities.forEach(e => e.update(deltaTime));
    this.#clearCanvas();
    this.#entities.forEach(e => e.draw(this.#ctx));
  }

  handleResize() {
    this.#clearCanvas();
  }

  #createBall(x, y) {
    const ball = new Ball(x, y);
    ball.startAnimation();
    this.#entities.push(ball);
  }

  #clearCanvas() {
    this.#ctx.fillStyle = "white";
    this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
  }
}