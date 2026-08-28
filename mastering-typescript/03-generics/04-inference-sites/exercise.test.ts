import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { createStore, withFallback, fromEntries, reduce, firstMatching } from './solution.ts';
import type { Store } from './solution.ts';

/* ------------------------------------------------------------------ types */

function _typeOnly() {
  const store = createStore(0);
  type _Store = Expect<Equal<typeof store, Store<number>>>;

  // Two matching candidates agree.
  const ok = withFallback<string>(undefined, 'b');
  type _Ok = Expect<Equal<typeof ok, string>>;

  // @ts-expect-error - the fallback is checked against T, not consulted about it
  withFallback('a', 42);

  const record = fromEntries([['a', 1], ['b', 2]] as const);
  type _Record = Expect<Equal<typeof record, Record<'a' | 'b', 1 | 2>>>;

  // The accumulator comes from the seed.
  const total = reduce([1, 2, 3], (acc, n) => acc + n, 0);
  type _Total = Expect<Equal<typeof total, number>>;
  const joined = reduce(['a', 'b'], (acc, s) => acc + s, '');
  type _Joined = Expect<Equal<typeof joined, string>>;

  // @ts-expect-error - the callback must return the accumulator's type
  reduce([1, 2], (acc, n) => String(acc), 0);

  // Contextual typing: the predicate's parameter needs no annotation.
  firstMatching([1, 2, 3], (n) => n > 1);
  const found = firstMatching(['a'], (s) => s.length > 0);
  type _Found = Expect<Equal<typeof found, string | undefined>>;

  // @ts-expect-error - `n` is a number, so it has no .length
  firstMatching([1, 2], (n) => n.length > 0);
}

/* ---------------------------------------------------------------- runtime */

test('createStore', () => {
  const store = createStore(1);
  assert.equal(store.get(), 1);
  store.set(2);
  assert.equal(store.get(), 2);
});

test('createStore: instances are independent', () => {
  const a = createStore(0);
  const b = createStore(0);
  a.set(5);
  assert.equal(b.get(), 0);
});

test('withFallback', () => {
  // NoInfer means T comes from `value` alone. Pass two bare literals and T is
  // the first one's literal type, so the fallback no longer fits — these
  // bindings are annotated for exactly that reason.
  const present: string = 'a';
  assert.equal(withFallback(present, 'b'), 'a');
  // A `const` initialised to undefined narrows to exactly `undefined`, which
  // would make T `undefined` and reject the fallback. Name T instead.
  assert.equal(withFallback<string>(undefined, 'b'), 'b');

  const zero: number = 0;
  assert.equal(withFallback(zero, 9), 0, 'zero is defined');
  const empty: string = '';
  assert.equal(withFallback(empty, 'x'), '', 'empty is defined');
});

test('fromEntries', () => {
  assert.deepEqual(fromEntries([['a', 1], ['b', 2]]), { a: 1, b: 2 });
  assert.deepEqual(fromEntries([]), {});
});

test('fromEntries: later entries win', () => {
  assert.deepEqual(fromEntries([['a', 1], ['a', 2]]), { a: 2 });
});

test('reduce', () => {
  assert.equal(reduce([1, 2, 3], (acc, n) => acc + n, 0), 6);
  assert.equal(reduce(['a', 'b'], (acc, s) => acc + s, ''), 'ab');
  assert.equal(reduce([], (acc: number, n: number) => acc + n, 7), 7, 'empty returns the seed');
});

test('reduce passes the index', () => {
  assert.deepEqual(reduce([10, 20], (acc: number[], n, i) => [...acc, n + i], []), [10, 21]);
});

test('firstMatching', () => {
  assert.equal(firstMatching([1, 2, 3], (n) => n > 1), 2);
  assert.equal(firstMatching([1, 2, 3], (n) => n > 9), undefined);
  assert.equal(firstMatching([], () => true), undefined);
});

test('firstMatching passes the index and stops at the first hit', () => {
  const seen: number[] = [];
  firstMatching([1, 2, 3], (n, i) => { seen.push(i); return n === 2; });
  assert.deepEqual(seen, [0, 1], 'stopped after the match');
});
