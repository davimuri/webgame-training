import BoardModel from './BoardModel';

export default class BoardRenderer {
  #ctx;
  #model;
  #cols = 0;
  #rows = 0;
  #x = 0;
  #y = 0;
  #width = 0;
  #height = 0;
  #cellSize = 0;

  constructor(context, model) {
    this.#ctx = context;
    this.#model = model;
    this.#cols = model.getCols();
    this.#rows = model.getRows();
  }

  setSize(x, y, cellSize) {
    this.#x = x;
    this.#y = y;
    this.#cellSize = cellSize;
    this.#width = this.#cellSize*this.#cols;
    this.#height = this.#cellSize*this.#rows;
  }

  #drawBackground() {
    // Background
    const gradient = this.#ctx.createLinearGradient(0, 0, 0, this.#height);
    gradient.addColorStop(0, "#fffbb3");
    gradient.addColorStop(1, "#f6f6b2");
    this.#ctx.fillStyle = gradient;
    this.#ctx.fillRect(0, 0, this.#width, this.#height);
    // Drawing curves
    const co = this.#width/6; // curve offset
    this.#ctx.strokeStyle = "#dad7ac";
    this.#ctx.fillStyle = "#f6f6b2";
    // First curve
    this.#ctx.beginPath();
    this.#ctx.moveTo(co, this.#height);
    this.#ctx.bezierCurveTo(this.#width + co*3, -co,
      -co*3, -co, this.#width - co, this.#height);
    this.#ctx.fill();
    // Second curve
    this.#ctx.beginPath();
    this.#ctx.moveTo(co, 0);
    this.#ctx.bezierCurveTo(this.#width + co*3, this.#height + co,
      -co*3, this.#height + co, this.#width - co, 0);
    this.#ctx.fill();
  }

  #drawGrid() {
    this.#ctx.beginPath();
    // Drawing vertical lines
    const pixelOffset = 0.5;
    const y2 = this.#height + pixelOffset;
    for (let i = 0; i <= this.#cols; i++) {
      const x = i*this.#cellSize + pixelOffset;
      this.#ctx.moveTo(x, pixelOffset);
      this.#ctx.lineTo(x, y2);
    }
    // Drawing horizontal lines
    const x2 = this.#width + pixelOffset;
    for (let j = 0; j <= this.#rows; j++) {
      const y = j*this.#cellSize + pixelOffset;
      this.#ctx.moveTo(pixelOffset, y);
      this.#ctx.lineTo(x2, y);
    }
    // Stroking to show them on the screen
    this.#ctx.strokeStyle = "#CCC";
    this.#ctx.stroke();
  }

  drawToken(cellX, cellY) {
    const tokenType = this.#model.getPiece(cellX, cellY);
    // Cell is empty
    if (!tokenType)
      return;
    let colorCode = "black";
    switch(tokenType) {
      case BoardModel.RED:
        colorCode = "red";
        break;
      case BoardModel.GREEN:
        colorCode = "green";
        break;
    }
    // Center of the token
    const x = this.#x + (cellX + 0.5)*this.#cellSize;
    const y = this.#y + (cellY + 0.5)*this.#cellSize;
    this.#ctx.save();
    this.#ctx.translate(x, y);
    // Token radius
    const radius = this.#cellSize*0.4;
    // Center of the gradient
    const gradientX = this.#cellSize*0.1;
    const gradientY = -this.#cellSize*0.1;
    const gradient = this.#ctx.createRadialGradient(
      gradientX, gradientY, this.#cellSize*0.1, // inner circle (glare)
      gradientX, gradientY, radius*1.2); // outer circle
    gradient.addColorStop(0, "yellow"); // the color of the "light"
    gradient.addColorStop(1, colorCode); // the color of the token
    this.#ctx.fillStyle = gradient;
    this.#ctx.beginPath();
    this.#ctx.arc(0, 0, radius, 0, 2*Math.PI, true);
    this.#ctx.fill();
    this.#ctx.restore();
  }

  repaint() {
    this.#ctx.save();
    this.#ctx.translate(this.#x, this.#y);
    this.#drawBackground();
    this.#drawGrid();
    this.#ctx.restore();
    for (let i = 0; i < this.#cols; i++) {
      for (let j = 0; j < this.#rows; j++) {
        this.drawToken(i, j);
      }
    }
  }
}
