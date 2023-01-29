export default class BoardModel {
  static EMPTY = 0;
  static RED = 1;
  static GREEN = 2;
  static NONE = 0;
  static WIN = 1;
  static DRAW = 2;
  static ILLEGAL_TURN = 3;
  #cols;
  #rows;
  #data;
  #currentPlayer;
  #totalTokens;

  constructor(cols, rows) {
    this.#cols = cols || 7;
    this.#rows = rows || 6;
    this.reset();
  }

  reset() {
    this.#data = [];
    for (let i = 0; i < this.#rows; i++) {
      this.#data[i] = [];
      for (let j = 0; j < this.#cols; j++) {
        this.#data[i][j] = BoardModel.EMPTY;
      }
    }
    this.#currentPlayer = BoardModel.RED;
    this.#totalTokens = 0;
  }

  getPiece(col, row) {
    return this.#data[row][col];
  }

  getCols() {
    return this.#cols;
  }

  getRows() {
    return this.#rows;
  }

  isTurnValid(column) {
    // Check if the column is valid and if there's the empty row in the
    // given column. If there's no empty row, then the turn is illegal
    return (column >= 0 && column < this.#cols && this.#getEmptyRow(column) != -1);
  }

  makeTurn(column) {
    // The color of the piece that we're dropping
    const piece = this.#currentPlayer;
    // Check if the column is valid
    if (column < 0 || column > this.#cols) {
      return { status: BoardModel.ILLEGAL_TURN };
    }
    // Check if there's the empty row in the
    // given column, if there's no empty row, then
    // the turn is illegal
    const row = this.#getEmptyRow(column);
    if (row == -1) {
      return { status: BoardModel.ILLEGAL_TURN };
    }
    // We found the empty row, so we can drop the piece
    this.#totalTokens++;
    this.#data[row][column] = piece;
    // Change the next player
    this.#toggleCurrentPlayer();
    // Return the successful turn together with the new
    // state of the game (NONE, WIN or DRAW)
    return {
      status: this.#getGameState(column, row),
      x: column,
      y: row,
      piece: piece
    };
  }

  #getEmptyRow(column) {
    for (let i = this.#rows - 1; i >= 0; i--) {
      if (!this.getPiece(column, i)) {
        return i;
      }
    }
    return -1;
  }

  #toggleCurrentPlayer() {
    if (this.#currentPlayer == BoardModel.RED)
      this.#currentPlayer = BoardModel.GREEN;
    else
      this.#currentPlayer = BoardModel.RED;
  }

  #getGameState(column, row) {
    if (this.#totalTokens == this.#cols * this.#rows)
      return BoardModel.DRAW;
    for (let deltaX = -1; deltaX < 2; deltaX++) {
      for (let deltaY = -1; deltaY < 2; deltaY++) {
        if (deltaX == 0 && deltaY == 0) continue;
        const count = this.#checkWinDirection(column, row, deltaX, deltaY)
                    + this.#checkWinDirection(column, row, -deltaX, -deltaY) + 1;
        if (count >= 4) {
          return BoardModel.WIN;
        }
      }
    }
    return BoardModel.NONE;
  }

  #checkWinDirection(column, row, deltaX, deltaY) {
    const pieceColor = this.getPiece(column, row);
    let tokenCounter = 0;
    let c = column + deltaX;
    let r = row + deltaY;
    while (c >= 0 && r >= 0 && c < this.#cols && r < this.#rows &&
          this.getPiece(c, r) == pieceColor) {
      c += deltaX;
      r += deltaY;
      tokenCounter++;
    }
    return tokenCounter;
  }
}