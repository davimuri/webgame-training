export default class MapRenderer {
  #mapData;
  #image;
  #tileSize;
  #x;
  #y;
  #tilesPerRow;
  #viewportWidth;
  #viewportHeight;
  #offCanvas;
  #offContext;
  #offDirty;
  #offBounds;

  constructor(mapData, image, tileSize, viewportWidth, viewportHeight) {
    this.#mapData = mapData;
    this.#image = image;
    this.#tileSize = tileSize;
    this.#x = 0;
    this.#y = 0;
    this.#tilesPerRow = image.width/tileSize;
    // offscreen canvas
    this.#offCanvas = document.createElement("canvas");
    // context of the offscreen canvas
    this.#offContext = this.#offCanvas.getContext("2d");
    // flag that indicates, that a user has moved the viewport
    // and the offscreen canvas must be repainted
    this.#offDirty = true;
    this.#offBounds = {x: 0, y:0, w: 0, h: 0};
    this.setViewportSize(viewportWidth, viewportHeight);
  }

  setViewportSize(viewportWidth, viewportHeight) {
    this.#viewportWidth = viewportWidth;
    this.#viewportHeight = viewportHeight;
    this.#resetOffScreenCanvas();
  }

  #resetOffScreenCanvas() {
    this.#updateOffscreenBounds();
    this.#offCanvas.width = this.#offBounds.w * this.#tileSize;
    this.#offCanvas.height = this.#offBounds.h * this.#tileSize;
    this.#offDirty = true;
  }

  move(deltaX, deltaY) {
    this.#x += deltaX;
    this.#y += deltaY;
    this.#updateOffscreenBounds();
  }

  #updateOffscreenBounds() {
    const newBounds = {
      x: Math.floor(-this.#x / this.#tileSize),
      y: Math.floor(-this.#y / this.#tileSize),
      w: Math.ceil(this.#viewportWidth/this.#tileSize) + 1,
      h: Math.ceil(this.#viewportHeight/this.#tileSize) + 1
    };
    const oldBounds = this.#offBounds;
    if (!(oldBounds.x == newBounds.x
          && oldBounds.y == newBounds.y
          && oldBounds.w == newBounds.w
          && oldBounds.h == newBounds.h)) {
        this.#offBounds = newBounds;
        this.#offDirty = true;
    }
  }

  draw(ctx) {
    if (this.#offDirty) {
      this.#redrawOffscreen();
      this.#offDirty = false;
    }
    const offCanvasX = -Math.floor(this.#x) - this.#offBounds.x*this.#tileSize;
    const offCanvasY = -Math.floor(this.#y) - this.#offBounds.y*this.#tileSize;
    const offCanvasW = Math.min(this.#offCanvas.width - offCanvasX, this.#viewportWidth);
    const offCanvasH = Math.min(this.#offCanvas.height - offCanvasY, this.#viewportHeight);
    ctx.drawImage(this.#offCanvas, offCanvasX, offCanvasY, offCanvasW, offCanvasH,
      0, 0, offCanvasW, offCanvasH);
  }

  #redrawOffscreen() {
    const ctx = this.#offContext;
    ctx.clearRect(0, 0, this.#viewportWidth, this.#viewportHeight);
    // Instead of drawing every tile of the map, check which ones 
    // are actually visible
    // x coordinate of the leftmost visible tile
    const startX = Math.max(this.#offBounds.x, 0);
    // x coordinate of the rightmost visible tile
    const endX = Math.min(
      startX + this.#offBounds.w - 1,
      this.#mapData[0].length - 1
    );
    // y coordinate of the topmost visible tile
    const startY = Math.max(this.#offBounds.y, 0);
    // y coordinate of the bottommost visible tile
    const endY = Math.min(
      startY + this.#offBounds.h - 1,
      this.#mapData.length - 1
    );

    for (let cellY = startY; cellY <= endY; cellY++) {
      for (let cellX = startX; cellX <= endX; cellX++) {
        const tileId = this.#mapData[cellY][cellX];
        this.#drawTileAt(ctx, tileId, cellX, cellY);
      }
    }
  }

  #drawTileAt(ctx, tileId, cellX, cellY) {
    // Position of the tile inside of a tile sheet
    const srcX = (tileId % this.#tilesPerRow) * this.#tileSize;
    const srcY = Math.floor(tileId/this.#tilesPerRow) * this.#tileSize;
    // position of the tile on the offscreen buffer
    const destX = cellX*this.#tileSize - this.#offBounds.x*this.#tileSize;
    const destY = cellY*this.#tileSize - this.#offBounds.y*this.#tileSize;
    ctx.drawImage(
      this.#image, srcX, srcY, this.#tileSize, this.#tileSize,
      destX, destY, this.#tileSize, this.#tileSize
    );
  }

}