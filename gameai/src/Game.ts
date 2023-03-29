import { Graph, Node } from './Graph';
import Astar from './Astar';

export default class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private graph: Graph;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.graph = this.#createGraph();
  }

  #createGraph(): Graph {
    const coords = [[248,76],[205,329],[592,230],[420,410],
      [95,410],[479,230],[420,16],[555,16]];
    const matrix =[
      [1, 1, 0, 0, 0, 0, 0, 0],
      [1, 1, 0, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 0, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 0, 1, 1, 0],
      [0, 0, 0, 1, 0, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 1, 1]
    ];
    const nodes = [];
    for (let i = 0; i < coords.length; i++) {
      nodes.push(new Node(i, coords[i][0], coords[i][1]));
    }
    return new Graph(nodes, matrix);
  }

  handleResize() {
    this.clearCanvas();
    const path = new Astar().findPath(this.graph.getNode(0), this.graph.getNode(7));
    this.graph.draw(this.ctx, path);
  }

  private clearCanvas() {
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

}