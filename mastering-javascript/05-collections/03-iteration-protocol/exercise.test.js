import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

let solution = {};
let loadError = null;
try {
  solution = await import('./solution.js');
} catch (err) {
  loadError = err;
}

test('solution.js exists', () => {
  assert.equal(loadError, null, 'Create it first:  cp exercise.js solution.js');
});

const { makeRange, toIterator, take, zip, enumerate, isIterable, counter } = solution;

test('makeRange: spreads', () => {
  assert.deepEqual([...makeRange(0, 3)], [0, 1, 2]);
  assert.deepEqual([...makeRange(0, 6, 2)], [0, 2, 4]);
  assert.deepEqual([...makeRange(3, 0)], []);
  assert.deepEqual([...makeRange(0, 0)], []);
});

test('makeRange: works with for...of', () => {
  const seen = [];
  for (const n of makeRange(1, 4)) seen.push(n);
  assert.deepEqual(seen, [1, 2, 3]);
});

test('makeRange: is RE-iterable', () => {
  const range = makeRange(0, 3);
  assert.deepEqual([...range], [0, 1, 2]);
  assert.deepEqual([...range], [0, 1, 2], '[Symbol.iterator] must return a fresh iterator');
});

test('makeRange: destructuring and Array.from', () => {
  const [first, second] = makeRange(10, 20);
  assert.equal(first, 10);
  assert.equal(second, 11);
  assert.deepEqual(Array.from(makeRange(0, 3)), [0, 1, 2]);
});

test('toIterator: yields the protocol shape', () => {
  const it = toIterator([1, 2]);
  assert.deepEqual(it.next(), { value: 1, done: false });
  assert.deepEqual(it.next(), { value: 2, done: false });
  assert.equal(it.next().done, true);
});

test('take: pulls a prefix', () => {
  assert.deepEqual(take([1, 2, 3, 4], 2), [1, 2]);
  assert.deepEqual(take([1, 2], 5), [1, 2], 'stop early if it runs out');
  assert.deepEqual(take([1, 2], 0), []);
});

test('take: works on an infinite iterable', () => {
  const naturals = {
    [Symbol.iterator]() {
      let n = 0;
      return { next: () => ({ value: n++, done: false }) };
    },
  };
  assert.deepEqual(take(naturals, 4), [0, 1, 2, 3]);
});

test('zip: stops at the shorter', () => {
  assert.deepEqual(zip([1, 2, 3], 'ab'), [[1, 'a'], [2, 'b']]);
  assert.deepEqual(zip([], [1]), []);
  assert.deepEqual(zip([1, 2], [3, 4]), [[1, 3], [2, 4]]);
});

test('zip: works with Sets and Maps', () => {
  assert.deepEqual(zip(new Set([1, 2]), 'ab'), [[1, 'a'], [2, 'b']]);
});

test('enumerate', () => {
  assert.deepEqual(enumerate('ab'), [[0, 'a'], [1, 'b']]);
  assert.deepEqual(enumerate([]), []);
  assert.deepEqual(enumerate(new Set(['x'])), [[0, 'x']]);
});

test('isIterable', () => {
  assert.equal(isIterable([]), true);
  assert.equal(isIterable('str'), true);
  assert.equal(isIterable(new Map()), true);
  assert.equal(isIterable(new Set()), true);
  assert.equal(isIterable({}), false);
  assert.equal(isIterable(1), false);
  assert.equal(isIterable(null), false);
  assert.equal(isIterable(undefined), false);
});

test('counter: is an iterator', () => {
  const c = counter();
  assert.equal(c.next().value, 0);
  assert.equal(c.next().value, 1);
});

test('counter: is also iterable, and shares position', () => {
  const c = counter();
  assert.equal(c.next().value, 0);
  assert.deepEqual(take(c, 2), [1, 2], 'iterating continues where next() left off');
});

test('counter: instances are independent', () => {
  const a = counter();
  const b = counter();
  a.next(); a.next();
  assert.equal(b.next().value, 0);
});

test('no generators — write the protocol by hand', () => {
  const source = readFileSync(new URL('./solution.js', import.meta.url), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '');
  assert.ok(!/function\s*\*/.test(source), 'generators are lesson 04');
  assert.ok(!/\byield\b/.test(source), 'generators are lesson 04');
});
