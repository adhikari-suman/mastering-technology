import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect, IsNever } from '../../type-tests.ts';

import { splitPath } from './solution.ts';
import type { Split, Join, Trim, Replace, EventName, PathParams } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _S1 = Expect<Equal<Split<'a/b/c', '/'>, ['a', 'b', 'c']>>;
type _S2 = Expect<Equal<Split<'a', '/'>, ['a']>>;
type _S3 = Expect<Equal<Split<'', '/'>, ['']>>;
type _S4 = Expect<Equal<Split<'a-b', '-'>, ['a', 'b']>>;
type _S5 = Expect<Equal<Split<'/a/b', '/'>, ['', 'a', 'b']>>;

type _J1 = Expect<Equal<Join<['a', 'b', 'c'], '/'>, 'a/b/c'>>;
type _J2 = Expect<Equal<Join<['a'], '/'>, 'a'>>;
type _J3 = Expect<Equal<Join<[], '/'>, ''>>;

// Split and Join are inverses on well-behaved input.
type _RoundTrip = Expect<Equal<Join<Split<'a/b/c', '/'>, '/'>, 'a/b/c'>>;

type _T1 = Expect<Equal<Trim<'  a  '>, 'a'>>;
type _T2 = Expect<Equal<Trim<'a'>, 'a'>>;
type _T3 = Expect<Equal<Trim<'   '>, ''>>;
type _T4 = Expect<Equal<Trim<' a b '>, 'a b'>>;

type _R1 = Expect<Equal<Replace<'a-b-c', '-', '+'>, 'a+b-c'>>;
type _R2 = Expect<Equal<Replace<'abc', 'z', 'y'>, 'abc'>>;
type _R3 = Expect<Equal<Replace<'', 'a', 'b'>, ''>>;

type _E1 = Expect<Equal<EventName<'click'>, 'onClick'>>;
type _E2 = Expect<Equal<EventName<'click' | 'focus'>, 'onClick' | 'onFocus'>>;

type _P1 = Expect<Equal<PathParams<'/users/:id'>, { id: string }>>;
type _P2 = Expect<Equal<PathParams<'/users/:id/posts/:postId'>, { id: string; postId: string }>>;
type _P3 = Expect<Equal<PathParams<'/users'>, {}>>;
type _P4 = Expect<Equal<PathParams<'/:a/:b/:c'>, { a: string; b: string; c: string }>>;

/* ---------------------------------------------------------------- runtime */

test('splitPath', () => {
  assert.deepEqual(splitPath('/users/1/'), ['users', '1']);
  assert.deepEqual(splitPath('users/1'), ['users', '1']);
  assert.deepEqual(splitPath('/users'), ['users']);
});

test('splitPath: degenerate paths', () => {
  assert.deepEqual(splitPath('/'), []);
  assert.deepEqual(splitPath(''), []);
  assert.deepEqual(splitPath('///'), []);
});

test('splitPath keeps interior segments intact', () => {
  assert.deepEqual(splitPath('/a/:id/b'), ['a', ':id', 'b']);
});
