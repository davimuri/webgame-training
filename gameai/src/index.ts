import Game from './Game';

let game: Game;

function setup() {
  const body = document.getElementById('body');
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  body.appendChild(canvas);
  game = new Game(canvas);
  initFullScreenCanvas(canvas);
  return canvas;
}

/**
 * Resizes the canvas element once the window is resized.
 */
function initFullScreenCanvas(canvas: HTMLCanvasElement) {
  resizeCanvas(canvas);
  window.addEventListener("resize", () => resizeCanvas(canvas));
}

/**
 * Does the actual resize
 */
function resizeCanvas(canvas: HTMLCanvasElement) {
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight; 
  game && game.handleResize();
}


const canvas = setup();
