import GameObject from "../GameObject";
import Rect from "../Rect";

export default class IsometricTileLayer extends GameObject {
  #mapData;
  #tileset;
  #tileWidth;
  #tileHeight;
  #cellWidth;
  #cellHeight;
  #marginLeft;
  #marginTop;
  #spritesInOneRow;
  #offCanvas;
  #offContext;
  #offRect;
  #offDirty;

  constructor(mapData, tileset, tileWidth, tileHeight, cellWidth, cellHeight, marginLeft, marginTop) {
    super();
    this.#mapData = mapData;
    this.#tileset = tileset;
    this.#tileWidth = tileWidth;
    this.#tileHeight = tileHeight;
    this.#cellWidth = cellWidth || tileWidth;
    this.#cellHeight = cellHeight || tileHeight;
    this.#marginLeft = marginLeft;
    this.#marginTop = marginTop;
    this.#spritesInOneRow = Math.floor(tileset.width/tileWidth);
    this.#offCanvas = document.createElement("canvas");
    this.#offContext = this.#offCanvas.getContext("2d");
    this.#offRect = new Rect(0, 0, 0, 0);
    this.#offDirty = true;
    this.addListener("up", this.#onUpEvent.bind(this));
    this.#resetOffScreenCanvas();
  }

  #onUpEvent(e) {
    if (e.moved)
      return;

    const coords = this.#getTileCoordinates(e.x, e.y);
    if (coords.x >= 0 && coords.x < this.#mapData[0].length &&
        coords.y >= 0 && coords.y < this.#mapData.length) {
        this.emit("tileClicked", {x: coords.x, y: coords.y, layer: this, cause: e});
        e.stopped = true;
    }
  }

  draw(ctx, dirtyRect) {
    if (this.#offDirty) {
      this.#redrawOffscreen();
    }

    const offscreenImageWorldX = this.#offRect.x*this.#cellWidth;
    const offscreenImageWorldY = this.#offRect.y*this.#cellHeight/2;
    const bounds = this.getBounds();

    // If there is a dirty rectangle,
    // calculate the intersection of the offscreen
    // image and the dirty rectangle. Then draw only the part
    // of offscreen buffer
    // that is covered by the dirtyRect
    if (dirtyRect) {
      const sx = bounds.x - offscreenImageWorldX + dirtyRect.x;
      const sy = bounds.y - offscreenImageWorldY + dirtyRect.y;
      const sw = dirtyRect.width;
      const sh = dirtyRect.height;
      const dx = dirtyRect.x;
      const dy = dirtyRect.y;
      const dw = dirtyRect.width;
      const dh = dirtyRect.height;
      ctx.drawImage(this.#offCanvas, sx, sy, sw, sh, dx, dy, dw, dh);
    } else {
      // If there is no dirtyRect, redraw the whole viewport as we did before.
      ctx.drawImage(this.#offCanvas, offscreenImageWorldX - bounds.x, offscreenImageWorldY - bounds.y);
    }
  }

  #redrawOffscreen() {
    const ctx = this.#offContext;
    ctx.fillStyle = "darkgreen";
    ctx.fillRect(0, 0, this.#offCanvas.width, this.#offCanvas.height);
    this.#drawMapRegion(ctx, this.#offRect);
    this.#offDirty = false;
  }

  #drawMapRegion(ctx, rect) {
    const startCellX = Math.max(0, rect.x);
    const endCellX = Math.max(
      0,
      Math.min(rect.x + rect.width - 1, this.#mapData[0].length - 1)
    );
    const startCellY = Math.max(0, rect.y);
    const endCellY = Math.min(rect.y + rect.height - 1, this.#mapData.length - 1);
    
    for (let cellY = startCellY; cellY <= endCellY; cellY++) {
      for (let cellX = startCellX; cellX <= endCellX; cellX++) {
        const tileId = this.#mapData[cellY][cellX];
        const tileX = tileId % this.#spritesInOneRow;
        const tileY = Math.floor(tileId/this.#spritesInOneRow);

        const sx = tileX * this.#tileWidth;
        const sy = tileY * this.#tileHeight;
        const sw = this.#tileWidth;
        const sh = this.#tileHeight;

        const dx = (cellX - rect.x)*this.#cellWidth + (cellY%2)*this.#cellWidth/2 - this.#marginLeft;
        const dy = (cellY - rect.y)*this.#cellHeight/2 - this.#marginTop;
        const dw = this.#tileWidth;
        const dh = this.#tileHeight;

        ctx.drawImage(this.#tileset, sx, sy, sw, sh, dx, dy, dw, dh);
     }
    }
  }

  setSize(width, height) {
    super.setSize(width, height);
    this.#resetOffScreenCanvas();
  }

  setPosition(x, y) {
    super.setPosition(x, y);
    this.#updateOffscreenBounds();
  }

  #resetOffScreenCanvas() {
    this.#offRect = this.#getVisibleMapRect();
    this.#offCanvas.height = this.#offRect.height*this.#cellHeight;
    this.#offCanvas.width = this.#offRect.width*this.#cellWidth;
    this.#offDirty = true;
  }

  #updateOffscreenBounds() {
    const newRect = this.#getVisibleMapRect();
    if (!newRect.equals(this.#offRect)) {
        this.#offRect = newRect;
        this.#offDirty = true;
    }
  }

  #getVisibleMapRect() {
    const bounds = super.getBounds();
    const x = Math.floor((bounds.x - this.#cellWidth/2)/this.#cellWidth);
    const y = Math.floor(bounds.y/(this.#cellHeight/2)) - 1;

    const width = Math.ceil(bounds.width/this.#cellWidth) + 2;
    const height = Math.ceil((bounds.height)/(this.#cellHeight/2)) + 2;

    return new Rect(x, y, width, height);
  }

  setTileAt(x, y, tileId) {
    this.#mapData[y][x] = tileId;
    if (this.#offRect.containsPoint(x, y)) {
      const bounds = super.getBounds();
      const dirtyX = x*this.#cellWidth +
          (y%2 ? this.#cellWidth/2 : 0) - this.#marginLeft - bounds.x;
      const dirtyY = y*this.#cellHeight/2 - this.#marginTop - bounds.y;
      const dirtyWidth = this.#tileWidth;
      const dirtyHeight = this.#tileHeight;
      this.markDirty(dirtyX, dirtyY, dirtyWidth, dirtyHeight);
      this.#offDirty = true;
    }
  }

  getTileAt(x, y) {
    return this.#mapData[y][x];
  }

  /**
   * Translate from screen coordinates to map coordinates
   * @param {*} x 
   * @param {*} y 
   * @returns 
   */
  #getTileCoordinates(x, y) {
    const bounds = super.getBounds();
    x += bounds.x;
    y += bounds.y;

    const w = this.#cellWidth;
    const h = this.#cellHeight;

    const x1 = Math.floor((x + 2*y - w/2)/w);
    const y1 = Math.floor((y - x/2 + h/2)/h );

    return {
        x: Math.floor((x1 - y1)/2),
        y: x1 + y1
    };
  }

}
