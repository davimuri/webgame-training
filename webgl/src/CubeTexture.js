import { mat4 } from 'gl-matrix';
import CUBE_GEOMETRY from './CubeGeometry';

export default class CubeTexture {
  static TEXTURE_COORDS = [
    // Front face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Back face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Top face
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,

    // Bottom face
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,

    // Right face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Left face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0
  ]

  static #VERTEX_SHADER_CODE =
  "attribute vec3 aPos;" +
  "attribute vec2 aTex;" +
  "uniform mat4 uMVMatrix;" +
  "uniform mat4 uPMatrix;" +
  "varying vec2 vTex;" +
  "void main(void) {" +
  "gl_Position = uPMatrix * uMVMatrix * vec4(aPos, 1.0);" +
  "vTex = aTex;" +
  "}";

  static #FRAGMENT_SHADER_CODE =
  "precision mediump float;" +
  "varying vec2 vTex;" +
  "uniform sampler2D uSampler;" +
  "void main(void) {" +
  "gl_FragColor = texture2D(uSampler, vTex);" +
  "}";

  #canvas;
  #gl;
  #textureImage;
  #model;
  #vertexPositionAttribute;
  #textureCoordinateAttribute;
  #pMatrixUniform;
  #mvMatrixUniform;
  #samplerUniform;
  #modelViewMatrix;
  #projectionMatrix;

  constructor(canvas, gl, textureImage) {
    this.#canvas = canvas;
    this.#gl = gl;
    this.#textureImage = textureImage;
    this.#modelViewMatrix = mat4.create();
		this.#projectionMatrix = mat4.create();
    this.init();
  }

  init() {
    this.initShaders();
    this.initModel();
  }

  initShaders() {
    const fragmentShader = this.#createShader(this.#gl.FRAGMENT_SHADER, CubeTexture.#FRAGMENT_SHADER_CODE);
    const vertexShader = this.#createShader(this.#gl.VERTEX_SHADER, CubeTexture.#VERTEX_SHADER_CODE);

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

    this.#textureCoordinateAttribute = this.#gl.getAttribLocation(shaderProgram, "aTex");
		this.#gl.enableVertexAttribArray(this.#textureCoordinateAttribute);

    this.#pMatrixUniform = this.#gl.getUniformLocation(shaderProgram, "uPMatrix");
    this.#mvMatrixUniform = this.#gl.getUniformLocation(shaderProgram, "uMVMatrix");
    this.#samplerUniform = this.#gl.getUniformLocation(shaderProgram, "uSampler");
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
      texture: null,
      textureCoordsBuffer: null,

      x: 0,
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

    this.#model.texture = this.#gl.createTexture();
    this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.#model.texture);
    this.#gl.pixelStorei(this.#gl.UNPACK_FLIP_Y_WEBGL, true);
    this.#gl.texImage2D(this.#gl.TEXTURE_2D, 0, this.#gl.RGBA, this.#gl.RGBA, this.#gl.UNSIGNED_BYTE,
      this.#textureImage);
    this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_MAG_FILTER, this.#gl.LINEAR);
    this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_MIN_FILTER, this.#gl.LINEAR);

    // Initialize one more buffer for texture coordinates
    this.#model.textureCoordsBuffer = this.#gl.createBuffer();
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#model.textureCoordsBuffer);
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(CubeTexture.TEXTURE_COORDS),
      this.#gl.STATIC_DRAW);
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

    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#model.textureCoordsBuffer);
		this.#gl.vertexAttribPointer(this.#textureCoordinateAttribute, 2, this.#gl.FLOAT, false, 0, 0);

    this.#gl.activeTexture(this.#gl.TEXTURE0);
		this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.#model.texture);
		this.#gl.uniform1i(this.#samplerUniform, 0);

    this.#gl.bindBuffer(this.#gl.ELEMENT_ARRAY_BUFFER, this.#model.faceBuffer);
    this.#gl.drawElements(this.#gl.TRIANGLES, CUBE_GEOMETRY.faces.length, this.#gl.UNSIGNED_SHORT, 0);
  }

}