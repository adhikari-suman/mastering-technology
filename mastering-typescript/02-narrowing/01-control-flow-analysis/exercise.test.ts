import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { classify, describeInput, firstNonEmpty, readLength, getIn, toMessage } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Classify = Expect<Equal<Parameters<typeof classify>[0], unknown>>;
type _First = Expect<Equal<ReturnType<typeof firstNonEmpty>, string | undefined>>;

/**
 * Assertions about what the checker knows at a given point. Never called: the
 * parameters hand it typed bindings, and a `@ts-expect-error` only silences the
 * checker, so the line under one has to live somewhere unreached.
 */
function _typeOnly(value: string | number, maybe: string | null, e: Error | string) {
  if (typeof value === 'string') {
    type _Then = Expect<Equal<typeof value, string>>;
  } else {
    type _Else = Expect<Equal<typeof value, number>>;
  }
  type _Rejoined = Expect<Equal<typeof value, string | number>>;

  // Assignment replaces what was proved, rather than intersecting with it.
  if (typeof value === 'string') {
    value = 3;
    type _AfterWrite = Expect<Equal<typeof value, number>>;
  }

  if (maybe !== null) {
    type _NotNull = Expect<Equal<typeof maybe, string>>;
  }

  // Truthiness removes more than absence — which is the point of the test above.
  if (maybe) {
    type _Truthy = Expect<Equal<typeof maybe, string>>;
  } else {
    type _Falsy = Expect<Equal<typeof maybe, string | null>>;
  }

  if (e instanceof Error) {
    type _IsError = Expect<Equal<typeof e, Error>>;
  } else {
    type _IsString = Expect<Equal<typeof e, string>>;
  }

  // @ts-expect-error - it could still be null out here
  maybe.length;
}

/* ---------------------------------------------------------------- runtime */

test('classify', () => {
  assert.equal(classify('a'), 'string');
  assert.equal(classify(0), 'number');
  assert.equal(classify(false), 'boolean');
  assert.equal(classify(null), 'nullish');
  assert.equal(classify(undefined), 'nullish');
  assert.equal(classify({}), 'other');
  assert.equal(classify([]), 'other');
  assert.equal(classify(() => {}), 'other');
});

test('describeInput', () => {
  assert.equal(describeInput('abc'), 'text:abc');
  assert.equal(describeInput(42), 'number:42');
  assert.equal(describeInput(null), 'nothing');
});

test('describeInput: the falsy values are still values', () => {
  assert.equal(describeInput(''), 'text:', 'an empty string is a string');
  assert.equal(describeInput(0), 'number:0', 'zero is a number');
});

test('firstNonEmpty', () => {
  assert.equal(firstNonEmpty(['', null, 'found', 'later']), 'found');
  assert.equal(firstNonEmpty(['first', 'second']), 'first');
  assert.equal(firstNonEmpty([null, undefined, '']), undefined);
  assert.equal(firstNonEmpty([]), undefined);
});

test('readLength', () => {
  assert.equal(readLength('abcd'), 4);
  assert.equal(readLength([1, 2, 3]), 3);
  assert.equal(readLength(''), 0);
  assert.equal(readLength([]), 0);
  assert.equal(readLength(42), -1);
  assert.equal(readLength(null), -1);
  assert.equal(readLength({ length: 9 }), -1, 'a lookalike is not a string or an array');
});

test('getIn', () => {
  assert.equal(getIn({ a: 1 }, 'a'), 1);
  assert.equal(getIn({ a: 1 }, 'b'), undefined);
  assert.equal(getIn(null, 'a'), undefined, 'typeof null is "object"');
  assert.equal(getIn('str', 'length'), undefined, 'not an object');
  assert.equal(getIn([10, 20], '1'), 20, 'arrays are objects');
});

test('toMessage', () => {
  assert.equal(toMessage(new Error('boom')), 'boom');
  assert.equal(toMessage(new TypeError('bad')), 'bad');
  assert.equal(toMessage('plain'), 'plain');
  assert.equal(toMessage(7), '7');
});
