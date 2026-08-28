import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { deepFreeze } from './solution.ts';
import type { Json, DeepReadonly, DeepPartial, TupleOf, Reverse, Paths } from './solution.ts';

/* ------------------------------------------------------------------ types */

function _json() {
  const ok: Json = { a: [1, 'two', true, null, { b: [] }] };
  // @ts-expect-error - a function is not JSON
  const bad: Json = { a: () => {} };
  // @ts-expect-error - undefined is not JSON
  const alsoBad: Json = { a: undefined };
}

type _DR1 = Expect<
  Equal<DeepReadonly<{ a: { b: string } }>, { readonly a: { readonly b: string } }>
>;
type _DR2 = Expect<Equal<DeepReadonly<string[]>, readonly string[]>>;
type _DR3 = Expect<Equal<DeepReadonly<{ a: string[] }>, { readonly a: readonly string[] }>>;
type _DR4 = Expect<Equal<DeepReadonly<string>, string>>;
// Functions are objects. Mapping over one destroys it, so they must be excluded.
type _DR5 = Expect<Equal<DeepReadonly<(a: string) => void>, (a: string) => void>>;

type _DP1 = Expect<Equal<DeepPartial<{ a: { b: string } }>, { a?: { b?: string } }>>;
type _DP2 = Expect<Equal<DeepPartial<string>, string>>;

type _TO1 = Expect<Equal<TupleOf<3, 0>, [0, 0, 0]>>;
type _TO2 = Expect<Equal<TupleOf<0, 0>, []>>;
type _TO3 = Expect<Equal<TupleOf<2, string>, [string, string]>>;

type _Rv1 = Expect<Equal<Reverse<[1, 2, 3]>, [3, 2, 1]>>;
type _Rv2 = Expect<Equal<Reverse<[]>, []>>;
type _Rv3 = Expect<Equal<Reverse<[1]>, [1]>>;
// Tail recursion is what makes this length survivable.
type _Rv4 = Expect<Equal<Reverse<TupleOf<60, 0>>, TupleOf<60, 0>>>;

type _Pa1 = Expect<Equal<Paths<{ a: { b: string }; c: number }>, 'a' | 'a.b' | 'c'>>;
type _Pa2 = Expect<Equal<Paths<{ a: string }>, 'a'>>;
type _Pa3 = Expect<Equal<Paths<{ a: { b: { c: string } } }>, 'a' | 'a.b' | 'a.b.c'>>;

/* ---------------------------------------------------------------- runtime */

test('deepFreeze freezes every level', () => {
  const obj = { a: { b: { c: 1 } } };
  deepFreeze(obj);
  assert.equal(Object.isFrozen(obj), true);
  assert.equal(Object.isFrozen(obj.a), true);
  assert.equal(Object.isFrozen(obj.a.b), true);
});

test('deepFreeze returns the same object', () => {
  const obj = { a: 1 };
  assert.equal(deepFreeze(obj), obj);
});

test('deepFreeze handles arrays', () => {
  const arr = [{ a: 1 }, { b: 2 }];
  deepFreeze(arr);
  assert.equal(Object.isFrozen(arr), true);
  assert.equal(Object.isFrozen(arr[0]), true);
});

test('deepFreeze on primitives is a no-op', () => {
  assert.equal(deepFreeze(1), 1);
  assert.equal(deepFreeze('a'), 'a');
  assert.equal(deepFreeze(null), null);
  assert.equal(deepFreeze(undefined), undefined);
});

test('deepFreeze survives a cycle', () => {
  const a: Record<string, unknown> = { name: 'a' };
  const b: Record<string, unknown> = { name: 'b', a };
  a['b'] = b;
  deepFreeze(a);
  assert.equal(Object.isFrozen(a), true);
  assert.equal(Object.isFrozen(b), true);
});

test('deepFreeze actually prevents writes', () => {
  const obj: { a: { b: number } } = { a: { b: 1 } };
  deepFreeze(obj);
  assert.throws(() => { obj.a.b = 2; }, TypeError, 'strict mode makes this throw');
});
