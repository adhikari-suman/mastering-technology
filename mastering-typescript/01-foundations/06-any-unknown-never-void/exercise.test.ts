import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect, Extends, IsNever } from '../../type-tests.ts';

import {
  parseJson, describeValue, fail, assertNever, runAll, errorMessage,
} from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Parse = Expect<Equal<ReturnType<typeof parseJson>, unknown>>;
type _Fail = Expect<IsNever<ReturnType<typeof fail>>>;
type _AssertNever = Expect<IsNever<Parameters<typeof assertNever>[0]>>;
type _RunAll = Expect<Equal<ReturnType<typeof runAll>, void>>;

// The lattice, as assertions. `unknown` is the top...
type _ToUnknown = Expect<Extends<string, unknown>>;
type _FromUnknown = Expect<Equal<Extends<unknown, string>, false>>;

// ...and `never` is the bottom.
type _FromNever = Expect<Extends<never, string>>;
type _ToNever = Expect<Equal<Extends<string, never>, false>>;

// `never` is absorbed by a union, the way the empty set is by ∪.
type _Absorbed = Expect<Equal<string | never, string>>;

/**
 * Assertions that need a value to point at. This function is never called: its
 * parameters hand the checker typed bindings, and because nothing invokes it,
 * Node never runs the body. A `@ts-expect-error` only silences the *checker* —
 * the line underneath is still real code, so it has to live somewhere unreached.
 */
function _typeOnly(u: unknown) {
  // The void hole: a function returning something fits where nothing was wanted.
  const _returnsSomething: () => void = () => 42;
  runAll([() => 42, () => 'x', () => {}]);

  // But the caller still cannot use the result.
  // @ts-expect-error - a void result has no properties to reach for
  runAll([]).toString();

  // unknown demands proof before use.
  // @ts-expect-error - narrow it first
  u.length;
}

/* ---------------------------------------------------------------- runtime */

test('parseJson', () => {
  assert.deepEqual(parseJson('{"a":1}'), { a: 1 });
  assert.deepEqual(parseJson('[1,2]'), [1, 2]);
  assert.equal(parseJson('null'), null);
  assert.equal(parseJson('3'), 3);
});

test('parseJson lets bad input throw', () => {
  assert.throws(() => parseJson('{'), SyntaxError);
});

test('describeValue', () => {
  assert.equal(describeValue(null), 'null');
  assert.equal(describeValue([]), 'array');
  assert.equal(describeValue([1, 2]), 'array');
  assert.equal(describeValue({}), 'object');
  assert.equal(describeValue('s'), 'string');
  assert.equal(describeValue(1), 'number');
  assert.equal(describeValue(true), 'boolean');
});

test('describeValue: the ones that catch people out', () => {
  assert.equal(describeValue(undefined), 'other');
  assert.equal(describeValue(() => {}), 'other');
  assert.equal(describeValue(Symbol('s')), 'other');
  assert.equal(describeValue(new Date()), 'object');
});

test('fail throws its message', () => {
  assert.throws(() => fail('boom'), { message: 'boom' });
});

test('assertNever throws and names the value', () => {
  // Reachable only by lying to the checker, which is what the cast is for:
  // at runtime the branch this guards really can be hit.
  assert.throws(() => assertNever('surprise' as never), (err: unknown) => {
    assert.ok(err instanceof Error);
    assert.match(err.message, /surprise/);
    return true;
  });
});

test('runAll calls each callback in order', () => {
  const seen: number[] = [];
  runAll([() => seen.push(1), () => seen.push(2), () => seen.push(3)]);
  assert.deepEqual(seen, [1, 2, 3]);
});

test('runAll on an empty list is a no-op', () => {
  assert.equal(runAll([]), undefined);
});

test('errorMessage', () => {
  assert.equal(errorMessage(new Error('boom')), 'boom');
  assert.equal(errorMessage(new TypeError('bad type')), 'bad type');
  assert.equal(errorMessage('a string was thrown'), 'a string was thrown');
  assert.equal(errorMessage(42), 'unknown error');
  assert.equal(errorMessage(null), 'unknown error');
  assert.equal(errorMessage(undefined), 'unknown error');
});
