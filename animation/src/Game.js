import Ball from './Ball';

export default class Game {
  #entities;
  #canvas;
  #ctx;

  constructor(canvas) {
    this.#canvas = canvas;
    this.#ctx = canvas.getContext("2d");
    this.#entities = new Array();
  }

  handleClick(x, y) {
    const ball = new Ball(x, y);
    ball.startAnimation();
    this.#entities.push(ball);
    console.log("Game.handleClick()");
    console.log(this.#entities);
  }

  update(deltaTime) {
    this.#entities.forEach(e => e.update(deltaTime));
    this.#clearCanvas();
    this.#entities.forEach(e => e.draw(this.#ctx));
  }

  handleResize() {
    this.#clearCanvas();
  }

  #clearCanvas() {
    this.#ctx.fillStyle = "white";
    this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
  }
}