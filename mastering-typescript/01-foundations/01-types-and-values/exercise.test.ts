import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

// `Named` is imported without `type` because it is a value here as well as a
// type. One import binding carries both meanings.
import { origin, makePoint, distance, Named } from './solution.ts';
import type { Point, PointKey, PointValue, Origin, Vec, MakePoint } from './solution.ts';

/* ------------------------------------------------------------------ types */
// These are the failing assertions until you replace the stubs. They produce
// no runtime code at all — every one of them is gone by the time Node runs.

type _Point = Expect<Equal<Point, { x: number; y: number }>>;
type _Key = Expect<Equal<PointKey, 'x' | 'y'>>;
type _Value = Expect<Equal<PointValue, number>>;
type _Origin = Expect<Equal<Origin, { x: number; y: number }>>;
type _Vec = Expect<Equal<Vec, { x: number; y: number }>>;
type _Named = Expect<Equal<Named, { name: string }>>;
type _MakePoint = Expect<Equal<MakePoint, (x: number, y: number) => Point>>;

/**
 * Assertions that need a value to point at. This function is never called: its
 * parameters hand the checker typed bindings, and because nothing invokes it,
 * Node never runs the body. A `@ts-expect-error` only silences the *checker* —
 * the line underneath is still real code, so it has to live somewhere unreached.
 */
function _typeOnly() {
  // A Point needs both properties.
  // @ts-expect-error - missing y
  const _missing: Point = { x: 1 };

  // A Point is exactly two numbers; a third property is not one.
  // @ts-expect-error - z is not part of Point
  const _extra: Point = { x: 1, y: 2, z: 3 };

  // The value half of `Named` must satisfy the type half.
  const _both: Named = Named;
}

/* ---------------------------------------------------------------- runtime */

test('origin is left alone', () => {
  assert.deepEqual(origin, { x: 0, y: 0 });
});

test('the two typeofs are different operators', () => {
  // Value space: this is the JavaScript operator, and it yields a string.
  assert.equal(typeof origin, 'object');
  // Type space: `Origin` above is the object type. Same word, other world.
});

test('makePoint builds a point', () => {
  assert.deepEqual(makePoint(3, 4), { x: 3, y: 4 });
  assert.deepEqual(makePoint(0, 0), { x: 0, y: 0 });
});

test('makePoint returns a fresh object each time', () => {
  assert.notEqual(makePoint(1, 1), makePoint(1, 1));
});

test('distance', () => {
  assert.equal(distance({ x: 0, y: 0 }, { x: 3, y: 4 }), 5);
  assert.equal(distance({ x: 1, y: 1 }, { x: 1, y: 1 }), 0);
  assert.equal(distance({ x: -1, y: 0 }, { x: 1, y: 0 }), 2);
});

test('Named exists as a value, not only as a type', () => {
  assert.equal(typeof Named, 'object');
  assert.equal(typeof Named.name, 'string');
});
