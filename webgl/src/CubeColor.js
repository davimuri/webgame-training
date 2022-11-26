import { mat4 } from 'gl-matrix';
import CUBE_GEOMETRY from './CubeGeometry';

export default class CubeColor {
  static #VERTEX_SHADER_CODE =
  "attribute vec3 aPos;" +
  "attribute vec4 aCol;" +
  "uniform mat4 uMVMatrix;" +
  "uniform mat4 uPMatrix;" +
  "varying vec4 vColor;" +
  "void main(void) {" +
  "gl_Position = uPMatrix * uMVMatrix * vec4(aPos, 1.0);" +
  "vColor = aCol;" +
  "}";

  static #FRAGMENT_SHADER_CODE =
  "precision mediump float;" +
  "varying vec4 vColor;" +
  "void main(void) {" +
  "gl_FragColor = vColor;" +
  "}";

  #canvas;
  #gl;
  #model;
  #vertexPositionAttribute;
  #vertexColorAttribute;
  #pMatrixUniform;
  #mvMatrixUniform;
  #modelViewMatrix;
  #projectionMatrix;

  constructor(canvas, gl) {
    this.#canvas = canvas;
    this.#gl = gl;
    this.#modelViewMatrix = mat4.create();
		this.#projectionMatrix = mat4.create();
    this.init();
  }

  init() {
    this.initShaders();
    this.initModel();
  }

  initShaders() {
    const fragmentShader = this.#createShader(this.#gl.FRAGMENT_SHADER, CubeColor.#FRAGMENT_SHADER_CODE);
    const vertexShader = this.#createShader(this.#gl.VERTEX_SHADER, CubeColor.#VERTEX_SHADER_CODE);

    const shaderProgram = this.#gl.createProgram();
    this.#gl.attachShader(shaderProgram, vertexShader);
    this.#gl.attachShader(shaderProgram, fragmentShader);
    this.#gl.linkProgram(shaderProgram);

    if (!this.#gl.getProgramParameter(shaderProgram, this.#gl.LINK_STATUS)) {
      alert("Error initializing shaders");
    }

    this.#gl.useProgram(shaderProgram);

    this.#vertexPositionAttribute = this.#gl.getAttribLocation(shaderProgram, "aPos");
    this.#gl.enableVertexAttribArray(this.#vertexPositionAttribute);

    this.#vertexColorAttribute = this.#gl.getAttribLocation(shaderProgram, "aCol");
    this.#gl.enableVertexAttribArray(this.#vertexColorAttribute);

    this.#pMatrixUniform = this.#gl.getUniformLocation(shaderProgram, "uPMatrix");
    this.#mvMatrixUniform = this.#gl.getUniformLocation(shaderProgram, "uMVMatrix");
  }

  #createShader(shaderType, source) {
    const shader = this.#gl.createShader(shaderType);
    this.#gl.shaderSource(shader, source);
    this.#gl.compileShader(shader);
    if (!this.#gl.getShaderParameter(shader, this.#gl.COMPILE_STATUS)) {
      alert(this.#gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }

  initModel() {
    this.#model = {
      vertexBuffer: null,
      faceBuffer: null,
      colorBuffer: null,
    
      x: -5,
      y: 0,
      z: -10,
    
      rx: 0.4,
      ry: 1.2,
      rz: 0    
    }

    this.#model.vertexBuffer = this.#gl.createBuffer();
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#model.vertexBuffer);
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER,
      new Float32Array(CUBE_GEOMETRY.vertices), this.#gl.STATIC_DRAW);

    this.#model.faceBuffer = this.#gl.createBuffer();
    this.#gl.bindBuffer(this.#gl.ELEMENT_ARRAY_BUFFER, this.#model.faceBuffer);
    this.#gl.bufferData(this.#gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(CUBE_GEOMETRY.faces), this.#gl.STATIC_DRAW);

    this.#model.colorBuffer = this.#gl.createBuffer();
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#model.colorBuffer);
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER,
      new Float32Array(CUBE_GEOMETRY.colors), this.#gl.STATIC_DRAW);
  }

  drawScene() {
    mat4.perspective(this.#projectionMatrix, 45, this.#canvas.width / this.#canvas.height, 0.1, 100.0);
    mat4.identity(this.#modelViewMatrix);
    this.#drawModel();
  }

  #drawModel() {
    mat4.translate(this.#modelViewMatrix, this.#modelViewMatrix, [this.#model.x, this.#model.y, this.#model.z]);

    if (this.#model.rx)
      mat4.rotateX(this.#modelViewMatrix, this.#modelViewMatrix, this.#model.rx);

    if (this.#model.ry)
      mat4.rotateY(this.#modelViewMatrix, this.#modelViewMatrix, this.#model.ry);

    if (this.#model.rz)
      mat4.rotateZ(this.#modelViewMatrix, this.#modelViewMatrix, this.#model.rz);

    this.#gl.uniformMatrix4fv(this.#pMatrixUniform, false, this.#projectionMatrix);
    this.#gl.uniformMatrix4fv(this.#mvMatrixUniform, false, this.#modelViewMatrix);

    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#model.vertexBuffer);
    this.#gl.vertexAttribPointer(this.#vertexPositionAttribute, 3, this.#gl.FLOAT, false, 0, 0);

    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#model.colorBuffer);
    this.#gl.vertexAttribPointer(this.#vertexColorAttribute, 4, this.#gl.FLOAT, false, 0, 0);

    this.#gl.bindBuffer(this.#gl.ELEMENT_ARRAY_BUFFER, this.#model.faceBuffer);
    this.#gl.drawElements(this.#gl.TRIANGLES, CUBE_GEOMETRY.faces.length, this.#gl.UNSIGNED_SHORT, 0);
  }

}