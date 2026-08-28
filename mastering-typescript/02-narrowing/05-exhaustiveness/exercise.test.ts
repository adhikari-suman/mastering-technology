import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { assertNever, area, LABELS, describe, perimeter } from './solution.ts';
import type { Shape, Kind } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Kind = Expect<Equal<Kind, 'circle' | 'square' | 'rect'>>;
// Asserted on the function type directly. `ReturnType<typeof assertNever>` is
// NOT `never` here — a function whose parameter is `never` fails to match
// `(...args: any) => infer R`, so the conditional falls through to `any`. Part
// 04 Lesson 03 comes back to that; for now, don't route around it.
type _AssertNever = Expect<Equal<typeof assertNever, (value: never) => never>>;

// `satisfies` covers every key AND keeps the literal values.
type _LabelKeys = Expect<Equal<keyof typeof LABELS, Kind>>;
type _LabelValue = Expect<Equal<(typeof LABELS)['rect'], 'Rectangle'>>;

// Miss a member and what is left is NOT `never` — which is the whole mechanism.
function _missingACase(shape: Shape) {
  if (shape.kind === 'circle' || shape.kind === 'square') {
    // handled
  } else {
    type _Left = Expect<Equal<typeof shape, { kind: 'rect'; width: number; height: number }>>;
    // @ts-expect-error - a rect is not assignable to never
    assertNever(shape);
  }
}

// Cover them all and what is left IS `never`, so the call is accepted. This
// lives in its own function because `assertNever` returns `never`: calling it
// marks the branch as not completing, which would narrow `shape` for anything
// written afterwards.
function _coveringEveryCase(shape: Shape) {
  switch (shape.kind) {
    case 'circle':
    case 'square':
    case 'rect':
      break;
    default:
      assertNever(shape);
  }
}

function _closedMap() {
  // @ts-expect-error - the map is closed over Kind
  LABELS.triangle;
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

test('perimeter', () => {
  assert.equal(perimeter(circle), 2 * Math.PI * 2);
  assert.equal(perimeter(square), 12);
  assert.equal(perimeter(rect), 10);
});

test('LABELS', () => {
  assert.deepEqual(LABELS, { circle: 'Circle', square: 'Square', rect: 'Rectangle' });
});

test('describe', () => {
  assert.equal(describe(circle), 'Circle');
  assert.equal(describe(square), 'Square');
  assert.equal(describe(rect), 'Rectangle');
});

test('assertNever throws, because "impossible" values arrive anyway', () => {
  assert.throws(() => assertNever({ kind: 'triangle' } as never), (err: unknown) => {
    assert.ok(err instanceof Error);
    assert.equal(err.message, 'unhandled: {"kind":"triangle"}');
    return true;
  });
});
