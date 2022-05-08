export default class ImageManager {
  #images;
  #placeholder;

  constructor(placeholderDataUri) {
    this.#images = {};
    if (placeholderDataUri) {
      this.#placeholder = new Image();
      this.#placeholder.src = placeholderDataUri;
    }
  }

  load(images, onDone, onProgress) {
    const queue = [];
    for (let im in images) {
      queue.push(
        { key: im,
          path: images[im]
        }
      );
    }
    if (queue.length == 0) {
      onProgress && onProgress(0, 0, null, null, true);
      onDone && onDone();
      return;
    }
    const itemCounter = {
      loaded: 0,
      total: queue.length
    };
    for (let i = 0; i < queue.length; i++) {
      this.#loadItem(queue[i], itemCounter, onDone, onProgress);
    }
  }

  #loadItem(queueItem, itemCounter, onDone, onProgress) {
    const self = this;
    const img = new Image();
    img.onload = () => {
      self.#images[queueItem.key] = img;
      self.#onItemLoaded(queueItem, itemCounter, onDone, onProgress, true); 
    };
    img.onerror = () => {
      self.#images[queueItem.key] = self.#placeholder ? self.#placeholder : null;
      self.#onItemLoaded(queueItem, itemCounter, onDone, onProgress, false);
    };
    img.src = queueItem.path;
  }

  #onItemLoaded(queueItem, itemCounter, onDone, onProgress, success) {
    itemCounter.loaded++;
    onProgress && onProgress(itemCounter.loaded, itemCounter.total,
      queueItem.key, queueItem.path, success);
    if (itemCounter.loaded == itemCounter.total) {
      onDone && onDone();
    }
  }

  get(key) {
    return this.#images[key];
  }
}