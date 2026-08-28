import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { userId, postId, positive, divide, nonEmpty, firstOf } from './solution.ts';
import type { Brand, UserId, PostId, Positive, NonEmptyArray } from './solution.ts';

/* ------------------------------------------------------------------ types */

function _typeOnly(u: UserId, p: PostId, n: Positive, xs: NonEmptyArray<string>) {
  // A brand is still its base type, so everything that worked on a string works.
  const asString: string = u;
  const upper: string = u.toUpperCase();
  const asNumber: number = n;

  // @ts-expect-error - but a plain string is not a UserId
  const bad: UserId = 'u_1';

  // @ts-expect-error - and one brand is not another, even over the same base
  const crossed: UserId = p;

  // @ts-expect-error - nor the reverse
  const crossedBack: PostId = u;

  // @ts-expect-error - a plain number is not Positive, however positive it is
  divide(1, 2);

  // The branded one is fine, with no runtime check anywhere.
  divide(1, n);

  // @ts-expect-error - a plain array is not NonEmptyArray
  firstOf(['a']);

  // The branded array's first element is a T, not a T | undefined.
  const first = firstOf(xs);
  type _First = Expect<Equal<typeof first, string>>;

  // The constructors are the only way in.
  const madeUser: UserId = userId('u_1');
  const madePositive: Positive = positive(1);
  const madeArray: NonEmptyArray<number> = nonEmpty([1]);
}

// A brand erases: the runtime value really is the base type.
type _ErasesToString = Expect<Equal<UserId extends string ? true : false, true>>;
type _ErasesToNumber = Expect<Equal<Positive extends number ? true : false, true>>;
type _NotAssignableBack = Expect<Equal<string extends UserId ? true : false, false>>;

/* ---------------------------------------------------------------- runtime */

test('userId accepts the right shape', () => {
  assert.equal(userId('u_1'), 'u_1');
  assert.equal(userId('u_12345'), 'u_12345');
});

test('userId rejects everything else', () => {
  assert.throws(() => userId('p_1'), TypeError);
  assert.throws(() => userId('u_'), TypeError);
  assert.throws(() => userId('u_abc'), TypeError);
  assert.throws(() => userId(''), TypeError);
  assert.throws(() => userId('1'), TypeError);
  assert.throws(() => userId('u_1'.toUpperCase()), TypeError);
});

test('userId names the value it rejected', () => {
  assert.throws(() => userId('nope'), { message: 'bad user id: nope' });
  assert.throws(() => postId('nope'), { message: 'bad post id: nope' });
});

test('postId', () => {
  assert.equal(postId('p_9'), 'p_9');
  assert.throws(() => postId('u_9'), TypeError);
});

test('a brand is genuinely the base value at runtime', () => {
  const id = userId('u_1');
  assert.equal(typeof id, 'string');
  assert.equal(id, 'u_1');
  assert.equal(JSON.stringify({ id }), '{"id":"u_1"}');
  assert.deepEqual(Object.getOwnPropertySymbols(Object(id)), [], 'no brand symbol at runtime');
});

test('positive', () => {
  assert.equal(positive(1), 1);
  assert.equal(positive(0.5), 0.5);
  assert.equal(positive(Infinity), Infinity);
});

test('positive rejects zero, negatives and NaN', () => {
  assert.throws(() => positive(0), RangeError);
  assert.throws(() => positive(-1), RangeError);
  assert.throws(() => positive(NaN), RangeError);
  assert.throws(() => positive(-0), RangeError);
});

test('positive names the value', () => {
  assert.throws(() => positive(0), { message: 'not positive: 0' });
});

test('divide', () => {
  assert.equal(divide(10, positive(2)), 5);
  assert.equal(divide(0, positive(2)), 0);
  assert.equal(divide(-10, positive(4)), -2.5);
});

test('nonEmpty and firstOf', () => {
  assert.deepEqual(nonEmpty([1, 2]), [1, 2]);
  assert.equal(firstOf(nonEmpty([1, 2])), 1);
  assert.equal(firstOf(nonEmpty(['only'])), 'only');
});

test('nonEmpty rejects an empty array', () => {
  assert.throws(() => nonEmpty([]), RangeError);
  assert.throws(() => nonEmpty([]), { message: 'array is empty' });
});

test('nonEmpty returns the same array, not a copy', () => {
  const values = [1, 2];
  assert.equal(nonEmpty(values), values);
});

test('firstOf on an array whose first element is falsy', () => {
  assert.equal(firstOf(nonEmpty([0, 1])), 0);
  assert.equal(firstOf(nonEmpty([undefined, 1])), undefined);
});
