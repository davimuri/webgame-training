import BoardModel from "./BoardModel";
import BoardRenderer from "./BoardRenderer";

export default class Game {
  #boardRect;
  #canvas;
  #ctx;
  #boardModel;
  #boardRenderer;

  constructor(canvas) {
    this.#boardRect = null;
    this.#canvas = canvas;
    this.#ctx = canvas.getContext("2d");
    this.#boardModel = new BoardModel();
    this.#boardRenderer = new BoardRenderer(this.#ctx, this.#boardModel);
    this.handleResize();
  }

  handleResize() {
    this.#clearCanvas();
    this.#boardRect = this.#getBoardRect();
    this.#boardRenderer.setSize(this.#boardRect.x, this.#boardRect.y,
      this.#boardRect.cellSize);
    this.#boardRenderer.repaint();
  }

  handleClick(x, y) {
    // get the column index
    const column = Math.floor((x - this.#boardRect.x)/this.#boardRect.cellSize);
    // Make the turn and check for the result
    const turn = this.#boardModel.makeTurn(column);
    // If the turn was legal, update the board, draw the new piece
    if (turn.status != BoardModel.ILLEGAL_TURN) {
      this.#boardRenderer.drawToken(turn.x, turn.y);
    }
    // Do we have a winner after the last turn?
    if (turn.status == BoardModel.WIN) {
      // Tell the world about it and reset the board for the next game
      alert((turn.piece == BoardModel.RED ? "red" : "green") + " won the match!");
      this.#reset();
    }
    // If we have the draw, do the same
    if (turn.status == BoardModel.DRAW) {
      alert("It is a draw!");
      this.#reset();
    }
  }

  #getBoardRect() {
    const cols = this.#boardModel.getCols();
    const rows = this.#boardModel.getRows();
    const cellSize = Math.floor(
      Math.min(this.#canvas.width/cols, this.#canvas.height/rows));
    const boardWidth = cellSize*cols;
    const boardHeight = cellSize*rows;
    return {
      x: Math.floor((this.#canvas.width - boardWidth)/2),
      y: Math.floor((this.#canvas.height - boardHeight)/2),
      cellSize: cellSize
    }
  }

  #reset() {
    this.#clearCanvas();
    this.#boardModel.reset();
    this.#boardRenderer.repaint();
  }

  #clearCanvas() {
    this.#ctx.fillStyle = "white";
    this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
  }
}