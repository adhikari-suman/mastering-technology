import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { ParseError, parseUser, unsafeParseUser, isUser, assertUser } from './solution.ts';
import type { User } from './solution.ts';

/* ------------------------------------------------------------------ types */

// The two have identical signatures. Only one of them is telling the truth,
// and no type test can tell you which — that is the entire lesson.
type _Same = Expect<Equal<typeof parseUser, typeof unsafeParseUser>>;
type _Assert = Expect<Equal<typeof assertUser, (value: unknown) => asserts value is User>>;

function _typeOnly(value: unknown) {
  if (isUser(value)) {
    type _Narrowed = Expect<Equal<typeof value, User>>;
  }
  assertUser(value);
  type _Asserted = Expect<Equal<typeof value, User>>;
}

/* ---------------------------------------------------------------- runtime */

const valid = { id: 1, email: 'a@b.c' };

test('parseUser accepts a valid user', () => {
  assert.deepEqual(parseUser(valid), { id: 1, email: 'a@b.c' });
  assert.deepEqual(parseUser({ id: 1, email: 'a@b.c', displayName: 'Ada' }), {
    id: 1, email: 'a@b.c', displayName: 'Ada',
  });
});

test('parseUser drops unknown properties', () => {
  assert.deepEqual(parseUser({ id: 1, email: 'a@b.c', isAdmin: true }), { id: 1, email: 'a@b.c' });
});

test('parseUser returns a new object', () => {
  assert.notEqual(parseUser(valid), valid);
});

test('parseUser: an absent displayName leaves no key', () => {
  const parsed = parseUser({ id: 1, email: 'a@b.c' });
  assert.equal('displayName' in parsed, false);
  const explicit = parseUser({ id: 1, email: 'a@b.c', displayName: undefined });
  assert.equal('displayName' in explicit, false, 'undefined is absence here');
});

test('parseUser names the field that failed', () => {
  assert.throws(() => parseUser(null), (err: unknown) => {
    assert.ok(err instanceof ParseError);
    assert.equal(err.field, '');
    assert.equal(err.message, 'expected an object');
    return true;
  });
  assert.throws(() => parseUser({}), { field: 'id', message: 'id must be a number' });
  assert.throws(() => parseUser({ id: '1' }), { field: 'id' });
  assert.throws(() => parseUser({ id: 1 }), { field: 'email', message: 'email must be a string' });
  assert.throws(() => parseUser({ id: 1, email: 2 }), { field: 'email' });
  assert.throws(
    () => parseUser({ id: 1, email: 'a', displayName: 5 }),
    { field: 'displayName', message: 'displayName must be a string' },
  );
});

test('parseUser rejects arrays and primitives', () => {
  assert.throws(() => parseUser([]), { field: '' });
  assert.throws(() => parseUser('user'), { field: '' });
  assert.throws(() => parseUser(undefined), { field: '' });
});

test('unsafeParseUser hands back whatever it was given', () => {
  assert.equal(unsafeParseUser(valid), valid, 'the same reference, unchecked');
});

test('unsafeParseUser returns a "User" that is not one', () => {
  // Both functions are typed `(value: unknown) => User`. Only one is honest.
  const notAUser = unsafeParseUser({ totally: 'wrong' });
  assert.equal(notAUser.email, undefined, 'the type says string; the value is undefined');
  assert.throws(() => notAUser.email.toLowerCase(), TypeError, 'and here is the crash');
});

test('isUser', () => {
  assert.equal(isUser(valid), true);
  assert.equal(isUser({ id: 1, email: 'a@b.c', displayName: 'Ada' }), true);
  assert.equal(isUser({ id: 1, email: 'a@b.c', extra: 1 }), true, 'extra keys are fine');
  assert.equal(isUser({}), false);
  assert.equal(isUser(null), false);
  assert.equal(isUser({ id: '1', email: 'a' }), false);
  assert.equal(isUser({ id: 1, email: 'a', displayName: 5 }), false);
});

test('assertUser throws the same errors as parseUser', () => {
  assert.doesNotThrow(() => assertUser(valid));
  assert.throws(() => assertUser({}), { field: 'id' });
  assert.throws(() => assertUser(null), { field: '' });
});

test('ParseError is an Error and carries its field', () => {
  const err = new ParseError('email', 'bad');
  assert.ok(err instanceof Error);
  assert.equal(err.name, 'ParseError');
  assert.equal(err.field, 'email');
});
