import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { isString, isNumber, isNonNull, isRecord, hasKey, isArrayOf, compact } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Compact = Expect<Equal<ReturnType<typeof compact<string>>, string[]>>;

function _typeOnly(value: unknown, maybe: string | null | undefined, mixed: string | number) {
  if (isString(value)) {
    type _S = Expect<Equal<typeof value, string>>;
  }
  if (isNumber(value)) {
    type _N = Expect<Equal<typeof value, number>>;
  }

  // A predicate narrows in both directions.
  if (isString(mixed)) {
    type _Then = Expect<Equal<typeof mixed, string>>;
  } else {
    type _Else = Expect<Equal<typeof mixed, number>>;
  }

  // Generic: `T` survives, the nullish parts don't.
  if (isNonNull(maybe)) {
    type _Kept = Expect<Equal<typeof maybe, string>>;
  }

  if (isRecord(value)) {
    type _Rec = Expect<Equal<typeof value, Record<string, unknown>>>;
    // The values are unknown, because nothing proved otherwise.
    type _Val = Expect<Equal<(typeof value)[string], unknown>>;
  }

  if (hasKey(value, 'id')) {
    type _Key = Expect<Equal<typeof value.id, unknown>>;
  }

  if (isArrayOf(value, isString)) {
    type _Arr = Expect<Equal<typeof value, string[]>>;
  }

  // @ts-expect-error - nothing has been proved about it out here
  value.length;
}

/* ---------------------------------------------------------------- runtime */
// These matter more than usual: a predicate's body is not checked against its
// claim, so TYPES cannot tell you whether these are honest. Only RUNTIME can.

test('isString', () => {
  assert.equal(isString('a'), true);
  assert.equal(isString(''), true);
  assert.equal(isString(1), false);
  assert.equal(isString(null), false);
  assert.equal(isString(String('x')), true);
});

test('isNumber', () => {
  assert.equal(isNumber(1), true);
  assert.equal(isNumber(0), true);
  assert.equal(isNumber(NaN), true, 'NaN really is a number');
  assert.equal(isNumber('1'), false);
  assert.equal(isNumber(null), false);
});

test('isNonNull', () => {
  assert.equal(isNonNull('a'), true);
  assert.equal(isNonNull(0), true, 'zero is not null');
  assert.equal(isNonNull(''), true, 'empty is not null');
  assert.equal(isNonNull(false), true);
  assert.equal(isNonNull(null), false);
  assert.equal(isNonNull(undefined), false);
});

test('isRecord', () => {
  assert.equal(isRecord({}), true);
  assert.equal(isRecord({ a: 1 }), true);
  assert.equal(isRecord(new Date()), true);
  assert.equal(isRecord([]), false, 'an array is not a record here');
  assert.equal(isRecord(null), false, 'typeof null is "object"');
  assert.equal(isRecord('str'), false);
  assert.equal(isRecord(() => {}), false);
});

test('hasKey', () => {
  assert.equal(hasKey({ id: 1 }, 'id'), true);
  assert.equal(hasKey({ id: undefined }, 'id'), true, 'present but undefined is present');
  assert.equal(hasKey({}, 'id'), false);
  assert.equal(hasKey(null, 'id'), false);
  assert.equal(hasKey('str', 'length'), false, 'not a record');
});

test('isArrayOf', () => {
  assert.equal(isArrayOf(['a', 'b'], isString), true);
  assert.equal(isArrayOf([], isString), true, 'vacuously true');
  assert.equal(isArrayOf(['a', 1], isString), false);
  assert.equal(isArrayOf([1, 2], isNumber), true);
  assert.equal(isArrayOf('ab', isString), false, 'a string is not an array');
  assert.equal(isArrayOf(null, isString), false);
});

test('compact', () => {
  assert.deepEqual(compact(['a', null, 'b', undefined]), ['a', 'b']);
  assert.deepEqual(compact([null, undefined]), []);
  assert.deepEqual(compact([]), []);
});

test('compact keeps falsy values that are not nullish', () => {
  assert.deepEqual(compact([0, null, '', false]), [0, '', false]);
});
