import BoardModel from "./BoardModel";
import BoardRenderer from "./BoardRenderer";

export default class Game {
  #boardRect;
  #canvas;
  #ctx;
  #boardModel;
  #boardRenderer;
  #socket;
  #endGameFn;

  constructor(canvas, socket, endGameFn) {
    this.#boardRect = null;
    this.#canvas = canvas;
    this.#ctx = canvas.getContext("2d");
    this.#boardModel = new BoardModel();
    this.#boardRenderer = new BoardRenderer(this.#ctx, this.#boardModel);
    this.handleResize();
    this.#socket = socket;
    this.#endGameFn = endGameFn;
    socket.on("turnResult", (turn) => {
      console.log(`turnResult - turn: ${turn}`);
      this.#makeTurn(turn.x);
    });
    socket.on("error", function(error) {
      alert(error);
    });
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
    if (this.#boardModel.isTurnValid(column)) {
      console.log("Making request for turn");
      this.#requestTurn(column);
    } else {
      alert("Invalid turn");
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

  /**
   * Tell server that we are making turn. Do not place any tokens at this point
   * @param column the column to drop the piece to
   */
  #requestTurn(column) {
    this.#socket.emit("turn", column);
  }

  /**
   * Called when the server has responded, place the token and check
   * the result. If the game has ended - return to the lobby.
   * @param column the column where new piece was dropped
   */
  #makeTurn(column) {
    // Make the turn and check for the result
    const turn = this.#boardModel.makeTurn(column);
    // If the turn was legal, update the board, draw the new piece
    if (turn.status == BoardModel.ILLEGAL_TURN) {
      alert("Ouch, we're out of sync with server");
      return;
    }
    this.#boardRenderer.drawToken(turn.x, turn.y);
    // Do we have a winner after the last turn?
    if (turn.status != BoardModel.NONE) {
      this.#notifyAboutGameEnd(turn);
      this.#reset();
      this.#endGameFn();
    }
  }

  /**
   * Show the message to the player, when the game ends.
   * @param turn the last turn
   */
  #notifyAboutGameEnd(turn) {
    if (turn.status == BoardModel.WIN) {
        // Tell the world about it and reset the board for the next game
        alert((turn.piece == BoardModel.RED ? "red" : "green") + " won the match!");
    }

    // If we have the draw, do the same
    if (turn.status == BoardModel.DRAW) {
        alert("It is a draw!");
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