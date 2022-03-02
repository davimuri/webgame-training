import Game from './Game'
import ImageManager from './ImageManager';
import AxeImg from './images/axe.png';
import InputHandler from './input/InputHandler';

let game = null;

const setup = () => {
  console.log('setup::start');
  const body = document.getElementById('body');
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  body.appendChild(canvas);
  initFullScreenCanvas(canvas)
  game = new Game(canvas);
  const inputHandler = new InputHandler(canvas);
  inputHandler.addListener("down", (e) => game.handleDown(e));
  inputHandler.addListener("move", (e) => game.handleMove(e));
  inputHandler.addListener("up", (e) => game.handleUp(e));

  // const ctx = canvas.getContext("2d");
  // loadImageTest(ctx);
  return canvas;
};

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

const canvas = setup();
// const ctx = canvas.getContext("2d");

function loadImageTest(ctx) {
  const imageManager = new ImageManager();
  const onLoaded = () => {
    console.log("All images are loaded");
    ctx.drawImage(imageManager.get("axe"), 0, 0, 77, 132, 10, 10, 77, 132);
    ctx.drawImage(imageManager.get("axe"), 0, 0, 77, 132, 80.5, 10.5, 77, 132);
  };
  imageManager.load({
    "axe": AxeImg
  }, onLoaded);
}

let lastUpdate = new Date().getTime();

function animate(t) {
  //const now = t || new Date().getTime();
  const now = new Date().getTime();
  let deltaTime = now - lastUpdate;
  lastUpdate = now;
  game.update(deltaTime);
  requestAnimationFrame(animate);
}

animate(0);
