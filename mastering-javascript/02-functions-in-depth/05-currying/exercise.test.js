import test from 'node:test';
import assert from 'node:assert/strict';

// Your answers live in solution.js, which you create yourself:
//     cp exercise.js solution.js
//
// It is loaded leniently so that a missing file surfaces as one clear
// failure instead of a module-load crash that hides every other test.
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

const { curry, curryN, partial, partialRight, unary, flip } = solution;

const add3 = (a, b, c) => a + b + c;
const greet = (greeting, name) => `${greeting}, ${name}`;

test('curry: one argument at a time', () => {
  assert.equal(curry(add3)(1)(2)(3), 6);
});

test('curry: several at a time', () => {
  assert.equal(curry(add3)(1, 2)(3), 6);
  assert.equal(curry(add3)(1)(2, 3), 6);
  assert.equal(curry(add3)(1, 2, 3), 6);
});

test('curry: partial applications are reusable and independent', () => {
  const curried = curry(add3);
  const addOneTwo = curried(1, 2);
  assert.equal(addOneTwo(3), 6);
  assert.equal(addOneTwo(10), 13, 'a partial must not be consumed by one use');
});

test('curry: a one-argument function still works', () => {
  assert.equal(curry((n) => n * 2)(5), 10);
});

test('curryN: arity stated explicitly', () => {
  const variadic = (...args) => args.reduce((a, b) => a + b, 0);
  assert.equal(curryN(3, variadic)(1)(2)(3), 6);
  assert.equal(curryN(2, variadic)(1)(2), 3);
});

test('curryN: beats fn.length when defaults would lie', () => {
  const withDefault = (a, b = 10) => a + b;
  assert.equal(withDefault.length, 1, 'sanity: defaults stop the arity count');
  assert.equal(curryN(2, withDefault)(1)(2), 3);
});

test('partial: fixes leading arguments', () => {
  assert.equal(partial(greet, 'Hi')('Ada'), 'Hi, Ada');
  assert.equal(partial(add3, 1)(2, 3), 6);
  assert.equal(partial(add3, 1, 2)(3), 6);
});

test('partial: with no preset arguments it just forwards', () => {
  assert.equal(partial(greet)('Hi', 'Ada'), 'Hi, Ada');
});

test('partial: is reusable', () => {
  const hi = partial(greet, 'Hi');
  assert.equal(hi('Ada'), 'Hi, Ada');
  assert.equal(hi('Grace'), 'Hi, Grace');
});

test('partialRight: fixes trailing arguments', () => {
  assert.equal(partialRight(greet, 'Ada')('Hi'), 'Hi, Ada');
  assert.equal(partialRight(add3, 3)(1, 2), 6);
  assert.equal(partialRight(add3, 2, 3)(1), 6);
});

test('unary: drops extra arguments', () => {
  assert.equal(unary((...args) => args.length)(1, 2, 3), 1);
  assert.equal(unary(parseInt)('2', 1), 2);
});

test('unary: fixes the classic map(parseInt) bug', () => {
  assert.deepEqual(['1', '2', '3'].map(parseInt), [1, NaN, NaN], 'sanity check');
  assert.deepEqual(['1', '2', '3'].map(unary(parseInt)), [1, 2, 3]);
});

test('flip: swaps the first two arguments', () => {
  assert.equal(flip((a, b) => a / b)(2, 10), 5);
  assert.equal(flip(greet)('Ada', 'Hi'), 'Hi, Ada');
});

test('flip: leaves later arguments alone', () => {
  assert.deepEqual(flip((a, b, c) => [a, b, c])(1, 2, 3), [2, 1, 3]);
});
