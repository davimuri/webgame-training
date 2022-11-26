import CubeColor from './CubeColor';
import CubeTexture from './CubeTexture';
import ImageManager from './ImageManager';
import Texture from './images/texture.png';

export default class Game {
  #canvas;
  #gl;
  #imageManager;
  #cubeColor;
  #cubeTexture;

  constructor(canvas) {
    this.#canvas = canvas;
    this.#imageManager = new ImageManager();
    this.#imageManager.load(
      {
        "texture": Texture
      }, 
      this.#initWebGL.bind(this)
    );
  }

  #initWebGL() {
    this.#gl = this.#canvas.getContext("webgl") || this.#canvas.getContext("experimental-webgl");
    this.#gl.clearColor(1.0, 1.0, 1.0, 1.0);
    this.#gl.enable(this.#gl.DEPTH_TEST);

    // comment/uncomment to draw the color cube or the texture cube
    // this.#cubeColor = new CubeColor(this.#canvas, this.#gl);
    this.#cubeTexture = new CubeTexture(this.#canvas, this.#gl, this.#imageManager.get("texture"));
    this.resize();
  }

  resize() {
    this.#clearCanvas();
    // comment/uncomment to draw the color cube or the texture cube
    // this.#cubeColor.drawScene();
    this.#cubeTexture.drawScene();
  }

  handleClick(x, y) {
  }

  #clearCanvas() {
    this.#gl.viewport(0, 0, this.#canvas.width, this.#canvas.height);
    this.#gl.clear(this.#gl.COLOR_BUFFER_BIT | this.#gl.DEPTH_BUFFER_BIT);
  }

}