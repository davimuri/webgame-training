import { Graph, Node } from './Graph';
import Heap from './Heap';

interface PathNode {
  node: Node;
  prevNode?: PathNode;
  routeCost: number;
  estimatedCost: number;
}

export default class Astar {

  findPath(startNode: Node, endNode: Node) : Node[] {
    let openList = new Heap<PathNode>((a, b) => a.estimatedCost - b.estimatedCost);
    let closedList = new Map<number, PathNode>();

    const startPathNode: PathNode = {
      node: startNode,
      routeCost: 0,
      estimatedCost: Graph.distance(startNode, endNode)
    };
    openList.add(startPathNode);
    let routeFound = false;
    let endPathNode: PathNode = null;

    while (!openList.isEmpty()) {
      // The smallest element.
      var currentNode = openList.pop();

      if (currentNode.node == endNode) {
        routeFound = true;
        endPathNode = currentNode
        break;
      }

      currentNode.node.getConnections().forEach((connection) => {
        const node = connection.node;
        const newRouteCost = currentNode.routeCost + connection.weight;

        if (closedList.has(node.id)) {
          // The node is in closed list
          const visitedPathNode = closedList.get(node.id);
          if (newRouteCost < visitedPathNode.routeCost) {
            // Remove from closed list
            closedList.delete(node.id);
            this.updateNodeValues(visitedPathNode, currentNode, newRouteCost, endNode);
            openList.add(visitedPathNode);
          }
        }/* else if (openList.indexOf(node) > -1) {
          // The node is in open list
          if (newRouteCost < node.routeCost) {
            this.updateNodeValues(node, currentNode, newRouteCost, endNode);
          }
        }*/ else {
          // The node is not processed
          const newPathNode: PathNode = {
            node: node,
            prevNode: currentNode,
            routeCost: newRouteCost,
            estimatedCost: newRouteCost + Graph.distance(node, endNode)
          }
          openList.add(newPathNode);
        }
      });

      closedList.set(currentNode.node.id, currentNode);
    }

    const route = [];
    if (routeFound) {
      let routeNode = endPathNode;
      while (routeNode) {
          route.push(routeNode.node);
          routeNode = routeNode.prevNode;
      }
      route.reverse();
    }

    return route;
  }

  private updateNodeValues(node: PathNode, prevNode: PathNode, routeCost: number, endNode: Node) {
    node.routeCost = routeCost;
    node.estimatedCost = routeCost + Graph.distance(node.node, endNode);
    node.prevNode = prevNode;
  }

}