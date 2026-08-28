import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect, IsNever } from '../../type-tests.ts';

import { kindOf } from './solution.ts';
import type { MyExclude, MyExtract, MyNonNullable, If, Kind } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Ex1 = Expect<Equal<MyExclude<'a' | 'b' | 'c', 'a'>, 'b' | 'c'>>;
type _Ex2 = Expect<Equal<MyExclude<string | number, string>, number>>;
type _Ex3 = Expect<IsNever<MyExclude<'a', 'a'>>>;
type _Ex4 = Expect<Equal<MyExclude<string, 'a'>, string>>;

type _Xt1 = Expect<Equal<MyExtract<'a' | 'b', 'a' | 'z'>, 'a'>>;
type _Xt2 = Expect<Equal<MyExtract<string | number, string>, string>>;
type _Xt3 = Expect<IsNever<MyExtract<'a', 'b'>>>;

type _Nn1 = Expect<Equal<MyNonNullable<string | null>, string>>;
type _Nn2 = Expect<Equal<MyNonNullable<string | null | undefined>, string>>;
type _Nn3 = Expect<IsNever<MyNonNullable<null | undefined>>>;
type _Nn4 = Expect<Equal<MyNonNullable<number>, number>>;

type _If1 = Expect<Equal<If<true, 'yes', 'no'>, 'yes'>>;
type _If2 = Expect<Equal<If<false, 'yes', 'no'>, 'no'>>;

type _K1 = Expect<Equal<Kind<'x'>, 'string'>>;
type _K2 = Expect<Equal<Kind<1>, 'number'>>;
type _K3 = Expect<Equal<Kind<true>, 'boolean'>>;
type _K4 = Expect<Equal<Kind<null>, 'null'>>;
type _K5 = Expect<Equal<Kind<undefined>, 'undefined'>>;
type _K6 = Expect<Equal<Kind<() => void>, 'function'>>;
type _K7 = Expect<Equal<Kind<string[]>, 'array'>>;
type _K8 = Expect<Equal<Kind<{ a: 1 }>, 'object'>>;

function _typeOnly() {
  // @ts-expect-error - If takes a boolean, and 'yes' is not one
  type _Bad = If<'yes', 1, 2>;
}

/* ---------------------------------------------------------------- runtime */

test('kindOf: primitives', () => {
  assert.equal(kindOf('x'), 'string');
  assert.equal(kindOf(1), 'number');
  assert.equal(kindOf(true), 'boolean');
  assert.equal(kindOf(undefined), 'undefined');
});

test('kindOf: the object-shaped ones', () => {
  assert.equal(kindOf(null), 'null');
  assert.equal(kindOf([]), 'array');
  assert.equal(kindOf([1, 2]), 'array');
  assert.equal(kindOf({}), 'object');
  assert.equal(kindOf(new Date()), 'object');
});

test('kindOf: functions', () => {
  assert.equal(kindOf(() => {}), 'function');
  assert.equal(kindOf(function named() {}), 'function');
  assert.equal(kindOf(class {}), 'function');
});

test('kindOf agrees with Kind on the shapes both cover', () => {
  // The type-level cascade and the runtime cascade must ask their questions in
  // the same order, or they disagree on arrays and null.
  const cases: [unknown, string][] = [
    ['x', 'string'], [1, 'number'], [true, 'boolean'],
    [null, 'null'], [undefined, 'undefined'],
    [[], 'array'], [{}, 'object'], [() => {}, 'function'],
  ];
  for (const [value, expected] of cases) assert.equal(kindOf(value), expected);
});
