import Game from './Game';
import levelMap from './Level';

let game = null;
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
  game = new Game(canvas, levelMap);
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
  game && game.resize();
}


const canvas = setup();
