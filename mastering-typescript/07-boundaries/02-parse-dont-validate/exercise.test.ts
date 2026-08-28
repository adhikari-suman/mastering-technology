import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import {
  ParseError, string, number, boolean, optional, array, object, parse,
} from './solution.ts';
import type { Parser, Infer, ObjectOf, Simplify } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Parser = Expect<Equal<Parser<string>, (value: unknown, path: string) => string>>;
type _InferLeaf = Expect<Equal<Infer<Parser<number>>, number>>;

const userParser = object({
  id: number,
  email: string,
  displayName: optional(string),
  tags: array(string),
});

type _Simplify = Expect<
  Equal<Simplify<{ a: string } & { b?: number }>, { a: string; b?: number }>
>;

// The schema is the runtime check AND the type. They cannot drift.
type User = Infer<typeof userParser>;
type _User = Expect<
  Equal<User, { id: number; email: string; tags: string[]; displayName?: string }>
>;

type _Nested = Expect<Equal<ObjectOf<{ a: Parser<string> }>, { a: string }>>;
type _AllOptional = Expect<
  Equal<ObjectOf<{ a: ReturnType<typeof optional<number>> }>, { a?: number }>
>;

function _typeOnly() {
  const parsed = parse(userParser, {});
  type _Parsed = Expect<Equal<typeof parsed, User>>;

  // The parsed value is a real User, so this is reachable without a cast.
  const id: number = parsed.id;
  const name: string | undefined = parsed.displayName;

  // @ts-expect-error - and this is not on it
  parsed.isAdmin;
}

/* ---------------------------------------------------------------- runtime */

test('leaves accept the right type', () => {
  assert.equal(parse(string, 'a'), 'a');
  assert.equal(parse(number, 1), 1);
  assert.equal(parse(boolean, true), true);
  assert.equal(parse(string, ''), '', 'empty is a string');
  assert.equal(parse(number, 0), 0, 'zero is a number');
});

test('leaves reject the wrong type, at the root', () => {
  assert.throws(() => parse(string, 1), (err: unknown) => {
    assert.ok(err instanceof ParseError);
    assert.equal(err.path, '');
    assert.equal(err.message, 'expected string');
    return true;
  });
  assert.throws(() => parse(number, '1'), { message: 'expected number' });
  assert.throws(() => parse(boolean, 0), { message: 'expected boolean' });
  assert.throws(() => parse(string, null), { message: 'expected string' });
});

test('array', () => {
  assert.deepEqual(parse(array(string), ['a', 'b']), ['a', 'b']);
  assert.deepEqual(parse(array(number), []), []);
});

test('array names the failing index', () => {
  assert.throws(() => parse(array(string), ['a', 1]), (err: unknown) => {
    assert.ok(err instanceof ParseError);
    assert.equal(err.path, '1');
    assert.equal(err.message, '1: expected string');
    return true;
  });
  assert.throws(() => parse(array(string), 'nope'), { message: 'expected array' });
});

test('object', () => {
  assert.deepEqual(
    parse(userParser, { id: 1, email: 'a@b.c', tags: ['x'] }),
    { id: 1, email: 'a@b.c', tags: ['x'] },
  );
});

test('object drops unknown properties', () => {
  const parsed = parse(userParser, { id: 1, email: 'a@b.c', tags: [], isAdmin: true });
  assert.deepEqual(Object.keys(parsed).sort(), ['email', 'id', 'tags']);
});

test('object: optional keys may be absent, and leave no key behind', () => {
  const parsed = parse(userParser, { id: 1, email: 'a@b.c', tags: [] });
  assert.equal('displayName' in parsed, false);
  const given = parse(userParser, { id: 1, email: 'a@b.c', tags: [], displayName: 'Ada' });
  assert.equal(given.displayName, 'Ada');
});

test('object names the failing key', () => {
  assert.throws(
    () => parse(userParser, { id: '1', email: 'a@b.c', tags: [] }),
    { path: 'id', message: 'id: expected number' },
  );
  assert.throws(
    () => parse(userParser, { id: 1, email: 'a@b.c', tags: [1] }),
    { path: 'tags.0', message: 'tags.0: expected string' },
  );
});

test('object rejects non-objects', () => {
  assert.throws(() => parse(userParser, null), { message: 'expected object' });
  assert.throws(() => parse(userParser, []), { message: 'expected object' });
  assert.throws(() => parse(userParser, 'user'), { message: 'expected object' });
});

test('nested objects build up the path', () => {
  const nested = object({ user: object({ address: object({ postcode: string }) }) });
  assert.deepEqual(
    parse(nested, { user: { address: { postcode: 'SW1' } } }),
    { user: { address: { postcode: 'SW1' } } },
  );
  assert.throws(
    () => parse(nested, { user: { address: { postcode: 1 } } }),
    { path: 'user.address.postcode' },
  );
});

test('optional accepts undefined but not the wrong type', () => {
  const p = object({ a: optional(number) });
  assert.deepEqual(parse(p, {}), {});
  assert.deepEqual(parse(p, { a: undefined }), {});
  assert.deepEqual(parse(p, { a: 1 }), { a: 1 });
  assert.throws(() => parse(p, { a: 'x' }), { path: 'a' });
});
