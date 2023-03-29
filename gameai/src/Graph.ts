// Based on https://github.com/Juriy/gameai/blob/master/js/Graph.js

interface Connection {
  node: Node;
  weight: number;
}

class Node {
  id: number;
  x: number;
  y: number;
  private connections: Connection[];

  constructor(id: number, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.connections = [];
  }

  addConnection(node: Node, weight: number) {
    this.connections.push({
      node: node,
      weight: weight
    });
  }

  getConnections(): Connection[] {
    return this.connections;
  }
}

class Graph {
  private nodes: Node[];
  private drawConnectionLabels = true;
  private drawConnections = true;


  constructor(nodes: Node[], matrix: number[][]) {
    this.nodes = nodes;
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j]) {
          nodes[i].addConnection(nodes[j], Graph.distance(nodes[i], nodes[j]));
        }
      }
    }
  }

  static distance(node1: Node, node2: Node): number {
    return Math.sqrt(
      (node1.x - node2.x)*(node1.x - node2.x) +
      (node1.y - node2.y)*(node1.y - node2.y));
  }

  /**
   * Simple visualization - draws as the undirected graph
   */
  draw(ctx: CanvasRenderingContext2D, path?: Node[]) {
    const self = this;
    ctx.strokeStyle = "black";
    ctx.fillStyle = "white";

    // Draw connections
    if (this.drawConnections) {
      this.nodes.forEach((node)  => {
          node.getConnections().forEach((connection) => {
              self.drawConnection(ctx, node, connection.node, connection.weight, "black");
          });
      });
    }

    // Highlight the path
    if (path) {
      this.drawPath(ctx, path);
    }

    if (this.drawConnectionLabels) {
      // Draw connection labels
      this.nodes.forEach((node) => {
          node.getConnections().forEach((connection) => {
              self.drawConnectionLabel(ctx, Math.floor(connection.weight) + "", node, connection.node);
          });
      });
    }

    // Next draw nodes
    this.nodes.forEach((node) => {
      self.drawNode(ctx, node);
    });
  }

  private drawConnection(ctx: CanvasRenderingContext2D, node1: Node, node2: Node, weight: number, color: string) {
    ctx.strokeStyle = color ? color : "black";
    ctx.beginPath();
    ctx.moveTo(node1.x, node1.y);
    ctx.lineTo(node2.x, node2.y);
    ctx.stroke();

    ctx.font = "15px Arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
  }

  private drawPath(ctx: CanvasRenderingContext2D, path: Node[]) {
    ctx.save();
    ctx.lineWidth = 4;
    for (let i = 1; i < path.length; i++) {
        this.drawConnection(ctx, path[i], path[i - 1], 0, "green");
    }
    ctx.restore();
  }

  private drawConnectionLabel(ctx: CanvasRenderingContext2D, text: string, node1: Node, node2: Node) {
    const padding = 5;
    const middleX = Math.floor((node1.x + node2.x)/2);
    const middleY = Math.floor((node1.y + node2.y)/2);
    const width = ctx.measureText(text).width + padding*2;
    const height = 20;

    ctx.fillStyle = "#DDD";
    ctx.fillRect(middleX - width/2, middleY - height/2, width, height);

    ctx.fillStyle = "black";
    ctx.fillText(text, middleX, middleY);
  }

  private drawNode(ctx: CanvasRenderingContext2D, node: Node) {
    ctx.fillStyle = "#6ba4d9";
    ctx.strokeStyle = "black";
    ctx.font = "18px Arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    ctx.beginPath();
    ctx.arc(node.x, node.y, 12, 0, 2*Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "black";
    ctx.fillText("" + node.id, node.x, node.y);
  }

  getNode(index: number): Node {
    return this.nodes[index];
  }
}

export {
  Graph,
  Node
};