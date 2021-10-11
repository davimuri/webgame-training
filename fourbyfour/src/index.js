import Game from './Game'

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
				const touch = e.targetTouches[0];
				game.handleClick(touch.pageX, touch.pageY);
				e.stopPropagation();
				e.preventDefault();
		}, false);
	} else {
			canvas.addEventListener("mouseup", (e) => {
					game.handleClick(e.pageX, e.pageY);
					e.stopPropagation();
					e.preventDefault();
			}, false);
	}
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

function isTouchDevice() {
	return ('ontouchstart' in document.documentElement);
}

setup();
