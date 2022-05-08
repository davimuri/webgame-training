
import MapRenderer from "./MapRenderer";

export default class Game {
  #entities;
  #entitySelected;
  #canvas;
  #ctx;
  #mapRenderer;
  #worldObjectRenderer;

  constructor(canvas) {
    this.#canvas = canvas;
    this.#ctx = canvas.getContext("2d");
    this.#entities = new Array();
    this.#entitySelected = undefined;
  }

  handleClick(x, y) {
    console.log("Game.handleClick()");
    console.log(this.#entities);
  }

  handleDown(event) {
    console.log("Game.handleDown");
    this.#entities.forEach(e => {
      if (e.isPointInside(event.x, event.y)) {
        this.#entitySelected = e;
      }
    });
    console.log(this.#entitySelected);
  }

  handleMove(event) {
    console.log("Game.handleMove");
    this.#mapRenderer.move(event.deltaX, event.deltaY);
    this.#worldObjectRenderer.move(event.deltaX, event.deltaY);
    if (this.#entitySelected) {
      console.log(this.#entitySelected);
    }
  }

  handleUp(event) {
    console.log("Game.handleUp");
    if (this.#entitySelected) {
      this.#entitySelected = undefined;
    } else {
    }
  }

  update(deltaTime) {
    this.#entities.forEach(e => e.update(deltaTime));
    this.#clearCanvas();
    this.#mapRenderer.draw(this.#ctx);
    this.#worldObjectRenderer.draw(this.#ctx);
    this.#entities.forEach(e => e.draw(this.#ctx));
  }

  handleResize() {
    this.#clearCanvas();
    this.#mapRenderer && this.#mapRenderer.setViewportSize(this.#canvas.width, this.#canvas.height);
    this.#worldObjectRenderer && this.#worldObjectRenderer.setViewportSize(this.#canvas.width, this.#canvas.height);
  }

  #clearCanvas() {
    this.#ctx.fillStyle = "green";
    this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
  }

  set mapRenderer(mapRenderer) {
    this.#mapRenderer = mapRenderer;
  }

  set worldObjectRenderer(objectRenderer) {
    this.#worldObjectRenderer = objectRenderer;
  }
}