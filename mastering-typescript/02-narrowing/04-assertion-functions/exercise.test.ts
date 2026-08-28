import test from 'node:test';
// The Lesson exports something called `assert`, so node's assert is aliased.
import assert_ from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import {
  AssertionError, assert, assertIsString, assertIsNumber, assertDefined, parsePort,
} from './solution.ts';

/* ------------------------------------------------------------------ types */

// The `asserts` form is part of the signature, not the return type — these
// check the signature itself, which is what the stub gets wrong.
type _Assert = Expect<Equal<typeof assert, (condition: unknown, message?: string) => asserts condition>>;
type _Defined = Expect<
  Equal<typeof assertDefined, <T>(value: T | null | undefined, name?: string) => asserts value is T>
>;
type _Port = Expect<Equal<ReturnType<typeof parsePort>, number>>;

function _typeOnly(value: unknown, maybe: string | null, mixed: string | number) {
  assertIsString(value);
  type _AfterString = Expect<Equal<typeof value, string>>;

  assertDefined(maybe);
  type _AfterDefined = Expect<Equal<typeof maybe, string>>;
}

function _bareForm(value: unknown, mixed: string | number) {
  // The bare form composes with anything the checker can already narrow.
  assert(typeof value === 'string');
  type _Narrowed = Expect<Equal<typeof value, string>>;

  assert(typeof mixed !== 'string');
  type _Excluded = Expect<Equal<typeof mixed, number>>;
}

function _beforeTheCall(value: unknown) {
  // @ts-expect-error - nothing is proved until the assertion runs
  value.length;
  assertIsString(value);
  value.length;
}

function _numbers(value: unknown) {
  assertIsNumber(value);
  type _N = Expect<Equal<typeof value, number>>;
}

/* ---------------------------------------------------------------- runtime */
// As with predicates, TYPES cannot tell whether these bodies actually throw.

test('assert passes a truthy condition through', () => {
  assert_.doesNotThrow(() => assert(true));
  assert_.doesNotThrow(() => assert(1));
  assert_.doesNotThrow(() => assert('a'));
  assert_.doesNotThrow(() => assert({}));
});

test('assert throws on anything falsy', () => {
  for (const falsy of [false, 0, '', null, undefined, NaN]) {
    assert_.throws(() => assert(falsy), AssertionError);
  }
});

test('assert carries its message, and has a default', () => {
  assert_.throws(() => assert(false, 'custom'), { message: 'custom' });
  assert_.throws(() => assert(false), { message: 'Assertion failed' });
});

test('AssertionError is an Error and names itself', () => {
  const err = new AssertionError('x');
  assert_.ok(err instanceof Error);
  assert_.equal(err.name, 'AssertionError');
  assert_.equal(err.message, 'x');
});

test('assertIsString', () => {
  assert_.doesNotThrow(() => assertIsString(''));
  assert_.throws(() => assertIsString(1), AssertionError);
  assert_.throws(() => assertIsString(null), AssertionError);
  assert_.throws(() => assertIsString(1, 'PORT'), { message: 'PORT must be a string' });
});

test('assertIsNumber', () => {
  assert_.doesNotThrow(() => assertIsNumber(0));
  assert_.doesNotThrow(() => assertIsNumber(NaN));
  assert_.throws(() => assertIsNumber('1'), AssertionError);
  assert_.throws(() => assertIsNumber('1', 'PORT'), { message: 'PORT must be a number' });
});

test('assertDefined', () => {
  assert_.doesNotThrow(() => assertDefined(0));
  assert_.doesNotThrow(() => assertDefined(''));
  assert_.doesNotThrow(() => assertDefined(false));
  assert_.throws(() => assertDefined(null), AssertionError);
  assert_.throws(() => assertDefined(undefined), AssertionError);
  assert_.throws(() => assertDefined(null, 'PORT'), { message: 'PORT is required' });
  assert_.throws(() => assertDefined(null), { message: 'value is required' });
});

test('parsePort', () => {
  assert_.equal(parsePort({ PORT: '8080' }), 8080);
  assert_.equal(parsePort({ PORT: '1' }), 1);
  assert_.equal(parsePort({ PORT: '65535' }), 65535);
});

test('parsePort reports which step failed', () => {
  assert_.throws(() => parsePort({}), { message: 'PORT is required' });
  assert_.throws(() => parsePort({ PORT: null }), { message: 'PORT is required' });
  assert_.throws(() => parsePort({ PORT: 8080 }), { message: 'PORT must be a string' });
  assert_.throws(() => parsePort({ PORT: 'abc' }), { message: 'PORT must be an integer' });
  assert_.throws(() => parsePort({ PORT: '1.5' }), { message: 'PORT must be an integer' });
  assert_.throws(() => parsePort({ PORT: '0' }), { message: 'PORT must be between 1 and 65535' });
  assert_.throws(() => parsePort({ PORT: '70000' }), { message: 'PORT must be between 1 and 65535' });
});

test('parsePort throws AssertionError, not a plain Error', () => {
  assert_.throws(() => parsePort({}), AssertionError);
});
