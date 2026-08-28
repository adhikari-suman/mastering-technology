import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { mapKeys } from './solution.ts';
import type {
  MyPartial, MyRequired, MyReadonly, Mutable, MyPick, MyRecord, Getters, PickByType,
} from './solution.ts';

/* ------------------------------------------------------------------ types */

type Source = { a: string; b: number };

type _Partial = Expect<Equal<MyPartial<Source>, { a?: string; b?: number }>>;
type _Required = Expect<Equal<MyRequired<{ a?: string }>, { a: string }>>;
type _Readonly = Expect<Equal<MyReadonly<Source>, { readonly a: string; readonly b: number }>>;
type _Mutable = Expect<Equal<Mutable<{ readonly a: string }>, { a: string }>>;

// Homomorphic: `[K in keyof T]` passes arrays through as arrays.
type _Homomorphic = Expect<Equal<MyPartial<string[]>, (string | undefined)[]>>;
type _ReadonlyArray = Expect<Equal<MyReadonly<string[]>, readonly string[]>>;

type _Pick = Expect<Equal<MyPick<Source, 'a'>, { a: string }>>;
type _PickBoth = Expect<Equal<MyPick<Source, 'a' | 'b'>, { a: string; b: number }>>;

type _Record = Expect<Equal<MyRecord<'a' | 'b', number>, { a: number; b: number }>>;
type _RecordNum = Expect<Equal<MyRecord<number, string>, { [x: number]: string }>>;

type _Getters = Expect<
  Equal<Getters<{ name: string; age: number }>, { getName: () => string; getAge: () => number }>
>;

type _ByType = Expect<
  Equal<PickByType<{ a: string; b: number; c: string }, string>, { a: string; c: string }>
>;
type _ByTypeNone = Expect<Equal<PickByType<{ a: number }, string>, {}>>;

function _typeOnly() {
  // @ts-expect-error - 'z' is not a key of Source
  type _Bad = MyPick<Source, 'z'>;

  // @ts-expect-error - an object is not a valid key
  type _BadKey = MyRecord<{ a: 1 }, string>;
}

/* ---------------------------------------------------------------- runtime */

test('mapKeys', () => {
  assert.deepEqual(mapKeys({ a: 1, b: 2 }, (k) => k.toUpperCase()), { A: 1, B: 2 });
  assert.deepEqual(mapKeys({}, (k) => k), {});
});

test('mapKeys: values are carried over untouched', () => {
  const inner = { deep: true };
  const out = mapKeys({ a: inner }, (k) => `x${k}`);
  assert.equal(out['xa'], inner, 'the same reference');
});

test('mapKeys: later keys win on collision', () => {
  assert.deepEqual(mapKeys({ a: 1, b: 2 }, () => 'same'), { same: 2 });
});

test('mapKeys does not mutate', () => {
  const obj = { a: 1 };
  const out = mapKeys(obj, (k) => k.toUpperCase());
  assert.deepEqual(obj, { a: 1 });
  assert.notEqual(out, obj);
});
