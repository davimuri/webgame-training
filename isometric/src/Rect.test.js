import Rect from "./Rect";

test('copy rect', () => {
  const r1 = new Rect(5, 10, 15, 20);
  const r2 = r1.copy();
  expect(r2.x).toBe(5);
  expect(r2.y).toBe(10);
  expect(r2.width).toBe(15);
  expect(r2.height).toBe(20);
});

test('equals rect', () => {
  const r1 = new Rect(5, 10, 15, 20);
  const r2 = new Rect(5, 10, 15, 20);
  expect(r1.equals(r2)).toBe(true);
});

test('different rect', () => {
  const r1 = new Rect(5, 10, 15, 20);
  const r2 = new Rect(4, 10, 15, 20);
  expect(r1.equals(r2)).toBe(false);
});

test('one rect contains other then intersects', () => {
  const r1 = new Rect(5, 10, 15, 20);
  expect(r1.intersects(8, 13, 10, 15)).toBe(true);
});

test('two rects intersect in one point', () => {
  const r1 = new Rect(5, 10, 15, 20);
  expect(r1.intersects(15, 20, 5, 5)).toBe(true);
});
