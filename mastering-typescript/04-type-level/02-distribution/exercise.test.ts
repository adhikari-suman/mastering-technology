import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { flatMap } from './solution.ts';
import type {
  Distribute, NoDistribute, MyIsNever, MyIsAny, IsUnion, MyEqual,
} from './solution.ts';

/* ------------------------------------------------------------------ types */

type _D1 = Expect<Equal<Distribute<string | number>, string[] | number[]>>;
type _D2 = Expect<Equal<Distribute<string>, string[]>>;
type _N1 = Expect<Equal<NoDistribute<string | number>, (string | number)[]>>;
type _N2 = Expect<Equal<NoDistribute<string>, string[]>>;

type _Nv1 = Expect<Equal<MyIsNever<never>, true>>;
type _Nv2 = Expect<Equal<MyIsNever<string>, false>>;
type _Nv3 = Expect<Equal<MyIsNever<never | string>, false>>;
type _Nv4 = Expect<Equal<MyIsNever<unknown>, false>>;

type _Any1 = Expect<Equal<MyIsAny<any>, true>>;
type _Any2 = Expect<Equal<MyIsAny<unknown>, false>>;
type _Any3 = Expect<Equal<MyIsAny<never>, false>>;
type _Any4 = Expect<Equal<MyIsAny<string>, false>>;
type _Any5 = Expect<Equal<MyIsAny<0>, false>>;

type _U1 = Expect<Equal<IsUnion<string | number>, true>>;
type _U2 = Expect<Equal<IsUnion<string>, false>>;
type _U3 = Expect<Equal<IsUnion<never>, false>>;
type _U4 = Expect<Equal<IsUnion<boolean>, true>>;
type _U5 = Expect<Equal<IsUnion<'a' | 'b' | 'c'>, true>>;

// The one you have been handed since Part 01, now written by you.
type _E1 = Expect<Equal<MyEqual<string, string>, true>>;
type _E2 = Expect<Equal<MyEqual<string, number>, false>>;
type _E3 = Expect<Equal<MyEqual<any, string>, false>>;
type _E4 = Expect<Equal<MyEqual<{ a: string }, { readonly a: string }>, false>>;
type _E5 = Expect<Equal<MyEqual<'a' | 'b', 'b' | 'a'>, true>>;
type _E6 = Expect<Equal<MyEqual<never, never>, true>>;
type _E7 = Expect<Equal<MyEqual<{ a?: string }, { a: string | undefined }>, false>>;
type _E8 = Expect<Equal<MyEqual<unknown, any>, false>>;

// The naive alternative, kept here so the difference is on the page. It does
// not merely give the wrong answer for `any` — it gives BOTH answers, because
// `any extends string` takes both branches and the results are unioned. A
// predicate that returns `boolean` instead of `true` or `false` is unusable as
// an assertion, which is the practical reason `Equal` is written as it is.
type MutuallyAssignable<A, B> = A extends B ? (B extends A ? true : false) : false;
type _Naive = Expect<Equal<MutuallyAssignable<any, string>, boolean>>;
type _NaiveOk = Expect<Equal<MutuallyAssignable<string, string>, true>>;
type _NaiveReadonly = Expect<Equal<MutuallyAssignable<{ a: string }, { readonly a: string }>, true>>;

/* ---------------------------------------------------------------- runtime */

test('flatMap', () => {
  assert.deepEqual(flatMap([1, 2], (n) => [n, n]), [1, 1, 2, 2]);
  assert.deepEqual(flatMap([1, 2, 3], (n) => (n % 2 === 0 ? [n] : [])), [2]);
  assert.deepEqual(flatMap([], (n: number) => [n]), []);
});

test('flatMap flattens exactly one level', () => {
  assert.deepEqual(flatMap([1], (n) => [[n]]), [[1]]);
});

test('flatMap does not mutate its input', () => {
  const items = [1, 2];
  flatMap(items, (n) => [n]);
  assert.deepEqual(items, [1, 2]);
});
