import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { longest, withDefault, keysOf, merge, groupBy } from './solution.ts';
import type { Box } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _BoxDefault = Expect<Equal<Box, { value: string }>>;
type _BoxExplicit = Expect<Equal<Box<number>, { value: number }>>;

function _typeOnly() {
  // The caller gets their own type back, not the constraint.
  const a: string = 'ab';
  const b: string = 'c';
  const s = longest(a, b);
  type _S = Expect<Equal<typeof s, string>>;
  const xs = longest([1], [1, 2]);
  type _Xs = Expect<Equal<typeof xs, number[]>>;

  // Two literal arguments give two candidates, and mismatched candidates are
  // unioned rather than rejected — worth seeing before it surprises you.
  const lit = longest('ab', 'c');
  type _Lit = Expect<Equal<typeof lit, 'ab' | 'c'>>;

  // @ts-expect-error - a number has no length
  longest(1, 2);

  // The second parameter defaults to null.
  const d = withDefault<string, null>(undefined, null);
  type _D = Expect<Equal<typeof d, string | null>>;
  const both = withDefault('a', 'b');
  type _Both = Expect<Equal<typeof both, 'a' | 'b'>>;

  const keys = keysOf({ a: 1, b: 'x' });
  type _Keys = Expect<Equal<typeof keys, ('a' | 'b')[]>>;

  // @ts-expect-error - a primitive is not an object
  keysOf('str');

  const merged = merge({ a: 1 }, { b: 'x' });
  type _Merged = Expect<Equal<typeof merged, { a: number } & { b: string }>>;

  const grouped = groupBy([1, 2, 3], (n) => (n % 2 === 0 ? 'even' : 'odd'));
  type _Grouped = Expect<Equal<typeof grouped, Record<'even' | 'odd', number[]>>>;

  // A computed key need not be a string.
  const bySize = groupBy(['a', 'bb'], (s) => s.length);
  type _BySize = Expect<Equal<typeof bySize, Record<number, string[]>>>;

  // @ts-expect-error - an object is not a PropertyKey
  groupBy([1], () => ({}));
}

/* ---------------------------------------------------------------- runtime */

test('longest', () => {
  assert.equal(longest('ab', 'c'), 'ab');
  assert.equal(longest('c', 'ab'), 'ab');
  assert.deepEqual(longest([1], [1, 2]), [1, 2]);
});

test('longest: ties go to the first', () => {
  assert.equal(longest('ab', 'cd'), 'ab');
  assert.equal(longest('', ''), '');
});

test('withDefault', () => {
  assert.equal(withDefault('a', 'b'), 'a');
  assert.equal(withDefault(undefined, 'b'), 'b');
  assert.equal(withDefault<string, null>(undefined, null), null);
});

test('withDefault keeps falsy values that are defined', () => {
  assert.equal(withDefault(0, 9), 0);
  assert.equal(withDefault('', 'x'), '');
  assert.equal(withDefault(null, 'x'), null, 'null is defined; only undefined falls back');
});

test('keysOf', () => {
  assert.deepEqual(keysOf({ a: 1, b: 'x' }), ['a', 'b']);
  assert.deepEqual(keysOf({}), []);
});

test('merge', () => {
  assert.deepEqual(merge({ a: 1 }, { b: 'x' }), { a: 1, b: 'x' });
  assert.deepEqual(merge({ a: 1 }, { a: 2 }), { a: 2 }, 'right wins');
  assert.deepEqual(merge({}, {}), {});
});

test('merge does not mutate either input', () => {
  const a = { a: 1 };
  const b = { b: 2 };
  const out = merge(a, b);
  assert.deepEqual(a, { a: 1 });
  assert.deepEqual(b, { b: 2 });
  assert.notEqual(out, a);
  assert.notEqual(out, b);
});

test('groupBy', () => {
  assert.deepEqual(groupBy([1, 2, 3], (n) => (n % 2 === 0 ? 'even' : 'odd')), {
    odd: [1, 3],
    even: [2],
  });
  assert.deepEqual(groupBy([], (n: number) => n), {});
});

test('groupBy keeps insertion order within a group', () => {
  assert.deepEqual(groupBy(['bb', 'a', 'cc'], (s) => s.length), { 2: ['bb', 'cc'], 1: ['a'] });
});
