import {describe, expect, test} from '@jest/globals';
import Heap from './Heap';

test('Parent index', () => {
  const myHeap = new Heap<number>();
  expect(myHeap.parentIndex(1)).toBe(0);
  expect(myHeap.parentIndex(2)).toBe(0);
});


test('Min Heap', () => {
  const myHeap = new Heap<number>();
  myHeap.add(10);
  myHeap.add(5);
  myHeap.add(3);
  expect(myHeap.pop()).toBe(3);
  expect(myHeap.pop()).toBe(5);
  myHeap.add(9);
  myHeap.add(8);
  expect(myHeap.pop()).toBe(8);
  expect(myHeap.pop()).toBe(9);
  expect(myHeap.pop()).toBe(10);
  expect(myHeap.isEmpty()).toBe(true);
});


test('Max Heap', () => {
  const myHeap = new Heap<number>(Heap.maxComparator);
  myHeap.add(3);
  myHeap.add(5);
  myHeap.add(10);
  expect(myHeap.pop()).toBe(10);
  expect(myHeap.pop()).toBe(5);
  myHeap.add(8);
  myHeap.add(9);
  expect(myHeap.pop()).toBe(9);
  expect(myHeap.pop()).toBe(8);
  expect(myHeap.pop()).toBe(3);
  expect(myHeap.isEmpty()).toBe(true);
});
