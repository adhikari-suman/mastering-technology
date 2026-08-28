import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { identity, pair, swap, pluck, pickMany, mapValues, tap } from './solution.ts';

/* ------------------------------------------------------------------ types */

function _typeOnly() {
  const obj = { a: 1, b: 'x', c: true };

  // A literal argument stays literal when it lands in a `const`: inference
  // produces 'a', and there is no mutable location to widen it.
  const id = identity('a');
  type _Id = Expect<Equal<typeof id, 'a'>>;

  // Hand it something already widened and you get that back instead.
  const wide: string = 'a';
  const id2 = identity(wide);
  type _Id2 = Expect<Equal<typeof id2, string>>;

  const p = pair(1, 'x');
  type _Pair = Expect<Equal<typeof p, [number, string]>>;

  const s = swap<number, string>([1, 'x']);
  type _Swap = Expect<Equal<typeof s, [string, number]>>;

  // The constraint keeps the result specific rather than a union of everything.
  const a = pluck(obj, 'a');
  type _PluckA = Expect<Equal<typeof a, number>>;
  const b = pluck(obj, 'b');
  type _PluckB = Expect<Equal<typeof b, string>>;

  // @ts-expect-error - 'z' is not a key of obj
  pluck(obj, 'z');

  const picked = pickMany(obj, ['a', 'b']);
  type _Picked = Expect<Equal<typeof picked, { a: number; b: string }>>;

  // @ts-expect-error - the same constraint applies to a list of keys
  pickMany(obj, ['a', 'z']);

  const mapped = mapValues({ a: 1, b: 2 }, (n) => String(n));
  type _Mapped = Expect<Equal<typeof mapped, Record<'a' | 'b', string>>>;

  const tapped = tap({ n: 1 }, (v) => v.n);
  type _Tapped = Expect<Equal<typeof tapped, { n: number }>>;
}

/* ---------------------------------------------------------------- runtime */

test('identity', () => {
  assert.equal(identity(1), 1);
  const obj = { a: 1 };
  assert.equal(identity(obj), obj, 'the same reference');
});

test('pair', () => {
  assert.deepEqual(pair(1, 'x'), [1, 'x']);
  assert.deepEqual(pair(null, undefined), [null, undefined]);
});

test('swap', () => {
  assert.deepEqual(swap([1, 'x']), ['x', 1]);
});

test('swap does not mutate', () => {
  const p: [number, string] = [1, 'x'];
  swap(p);
  assert.deepEqual(p, [1, 'x']);
});

test('pluck', () => {
  assert.equal(pluck({ a: 1, b: 'x' }, 'a'), 1);
  assert.equal(pluck({ a: 1, b: 'x' }, 'b'), 'x');
});

test('pluck reads undefined values as undefined, not as missing', () => {
  assert.equal(pluck({ a: undefined }, 'a'), undefined);
});

test('pickMany', () => {
  assert.deepEqual(pickMany({ a: 1, b: 'x', c: true }, ['a', 'b']), { a: 1, b: 'x' });
  assert.deepEqual(pickMany({ a: 1 }, []), {});
  assert.deepEqual(pickMany({ a: 1, b: 2 }, ['b']), { b: 2 });
});

test('pickMany does not mutate its input', () => {
  const obj = { a: 1, b: 2 };
  const out = pickMany(obj, ['a']);
  assert.deepEqual(obj, { a: 1, b: 2 });
  assert.notEqual(out, obj);
});

test('mapValues', () => {
  assert.deepEqual(mapValues({ a: 1, b: 2 }, (n) => String(n)), { a: '1', b: '2' });
  assert.deepEqual(mapValues({}, (n: number) => n), {});
});

test('mapValues passes the key as the second argument', () => {
  assert.deepEqual(mapValues({ a: 1, b: 2 }, (n, k) => `${k}${n}`), { a: 'a1', b: 'b2' });
});

test('tap returns its input and runs the effect', () => {
  const seen: number[] = [];
  const obj = { n: 1 };
  const out = tap(obj, (v) => { seen.push(v.n); });
  assert.equal(out, obj, 'the same reference');
  assert.deepEqual(seen, [1]);
});

test('tap ignores whatever the effect returns', () => {
  assert.equal(tap(5, () => { }), 5);
});
