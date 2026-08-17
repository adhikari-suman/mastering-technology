import test from 'node:test';
import assert from 'node:assert/strict';
import {
  doubleAll,
  evensOnly,
  total,
  findUser,
  sortByAge,
  names,
  merge,
  firstAndRest,
  allPositive,
  chunk,
  tally,
} from './exercise.js';

const USERS = [
  { id: 1, name: 'Ada', age: 36 },
  { id: 2, name: 'Grace', age: 45 },
  { id: 3, name: 'Alan', age: 41 },
];

test('doubleAll', () => {
  assert.deepEqual(doubleAll([1, 2, 3]), [2, 4, 6]);
  assert.deepEqual(doubleAll([]), []);
  assert.deepEqual(doubleAll([-1, 0]), [-2, 0]);
});

test('doubleAll: does not mutate its input', () => {
  const input = [1, 2, 3];
  doubleAll(input);
  assert.deepEqual(input, [1, 2, 3]);
});

test('evensOnly', () => {
  assert.deepEqual(evensOnly([1, 2, 3, 4]), [2, 4]);
  assert.deepEqual(evensOnly([1, 3]), []);
  assert.deepEqual(evensOnly([0, -2]), [0, -2]);
});

test('total', () => {
  assert.equal(total([1, 2, 3]), 6);
  assert.equal(total([]), 0, 'an empty array must not throw');
  assert.equal(total([-5, 5]), 0);
  assert.equal(total([42]), 42);
});

test('findUser', () => {
  assert.deepEqual(findUser(USERS, 2), { id: 2, name: 'Grace', age: 45 });
  assert.equal(findUser(USERS, 99), undefined);
  assert.equal(findUser([], 1), undefined);
});

test('sortByAge: sorts youngest first', () => {
  assert.deepEqual(names(sortByAge(USERS)), ['Ada', 'Alan', 'Grace']);
});

test('sortByAge: leaves the original array alone', () => {
  const input = [...USERS];
  sortByAge(input);
  assert.deepEqual(
    input.map((u) => u.name),
    ['Ada', 'Grace', 'Alan'],
    'sort mutates — copy the array first',
  );
});

test('names', () => {
  assert.deepEqual(names(USERS), ['Ada', 'Grace', 'Alan']);
  assert.deepEqual(names([]), []);
});

test('merge', () => {
  assert.deepEqual(merge([1, 2], [3]), [1, 2, 3]);
  assert.deepEqual(merge([], []), []);
  assert.deepEqual(merge(['a'], ['b', 'c']), ['a', 'b', 'c']);
});

test('merge: does not mutate either input', () => {
  const a = [1];
  const b = [2];
  merge(a, b);
  assert.deepEqual(a, [1]);
  assert.deepEqual(b, [2]);
});

test('firstAndRest', () => {
  assert.deepEqual(firstAndRest([1, 2, 3]), { first: 1, rest: [2, 3] });
  assert.deepEqual(firstAndRest([1]), { first: 1, rest: [] });
  assert.deepEqual(firstAndRest([]), { first: undefined, rest: [] });
});

test('allPositive', () => {
  assert.equal(allPositive([1, 2, 3]), true);
  assert.equal(allPositive([1, -2]), false);
  assert.equal(allPositive([0]), false, 'zero is not positive');
  assert.equal(allPositive([]), true, 'vacuously true');
});

test('chunk', () => {
  assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(chunk([1, 2, 3, 4], 2), [[1, 2], [3, 4]]);
  assert.deepEqual(chunk([1, 2, 3], 5), [[1, 2, 3]]);
  assert.deepEqual(chunk([], 3), []);
  assert.deepEqual(chunk([1, 2, 3], 1), [[1], [2], [3]]);
});

test('tally', () => {
  assert.deepEqual(tally(['a', 'b', 'a']), { a: 2, b: 1 });
  assert.deepEqual(tally([]), {});
  assert.deepEqual(tally(['x']), { x: 1 });
  assert.deepEqual(tally(['a', 'a', 'a']), { a: 3 });
});
