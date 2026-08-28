import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect, ExpectFalse } from '../../type-tests.ts';

import { lookup, lookupOr, increment, rename, hasEmail } from './solution.ts';
import type { User, MaybeEmailUser, FrozenUser, Counts } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _User = Expect<Equal<User, { id: number; name: string; email?: string }>>;
type _Maybe = Expect<Equal<MaybeEmailUser, { id: number; name: string; email: string | undefined }>>;
type _Frozen = Expect<
  Equal<FrozenUser, { readonly id: number; readonly name: string; readonly email?: string }>
>;
type _Counts = Expect<Equal<Counts, { [key: string]: number }>>;

// `?` and `| undefined` are not the same type. This is the flag earning its keep.
type _Different = ExpectFalse<Equal<User, MaybeEmailUser>>;

/**
 * Assertions that need a value to point at. This function is never called: its
 * parameters hand the checker typed bindings, and because nothing invokes it,
 * Node never runs the body. A `@ts-expect-error` only silences the *checker* —
 * the line underneath is still real code, so it has to live somewhere unreached.
 */
function _typeOnly(frozen: FrozenUser, counts: Counts) {
  // Reading an unknown key can miss, and the type says so. Note that this is a
  // property of the *expression*: `noUncheckedIndexedAccess` rewrites what
  // `counts['a']` evaluates to, and leaves the indexed-access type
  // `Counts[string]` alone at plain `number`.
  const read = counts['a'];
  type _Read = Expect<Equal<typeof read, number | undefined>>;

  // Optional means optional.
  const _noEmail: User = { id: 1, name: 'ada' };

  // @ts-expect-error - email is required in MaybeEmailUser, even as undefined
  const _mustHave: MaybeEmailUser = { id: 1, name: 'ada' };

  // @ts-expect-error - exactOptionalPropertyTypes: `?` does not mean "or undefined"
  const _explicitUndefined: User = { id: 1, name: 'ada', email: undefined };

  // Freshness: an object literal written AT the annotation is checked for extras...
  // @ts-expect-error - nickname is not a User property
  const _fresh: User = { id: 1, name: 'ada', nickname: 'a' };

  // ...but the identical object routed through a variable is not. Structural
  // typing accepts it, because it does have everything User asks for.
  const wider = { id: 1, name: 'ada', nickname: 'a' };
  const _notFresh: User = wider;

  // @ts-expect-error - readonly is a compile-time guard on assignment
  frozen.name = 'new';
}

/* ---------------------------------------------------------------- runtime */

test('lookup', () => {
  assert.equal(lookup({ a: 1 }, 'a'), 1);
  assert.equal(lookup({ a: 1 }, 'b'), undefined);
  assert.equal(lookup({}, 'a'), undefined);
});

test('lookup: a zero is a hit, not a miss', () => {
  assert.equal(lookup({ a: 0 }, 'a'), 0);
});

test('lookupOr', () => {
  assert.equal(lookupOr({ a: 1 }, 'a', 99), 1);
  assert.equal(lookupOr({ a: 1 }, 'b', 99), 99);
  assert.equal(lookupOr({ a: 0 }, 'a', 99), 0, 'zero is not missing');
});

test('increment', () => {
  assert.deepEqual(increment({ a: 1 }, 'a'), { a: 2 });
  assert.deepEqual(increment({ a: 1 }, 'b'), { a: 1, b: 1 });
  assert.deepEqual(increment({}, 'x'), { x: 1 });
});

test('increment does not mutate', () => {
  const original = { a: 1 };
  const next = increment(original, 'a');
  assert.deepEqual(original, { a: 1 });
  assert.notEqual(next, original);
});

test('rename', () => {
  const user = { id: 1, name: 'ada', email: 'a@b.c' };
  assert.deepEqual(rename(user, 'grace'), { id: 1, name: 'grace', email: 'a@b.c' });
});

test('rename does not mutate', () => {
  const user = { id: 1, name: 'ada' };
  rename(user, 'grace');
  assert.deepEqual(user, { id: 1, name: 'ada' });
});

test('hasEmail', () => {
  assert.equal(hasEmail({ id: 1, name: 'ada', email: 'a@b.c' }), true);
  assert.equal(hasEmail({ id: 1, name: 'ada' }), false);
  assert.equal(hasEmail({ id: 1, name: 'ada', email: '' }), false, 'empty is not an email');
});
