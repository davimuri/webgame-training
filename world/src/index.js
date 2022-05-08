import Game from './Game'
import ImageManager from './image/ImageManager';
import InputHandler from './input/InputHandler';
import MapRenderer from './MapRenderer';
import SpriteSheet from './image/SpriteSheet';
import WorldObject from './WorldObject';
import WorldObjectRenderer from './WorldObjectRenderer';
import world from './world';
import Tiles from './images/tiles.png';
import Objects from './images/objects.png';

let game = null;
const imageManager = new ImageManager();
let fpsDiv = null;

function setup() {
  console.log('setup::start');
  const body = document.getElementById('body');
  const canvas = document.createElement('canvas');
  fpsDiv = document.createElement('div');
  fpsDiv.style.cssText = 'position:absolute;top:0;left:0';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  body.appendChild(canvas);
  body.appendChild(fpsDiv);
  initFullScreenCanvas(canvas);
  game = new Game(canvas);
  const inputHandler = new InputHandler(canvas);
  inputHandler.addListener("down", (e) => game.handleDown(e));
  inputHandler.addListener("move", (e) => game.handleMove(e));
  inputHandler.addListener("up", (e) => game.handleUp(e));
  imageManager.load(
    {"tiles": Tiles, "objects": Objects},
    onLoaded
  )
  return canvas;
}

/**
 * Resizes the canvas element once the window is resized.
 */
function initFullScreenCanvas(canvas) {
  resizeCanvas(canvas);
  window.addEventListener("resize", () => resizeCanvas(canvas));
}

/**
 * Does the actual resize
 */
function resizeCanvas(canvas) {
  canvas.width = document.width || document.body.clientWidth;
  canvas.height = document.height || document.body.clientHeight; 
  game && game.handleResize();
}

/** Once all images are loaded - starts the animation loop */
function onLoaded() {
  game.mapRenderer = new MapRenderer(
    world, imageManager.get("tiles"), 40, canvas.width, canvas.height
  );
  // The coordinates of the frames
  const frames = [
    [0, 0, 110, 96, 55, 96],
    [110, 0, 68, 108, 34, 108],
    [178, 0, 71, 79, 35, 79],
    [250, 0, 29, 56, 15, 56],
    [256, 60, 40, 31, 20, 31]
  ]
  const spriteSheet = new SpriteSheet(imageManager.get("objects"), frames);
  game.worldObjectRenderer = new WorldObjectRenderer(getObjects(spriteSheet), canvas.width, canvas.height);
  animate(0);
}

function getObjects(spriteSheet) {
  return  [
      getTree(spriteSheet, 200, 200),
      getTree(spriteSheet, 280, 220),
      getRock(spriteSheet, 300, 270),
      getRock(spriteSheet, 150, 197)
  ];
}
function getTree(spriteSheet, x, y) {
  const obj = new WorldObject(spriteSheet, 1);
  obj.setPosition(x, y);
  return obj;
}
function getRock(spriteSheet, x, y) {
  const obj = new WorldObject(spriteSheet, 3);
  obj.setPosition(x, y);
  return obj;
}

const canvas = setup();
let lastUpdate = new Date().getTime();

function animate(t) {
  //const now = t || new Date().getTime();
  const now = new Date().getTime();
  let deltaTime = now - lastUpdate;
  lastUpdate = now;
  const fps = Math.round(1000 / deltaTime);
  fpsDiv.innerHTML = `FPS: ${fps}`;
  //console.log(`FPS: ${fps}`);
  game.update(deltaTime);
  requestAnimationFrame(animate);
}
