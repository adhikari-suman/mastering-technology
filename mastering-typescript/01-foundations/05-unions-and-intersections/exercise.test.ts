import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect, IsNever } from '../../type-tests.ts';

import { area, describe, totalArea, withId } from './solution.ts';
import type { Circle, Square, Rect, Shape, Kind, WithId, Impossible, SharedKeys } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Circle = Expect<Equal<Circle, { kind: 'circle'; radius: number }>>;
type _Square = Expect<Equal<Square, { kind: 'square'; side: number }>>;
type _Rect = Expect<Equal<Rect, { kind: 'rect'; width: number; height: number }>>;
type _Shape = Expect<Equal<Shape, Circle | Square | Rect>>;
type _Kind = Expect<Equal<Kind, 'circle' | 'square' | 'rect'>>;

type _WithId = Expect<Equal<WithId<{ name: string }>, { name: string } & { id: string }>>;
type _Impossible = Expect<IsNever<Impossible>>;

// The keys you can safely read from "one of these two" are the ones they share.
type _Shared = Expect<Equal<SharedKeys<{ a: 1; b: 2 }, { b: 3; c: 4 }>, 'b'>>;
type _SharedNone = Expect<IsNever<SharedKeys<{ a: 1 }, { b: 2 }>>>;

/**
 * Assertions that need a value to point at. This function is never called: its
 * parameters hand the checker typed bindings, and because nothing invokes it,
 * Node never runs the body. A `@ts-expect-error` only silences the *checker* —
 * the line underneath is still real code, so it has to live somewhere unreached.
 */
function _typeOnly(shape: Shape) {
  // A union only exposes what every member has.
  const _tag: Kind = shape.kind;
  // @ts-expect-error - it might not be a circle
  shape.radius;

  // The tags are closed.
  // @ts-expect-error - 'triangle' is not a Kind
  const _bad: Kind = 'triangle';
}

/* ---------------------------------------------------------------- runtime */

const circle = { kind: 'circle', radius: 2 } as const;
const square = { kind: 'square', side: 3 } as const;
const rect = { kind: 'rect', width: 2, height: 3 } as const;

test('area', () => {
  assert.equal(area(circle), Math.PI * 4);
  assert.equal(area(square), 9);
  assert.equal(area(rect), 6);
});

test('area: degenerate shapes', () => {
  assert.equal(area({ kind: 'circle', radius: 0 }), 0);
  assert.equal(area({ kind: 'rect', width: 0, height: 5 }), 0);
});

test('describe', () => {
  assert.equal(describe(circle), 'circle r=2');
  assert.equal(describe(square), 'square s=3');
  assert.equal(describe(rect), 'rect 2x3');
});

test('totalArea', () => {
  assert.equal(totalArea([square, rect]), 15);
  assert.equal(totalArea([]), 0);
  assert.equal(totalArea([square]), 9);
});

test('withId', () => {
  assert.deepEqual(withId({ name: 'ada' }, 'u1'), { name: 'ada', id: 'u1' });
});

test('withId does not mutate', () => {
  const original = { name: 'ada' };
  const tagged = withId(original, 'u1');
  assert.deepEqual(original, { name: 'ada' });
  assert.notEqual(tagged, original);
});
