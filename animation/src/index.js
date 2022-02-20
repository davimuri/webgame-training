import Game from './Game'
import Animator from './Animator';
import Ball from './Ball';
import ImageManager from './ImageManager';
import AxeImg from './images/axe.png';
import { isTouchDevice } from './util';

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
  if (isTouchDevice()) {
    canvas.addEventListener("touchstart", (e) => {
      e.targetTouches.foreach(t => {
        const coords = getInputCoordinates(e.targetTouches[i], canvas);
        game.handleClick(coords.x, coords.y);
      });
      e.stopPropagation();
      e.preventDefault();
    }, false);
  } else {
      canvas.addEventListener("mouseup", (e) => {
        var coords = getInputCoordinates(e, canvas);
        game.handleClick(coords.x, coords.y);
        e.stopPropagation();
        e.preventDefault();
      }, false);
  }

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

// support compatibility with firefox events that use clientX and clientY
// and consider the case when web page has scrolls
function getInputCoordinates(e, element) {
  return {
    x: (e.pageX || e.clientX + document.body.scrollLeft) - element.offsetLeft,
    y: (e.pageY || e.clientY + document.body.scrollTop) - element.offsetTop
  } 
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

// const ball = new Ball();
// ball.startAnimation();
let lastUpdate = new Date().getTime();
// const startX = 20;
// const endX = canvas.width - 20;

function animate(t) {
  //const now = t || new Date().getTime();
  const now = new Date().getTime();
  let deltaTime = now - lastUpdate;
  lastUpdate = now;
  // ball.update(deltaTime);
  game.update(deltaTime);
  // clean(canvas, ctx);
  // ball.draw(ctx);
  requestAnimationFrame(animate);
}

function clean(canvas, ctx) {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawBounds(startX, endX, ctx);
}

function drawBounds(startX, endX, ctx) {
  ctx.strokeStyle = "lightblue";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(startX, 0);
  ctx.lineTo(startX, 100);
  ctx.moveTo(endX, 0);
  ctx.lineTo(endX, 100);
  ctx.closePath();
  ctx.stroke();
}

animate(0);
