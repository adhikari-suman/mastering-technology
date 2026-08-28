import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect, IsNever } from '../../type-tests.ts';

import { unwrap } from './solution.ts';
import type {
  MyReturnType, MyParameters, MyAwaited, ElementOf, Head, Tail, Last,
} from './solution.ts';

/* ------------------------------------------------------------------ types */

type _R1 = Expect<Equal<MyReturnType<() => string>, string>>;
type _R2 = Expect<Equal<MyReturnType<(a: number) => void>, void>>;
type _R3 = Expect<Equal<MyReturnType<() => Promise<number>>, Promise<number>>>;

type _P1 = Expect<Equal<MyParameters<(a: number, b: string) => void>, [a: number, b: string]>>;
type _P2 = Expect<Equal<MyParameters<() => void>, []>>;
type _P3 = Expect<Equal<MyParameters<(...xs: number[]) => void>, number[]>>;

type _A1 = Expect<Equal<MyAwaited<Promise<string>>, string>>;
type _A2 = Expect<Equal<MyAwaited<Promise<Promise<number>>>, number>>;
type _A3 = Expect<Equal<MyAwaited<Promise<Promise<Promise<boolean>>>>, boolean>>;
type _A4 = Expect<Equal<MyAwaited<string>, string>>;

type _El1 = Expect<Equal<ElementOf<string[]>, string>>;
type _El2 = Expect<Equal<ElementOf<[1, 2]>, 1 | 2>>;
type _El3 = Expect<Equal<ElementOf<readonly boolean[]>, boolean>>;
type _El4 = Expect<IsNever<ElementOf<string>>>;

type _H1 = Expect<Equal<Head<[1, 2, 3]>, 1>>;
type _H2 = Expect<IsNever<Head<[]>>>;
type _T1 = Expect<Equal<Tail<[1, 2, 3]>, [2, 3]>>;
type _T2 = Expect<Equal<Tail<[]>, []>>;
type _T3 = Expect<Equal<Tail<[1]>, []>>;

type _L1 = Expect<Equal<Last<[1, 2, 3]>, 3>>;
type _L2 = Expect<Equal<Last<[1]>, 1>>;
type _L3 = Expect<IsNever<Last<[]>>>;

// The quirk from Part 02 Lesson 05, now explained AND fixed. The standard
// ReturnType matches with `(...args: any)`, which an uncallable function fails,
// so it silently returns `any`. Matching with `never[]` works — so yours is
// right here and the standard library is not.
declare function assertNever(value: never): never;
type _StandardIsWrong = Expect<Equal<ReturnType<typeof assertNever>, any>>;
type _YoursIsRight = Expect<Equal<MyReturnType<typeof assertNever>, never>>;

// Non-functions fall through to never.
type _R4 = Expect<IsNever<MyReturnType<string>>>;
type _P4 = Expect<IsNever<MyParameters<string>>>;

/* ---------------------------------------------------------------- runtime */

test('unwrap: a plain value', async () => {
  assert.equal(await unwrap(1), 1);
  assert.equal(await unwrap('a'), 'a');
});

test('unwrap: one layer', async () => {
  assert.equal(await unwrap(Promise.resolve(1)), 1);
});

test('unwrap: several layers', async () => {
  assert.equal(await unwrap(Promise.resolve(Promise.resolve('deep'))), 'deep');
});

test('unwrap: a rejection still rejects', async () => {
  await assert.rejects(() => unwrap(Promise.reject(new Error('boom'))), { message: 'boom' });
});

test('unwrap: undefined and null pass through', async () => {
  assert.equal(await unwrap(undefined), undefined);
  assert.equal(await unwrap(null), null);
});
