import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { first, last, head, swap, zip, chunk } from './solution.ts';
import type { Pair, Coord, Concat, NonEmpty } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Pair = Expect<Equal<Pair<string, number>, [string, number]>>;
type _Coord = Expect<Equal<Coord, [x: number, y: number]>>;
type _Concat = Expect<Equal<Concat<[1, 2], [3]>, [1, 2, 3]>>;
type _ConcatEmpty = Expect<Equal<Concat<[], [1]>, [1]>>;
type _NonEmpty = Expect<Equal<NonEmpty<string>, [string, ...string[]]>>;

type _First = Expect<Equal<ReturnType<typeof first<string>>, string | undefined>>;
type _Head = Expect<Equal<ReturnType<typeof head<string>>, string>>;
type _Swap = Expect<Equal<ReturnType<typeof swap<string, number>>, [number, string]>>;

/**
 * Assertions that need a value to point at. This function is never called: its
 * parameters hand the checker typed bindings, and because nothing invokes it,
 * Node never runs the body. A `@ts-expect-error` only silences the *checker* —
 * the line underneath is still real code, so it has to live somewhere unreached.
 */
function _typeOnly(frozen: readonly number[], tuple: [number, number], array: number[]) {
  // A tuple knows its length; an array does not. This is the whole difference,
  // and it shows up on the read rather than on the type.
  const fromTuple = tuple[0];
  type _TupleRead = Expect<Equal<typeof fromTuple, number>>;
  const fromArray = array[0];
  type _ArrayRead = Expect<Equal<typeof fromArray, number | undefined>>;

  // A readonly array is not assignable to a mutable one.
  // @ts-expect-error - that would hand out a push() the source never promised
  const _mutable: number[] = frozen;

  // The other direction is fine, which is why parameters take readonly.
  const _readonly: readonly number[] = [1, 2, 3];

  // @ts-expect-error - an empty array is not a NonEmpty
  const _empty: NonEmpty<number> = [];

  const _ok: NonEmpty<number> = [1];
}

/* ---------------------------------------------------------------- runtime */

test('first / last', () => {
  assert.equal(first([1, 2, 3]), 1);
  assert.equal(last([1, 2, 3]), 3);
  assert.equal(first([]), undefined);
  assert.equal(last([]), undefined);
  assert.equal(first(['only']), 'only');
});

test('first / last: undefined elements are still elements', () => {
  assert.equal(first([undefined, 1]), undefined);
  assert.equal(last([1, 2]), 2);
});

test('head', () => {
  assert.equal(head([1, 2, 3]), 1);
  assert.equal(head(['x']), 'x');
});

test('swap', () => {
  assert.deepEqual(swap([1, 'a']), ['a', 1]);
});

test('swap does not mutate', () => {
  const pair: [number, string] = [1, 'a'];
  swap(pair);
  assert.deepEqual(pair, [1, 'a']);
});

test('zip', () => {
  assert.deepEqual(zip([1, 2], ['a', 'b']), [[1, 'a'], [2, 'b']]);
  assert.deepEqual(zip([1, 2, 3], ['a', 'b']), [[1, 'a'], [2, 'b']], 'stops at the shorter');
  assert.deepEqual(zip([], ['a']), []);
});

test('chunk', () => {
  assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(chunk([1, 2, 3, 4], 2), [[1, 2], [3, 4]]);
  assert.deepEqual(chunk([1], 5), [[1]]);
  assert.deepEqual(chunk([], 2), []);
});

test('chunk rejects a nonsense size', () => {
  assert.throws(() => chunk([1, 2], 0), RangeError);
  assert.throws(() => chunk([1, 2], -1), RangeError);
});
