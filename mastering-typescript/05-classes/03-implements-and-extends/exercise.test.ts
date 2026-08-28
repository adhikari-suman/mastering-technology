import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { Shape, Square, Circle, totalArea, Registry } from './solution.ts';
import type { Describable, ShapeConstructor } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Ctor = Expect<Equal<ShapeConstructor<Square>, new (size: number) => Square>>;

function _typeOnly(shape: Shape, square: Square) {
  // A concrete subclass satisfies the interface the base declared.
  const d: Describable = square;
  type _Name = Expect<Equal<typeof shape.name, string>>;

  // @ts-expect-error - an abstract class cannot be constructed
  new Shape();

  // @ts-expect-error - and it is not assignable to a construct signature either
  const ctor: ShapeConstructor<Shape> = Shape;

  // A concrete one is.
  const ok: ShapeConstructor<Square> = Square;

  // @ts-expect-error - name is readonly
  shape.name = 'other';

  // scaleBy stays on the abstract type; the runtime tests check the kind.
  type _Scale = Expect<Equal<ReturnType<typeof shape.scaleBy>, Shape>>;
}

/* ---------------------------------------------------------------- runtime */

test('Square', () => {
  const s = new Square(3);
  assert.equal(s.area(), 9);
  assert.equal(s.name, 'square');
  assert.equal(s.describe(), 'square with area 9.00');
});

test('Circle', () => {
  const c = new Circle(1);
  assert.equal(c.area(), Math.PI);
  assert.equal(c.name, 'circle');
  assert.equal(c.describe(), 'circle with area 3.14');
});

test('describe is inherited and calls the subclass area', () => {
  assert.equal(new Square(2).describe(), 'square with area 4.00');
  assert.equal(new Circle(2).describe(), 'circle with area 12.57');
});

test('scaleBy returns a new shape of the same kind', () => {
  const s = new Square(3).scaleBy(2);
  assert.ok(s instanceof Square);
  assert.equal(s.area(), 36);

  const c = new Circle(1).scaleBy(3);
  assert.ok(c instanceof Circle);
  assert.equal(c.area(), Math.PI * 9);
});

test('scaleBy does not mutate the original', () => {
  const original = new Square(3);
  original.scaleBy(10);
  assert.equal(original.area(), 9);
});

test('every shape is a Shape', () => {
  assert.ok(new Square(1) instanceof Shape);
  assert.ok(new Circle(1) instanceof Shape);
});

test('totalArea', () => {
  assert.equal(totalArea([new Square(2), new Square(3)]), 13);
  assert.equal(totalArea([]), 0);
});

test('Registry', () => {
  const r = new Registry();
  r.register('square', Square);
  r.register('circle', Circle);
  assert.deepEqual(r.names(), ['square', 'circle']);

  const s = r.create('square', 4);
  assert.ok(s instanceof Square);
  assert.equal(s.area(), 16);

  assert.equal(r.create('triangle', 1), undefined);
});

test('Registry: re-registering a name replaces it without reordering', () => {
  const r = new Registry();
  r.register('shape', Square);
  r.register('other', Circle);
  r.register('shape', Circle);
  assert.deepEqual(r.names(), ['shape', 'other']);
  assert.ok(r.create('shape', 1) instanceof Circle);
});
