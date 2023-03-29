export type Comparator<T> = (a: T, b: T) => number;

export default class Heap<T> {
  private elements: Array<T> = []

  constructor(public compare: Comparator<T> = Heap.minComparator) {
  }

  static minComparator<N>(a: N, b: N): number {
    if (a == b) {
      return 0;
    } else if (a > b) {
      return 1;
    } 
    return -1;
  }

  static maxComparator<N>(a: N, b: N): number {
    if (a == b) {
      return 0;
    } else if (b > a) {
      return 1;
    } 
    return -1;
  }

  add(e: T) {
    this.siftUp(this.elements.push(e) - 1);
  }

  pop(): T {
    this.swap(0, this.elements.length-1);
    const e = this.elements.pop();
    this.siftDown(0);
    return e;
  }

  isEmpty(): boolean {
    return this.elements.length == 0;
  }

  size(): number {
    return this.elements.length;
  }

  private siftUp(index: number) {
    const parentIndex = this.parentIndex(index);
    if (parentIndex < 0) {
      return;
    }

    if (this.compare(this.elements[parentIndex], this.elements[index]) > 0) {
      this.swap(parentIndex, index);
      this.siftUp(parentIndex);
    }
  }

  private siftDown(index:number) {
    const leftIndex = this.leftChildIndex(index);
    const rightIndex = this.rightChildIndex(index);
    if (leftIndex < 0 && rightIndex < 0) {
      return;
    }
    let swapIndex = leftIndex >= 0 ? leftIndex : rightIndex;
    if (leftIndex >= 0 && rightIndex >= 0) {
      if (this.compare(this.elements[leftIndex], this.elements[rightIndex]) > 0) {
        swapIndex = rightIndex;
      } else {
        swapIndex = leftIndex;
      }
    }
    if (this.compare(this.elements[index], this.elements[swapIndex]) > 0) {
      this.swap(index, swapIndex);
      this.siftDown(swapIndex);
    }
  }

  private leftChildIndex(index: number): number {
    const childIndex = 2 * index + 1;
    if (childIndex < this.elements.length - 1) {
      return childIndex;
    }
    return -1;
  }

  private rightChildIndex(index: number): number {
    const childIndex = 2 * index + 2;
    if (childIndex < this.elements.length - 1) {
      return childIndex;
    }
    return -1;
  }

  parentIndex(index: number): number {
    if (index == 0) {
      return -1;
    }
    return Math.floor((index - 1) / 2);
  }

  private swap(index1: number, index2:number) {
    const e1 = this.elements[index1];
    this.elements[index1] = this.elements[index2];
    this.elements[index2] = e1;
  }
}