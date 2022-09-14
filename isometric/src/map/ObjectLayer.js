import Arrays from "../Arrays"
import GameObject from "../GameObject";
import Rect from "../Rect";

export default class ObjectLayer extends GameObject {
  #objects;
  #clusterSize;
  #worldWidth;
  #worldHeight;
  #clusters;
  #idToClusterBounds;
  #visibleClusterBounds;
  #cache;
  #cacheDirty;
  #cacheUnsorted;
  #boundOnMove;

  constructor(objects, clusterSize, worldWidth, worldHeight) {
    super();
    this.#objects = objects;
    this.#clusterSize = clusterSize;
    this.#worldWidth = worldWidth;
    this.#worldHeight = worldHeight;
    /* the clusters arranged into the grid*/
    this.#clusters = [];
    /* object id to Rect - the cluster bounds */
    this.#idToClusterBounds = {};
    /* currently visible clusters */
    this.#visibleClusterBounds = {};
    /* the sorted array of objects from active clusters, no duplicates*/
    this.#cache = [];

    /* true if cache needs to be fully rebuilt */
    this.#cacheDirty = true;
    /* true if cache only needs to be sorted (when object moved for example) */
    this.#cacheUnsorted = false;
    this.addListener("up", this.#onUpEvent.bind(this));
    this.#boundOnMove = this.#onObjectMove.bind(this);
    this.#addMoveListeners();
    this.#resetClusters();
  }

  #addMoveListeners() {
    for (let i = 0; i < this.#objects.length; i++) {
        this.#objects[i].addListener("move", this.#boundOnMove);
    }
  }

  /**
   * Reassign each object to a cluster (or several clusters)
   */
  #resetClusters() {
    // Clear clusters
    this.#clusters = [];
    for (let i = 0; i < Math.ceil(this.#worldHeight/this.#clusterSize); i++) {
      this.#clusters[i] = [];
      for (let j = 0; j < Math.ceil(this.#worldWidth/this.#clusterSize); j++) {
        this.#clusters[i][j] = [];
      }
    }
    // Assign every object to cluster
    for (let i = 0; i < this.#objects.length; i++) {
      this.#addToClusters(this.#objects[i]);
    }
  }

  #addToClusters(obj, clusterBounds) {
    clusterBounds = clusterBounds || obj.getBounds().getOverlappingGridCells(
      this.#clusterSize, this.#clusterSize, this.#clusters[0].length, this.#clusters.length);
    const startY = clusterBounds.y;
    const endY = clusterBounds.y + clusterBounds.height;
    const startX = clusterBounds.x;
    const endX = clusterBounds.x + clusterBounds.width;
    for (let clusterY = startY; clusterY < endY; clusterY++) {
      for (let clusterX = startX; clusterX < endX; clusterX++) {
        this.#clusters[clusterY][clusterX].push(obj);
      }
    }
    this.#idToClusterBounds[obj.getId()] = clusterBounds;
    return clusterBounds;
  }

  #onUpEvent(e) {
    if (e.moved)
        return;

    const bounds = this.getBounds();
    const x = e.x + bounds.x;
    const y = e.y + bounds.y;
    const obj = this.getObjectAt(x, y);
    if (obj) {
        obj.emit("up", e);
        this.emit("objectClicked", {object: obj, layer: this, cause: e});
    }
  }

  getObjectAt(x, y) {
    for (let i = 0; i < this.#cache.length; i++) {
        if (this.#cache[i].getBounds().containsPoint(x, y)) {
            return this.#cache[i];
        }
    }
    return null;
  }

  #onObjectMove(e) {
    const obj = e.object;
    const id = obj.getId();
    const objectBounds = obj.getBounds();
    const newClusters = objectBounds.getOverlappingGridCells(
      this.#clusterSize, this.#clusterSize, this.#clusters[0].length, this.#clusters.length);
    const oldClusters = this.#idToClusterBounds[id];
    if (!oldClusters.equals(newClusters)) {
      this.#moveObjectBetweenClusters(obj, oldClusters, newClusters);
    }
    if (newClusters.intersects(this.#visibleClusterBounds) && e.y != e.oldY) {
      this.#cacheUnsorted = true;
    }
    // The object has moved, mark two rectangles dirty:
    // the old position and the new position of the object.
    const worldBounds = obj.getBounds();
    const bounds = this.getBounds();
    this.markDirty(worldBounds.x - bounds.x, worldBounds.y - bounds.y,
            worldBounds.width, worldBounds.height);
    this.markDirty(
            new Rect(e.oldX - bounds.x, e.oldY - bounds.y,
                    worldBounds.width, worldBounds.height));
  }

  #moveObjectBetweenClusters(obj, oldClusters, newClusters) {
    this.#removeFromClusters(obj, oldClusters);
    this.#addToClusters(obj, newClusters);
    // If object has left the screen, remove from cache
    if (newClusters.intersects(this.#visibleClusterBounds)) {
      Arrays.addIfAbsent(obj, this.#cache);
    } else {
      Arrays.remove(obj, this.#cache);
    }
  }

  draw(ctx, dirtyRect) {
    if (this.#cacheDirty) {
      this.#resetCache();
    } else if (this.#cacheUnsorted) {
      this.#sortCache();
    }
    // If there is no dirty rectangle – repaint all and use the _bounds
    // instead of dirty rectangle
    const selfBounds = this.getBounds();
    dirtyRect = dirtyRect || new Rect(0, 0, selfBounds.width, selfBounds.height);
    for (let i = 0; i < this.#cache.length; i++) {
      const obj = this.#cache[i];
      // Draw object only if it intersects the dirty rectangle
      if (this.#getScreenBounds(obj).intersects(dirtyRect)) {
        obj.draw(ctx, selfBounds.x, selfBounds.y, dirtyRect);
      }
    }
  }

  #resetCache() {
    this.#cache = [];
    const startY = this.#visibleClusterBounds.y;
    const endY = this.#visibleClusterBounds.y + this.#visibleClusterBounds.height;
    const startX = this.#visibleClusterBounds.x;
    const endX = this.#visibleClusterBounds.x + this.#visibleClusterBounds.width;
    for (let i = startY; i < endY; i++) {
      for (let j = startX; j < endX; j++) {
        const cluster = this.#clusters[i][j];
        for (let k = 0; k < cluster.length; k++) {
          if (!this.#cache.includes(cluster[k])) {
            this.#cache.push(cluster[k]);
          }
        }
      }
    }
    this.#sortCache();
    this.#cacheDirty = false;
  }

  #sortCache() {
    this.#cache.sort((a, b) => {
      const aBounds = a.getBounds();
      const bBounds = b.getBounds();
      return (aBounds.y + aBounds.height) - (bBounds.y + bBounds.height);
    });
    this.#cacheUnsorted = false; 
  }

  addObject(obj) {
    this.#objects.push(obj);
    obj.addListener("move", this.#boundOnMove);
    const clusterBounds = this.#addToClusters(obj);
    if (clusterBounds.intersects(this.#visibleClusterBounds)) {
      this.#cache.push(obj);
      this.#cacheUnsorted = true;
      this.markDirty(this.#getScreenBounds(obj));
    }
  }

  removeObject(obj) {
    if (!this.#objects.includes(obj)) {
      return;
    }
    obj.removeListener("move", this.#boundOnMove);
    this.#removeFromClusters(obj);
    Arrays.remove(obj, this.#cache);
    this.markDirty(this.#getScreenBounds(obj));
  }

  #removeFromClusters(obj, clusterBounds) {
    clusterBounds = clusterBounds || this.#idToClusterBounds[obj.getId()];
    const startY = clusterBounds.y;
    const endY = clusterBounds.y + clusterBounds.height;
    const startX = clusterBounds.x;
    const endX = clusterBounds.x + clusterBounds.width;
    for (let clusterY = startY; clusterY < endY; clusterY++) {
      for (let clusterX = startX; clusterX < endX; clusterX++) {
        Arrays.remove(obj, this.#clusters[clusterY][clusterX]);
      }
    }
    delete this.#idToClusterBounds[obj.getId()];
  }

  setSize(width, height) {
    super.setSize(width, height);
    this.#updateVisibleClusters();
  }

  setPosition(x, y) {
    super.setPosition(x, y);
    this.#updateVisibleClusters();
  }

  /**
   * Called when the viewport has moved and checks if we are still on the same
   * set of "active" clusters
   */
  #updateVisibleClusters() {
    const newRect = this.getBounds().getOverlappingGridCells(
      this.#clusterSize, this.#clusterSize, this.#clusters[0].length, this.#clusters.length);
    if (!newRect.equals(this.#visibleClusterBounds)) {
      this.#visibleClusterBounds = newRect;
      this.#cacheDirty = true;
    }
  }

  #getScreenBounds(obj) {
    const selfBounds = this.getBounds();
    const worldBounds = obj.getBounds();
    return new Rect(worldBounds.x - selfBounds.x, worldBounds.y - selfBounds.y,
      worldBounds.width, worldBounds.height);
  }
}
