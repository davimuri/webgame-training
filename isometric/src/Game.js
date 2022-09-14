import InputHandler from './input/InputHandler';
import ImageManager from './image/ImageManager';
import IsometricTileLayer from './map/IsometricTileLayer';
import Terrain from './images/terrain.png';
import ArchLeft from './images/arch-left.png';
import ArchRight from './images/arch-right.png';
import DirtyRectangleManager from './map/DirtyRectangleManager';
import House1 from './images/house-1.png';
import House2 from './images/house-2.png';
import LayerManager from './map/LayerManager';
import Ball from './images/ball.png';
import UI from './images/ui.png';
import ObjectLayer from './map/ObjectLayer';
import RoundStateButton from './map/RoundStateButton';
import StaticImage from './map/StaticImage';
import UiLayer from './map/UiLayer';

export default class Game {
  #canvas;
  #ctx;
  #boundAnimate;
  #imageManager;
  #map;
  #tileLayer;
  #objectLayer;
  #ui;
  #ball1;
  #ball2;
  #archBall;
  #archBallDirection;
  #dirtyRectangleManager;
  #layerManager;

  constructor(canvas, map) {
    this.#canvas = canvas;
    this.#map = map;
    this.#tileLayer = null;
    this.#ctx = canvas.getContext("2d");
    this.#boundAnimate = this.#animate.bind(this);
    this.#dirtyRectangleManager = new DirtyRectangleManager();
    this.#imageManager = new ImageManager();
    this.#imageManager.load(
      {
        "terrain": Terrain,
        "arch-left": ArchLeft,
        "arch-right": ArchRight,
        "house-1": House1,
        "house-2": House2,
        "ball": Ball,
        "ui": UI
      }, 
      this.#onImagesLoaded.bind(this)
    );
    this.#archBallDirection = 1;
    this.#layerManager = new LayerManager();
    this.#layerManager.setDirtyRectManager(this.#dirtyRectangleManager);
  }

  /** Called once all images are loaded */ 
  #onImagesLoaded() {
    this.#initLayers();
    this.resize();
    const inputHandler = new InputHandler(this.#canvas);
    inputHandler.addListener("move", this.#onMove.bind(this));
    inputHandler.addListener("up", this.#onUp.bind(this));
    this.#clearBg();
    this.#animate();
  }

  /** Called each frame, updates objects and re-renders the frame if required */
  #animate() {
    requestAnimationFrame(this.#boundAnimate);
    this.#updateWorld();
    this.#renderFrame();
  }

  #initLayers() {
    this.#ui = new RoundStateButton(this.#imageManager.get("ui"), 100, 100);

    this.#tileLayer = new IsometricTileLayer(this.#map, this.#imageManager.get("terrain"), 128, 68, 124, 62, 0, 3);
    this.#tileLayer.setDirtyRectManager(this.#dirtyRectangleManager);
    // Dummy balls that we will soon use to test movement
    this.#ball1 = new StaticImage(this.#imageManager.get("ball"), 370, 30);
    this.#ball2 = new StaticImage(this.#imageManager.get("ball"), 370, 50);
    this.#objectLayer = new ObjectLayer([this.#ball1, this.#ball2], 200, 4000, 4000);
    this.#objectLayer.setDirtyRectManager(this.#dirtyRectangleManager);
    // Big huts
    this.#objectLayer.addObject(new StaticImage(this.#imageManager.get("house-1"), 350, 130));
    this.#objectLayer.addObject(new StaticImage(this.#imageManager.get("house-1"), 200, 50));
    this.#objectLayer.addObject(new StaticImage(this.#imageManager.get("house-1"), 150, 200));
    // Small huts
    this.#objectLayer.addObject(new StaticImage(this.#imageManager.get("house-2"), 450, 280));
    this.#objectLayer.addObject(new StaticImage(this.#imageManager.get("house-2"), 630, 370));

    this.#archBall = new StaticImage(this.#imageManager.get("ball"), 300, 600);
    this.#objectLayer.addObject(this.#archBall);
    this.#objectLayer.addObject(new StaticImage(this.#imageManager.get("arch-left"), 120, 470));
    this.#objectLayer.addObject(new StaticImage(this.#imageManager.get("arch-right"), 234, 462));

    this.#tileLayer.addListener("tileClicked", this.#onTileClicked.bind(this));
    this.#objectLayer.addListener("objectClicked", this.#onObjectClicked.bind(this));

    this.#layerManager.addLayer(this.#tileLayer);
    this.#layerManager.addLayer(this.#objectLayer);
    this.#layerManager.addLayer(new UiLayer([this.#ui]));
  }

  #updateWorld(deltaTime) {
    // Move ball down
    this.#ball1.move(0, 2);
    // Move ball right
    this.#ball2.move(2, 0);

    // Diagonal move through the arch
    this.#archBall.move(2*this.#archBallDirection, this.#archBallDirection);
    if (this.#archBall.getBounds().x > 300 || this.#archBall.getBounds().x < 100) {
      this.#archBallDirection *= -1;
    }
  }

  /** Render frame on context */
  #renderFrame() {
    this.#ctx.save();
    if (!this.#dirtyRectangleManager.isAllClean()) {
      const rect = this.#dirtyRectangleManager.getDirtyRect();
      this.#ctx.beginPath();
      this.#ctx.rect(rect.x, rect.y, rect.width, rect.height);
      this.#ctx.clip();
      this.#layerManager.draw(this.#ctx, rect);
    }
    this.#dirtyRectangleManager.clear();
    this.#ctx.restore();
  }

  /** Move the viewport withing the world */
  move(deltaX, deltaY) {
    this.#dirtyRectangleManager.markAllDirty();
    this.#layerManager.move(deltaX, deltaY);
  }

  #onMove(event) {
    this.move(event.deltaX, event.deltaY);
  }

  #onUp(event) {
    console.log("Game.onUp");
    this.#layerManager.emit("up", event);
  }

  #onTileClicked(e) {
    if (this.#ui.getState() == RoundStateButton.TERRAIN) {
      this.#tileLayer.setTileAt(e.x, e.y, (this.#tileLayer.getTileAt(e.x, e.y) + 1)%9);
    } else if (this.#ui.getState() == RoundStateButton.OBJECTS) {
      this.#addDummyObjectAt(e.cause.x, e.cause.y);
    }
  }

  #onObjectClicked(e) {
    if (this.#ui.getState() == RoundStateButton.OBJECTS) {
      this.#objectLayer.removeObject(e.object);
      e.cause.stopped = true;
    }
  }

  #addDummyObjectAt(x, y) {
    const layerPosition = this.#objectLayer.getBounds();
    const obj = new StaticImage(this.#imageManager.get("ball"), x + layerPosition.x, y + layerPosition.y);
    const bounds = obj.getBounds();
    obj.move(-bounds.width/2, -bounds.height/2);
    this.#objectLayer.addObject(obj);
  }

  resize() {
    this.#dirtyRectangleManager.setViewport(this.#canvas.width, this.#canvas.height);
    this.#layerManager.setSize(this.#canvas.width, this.#canvas.height);
  }

  #clearBg() {
    this.#ctx.fillStyle = "black";
    this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
  }

}