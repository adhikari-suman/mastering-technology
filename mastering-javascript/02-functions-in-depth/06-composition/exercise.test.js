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

const { identity, pipe, compose, tap, juxt, complement } = solution;

const shout = (s) => s.toUpperCase();
const exclaim = (s) => `${s}!`;
const double = (n) => n * 2;
const increment = (n) => n + 1;

test('identity', () => {
  assert.equal(identity(5), 5);
  assert.equal(identity('a'), 'a');
  assert.equal(identity(null), null);
  const obj = {};
  assert.equal(identity(obj), obj, 'the same reference, not a copy');
});

test('pipe: left to right', () => {
  assert.equal(pipe(shout, exclaim)('hi'), 'HI!');
  assert.equal(pipe(increment, double)(5), 12, 'increment first, then double');
});

test('pipe: one function, and none at all', () => {
  assert.equal(pipe(double)(5), 10);
  assert.equal(pipe()(5), 5, 'an empty pipe is the identity');
});

test('pipe: order really is left to right', () => {
  const order = [];
  pipe(
    (x) => { order.push('first'); return x; },
    (x) => { order.push('second'); return x; },
  )(0);
  assert.deepEqual(order, ['first', 'second']);
});

test('compose: right to left', () => {
  assert.equal(compose(exclaim, shout)('hi'), 'HI!');
  assert.equal(compose(double, increment)(5), 12, 'increment first, then double');
});

test('compose: one function, and none at all', () => {
  assert.equal(compose(double)(5), 10);
  assert.equal(compose()(5), 5);
});

test('compose: the same composition can be called repeatedly', () => {
  // Guards against reversing the array in place inside the returned function,
  // which flips the pipeline on every other call. The two functions must not
  // commute, or the bug is invisible.
  const f = compose(double, increment);
  assert.deepEqual([f(5), f(5), f(5)], [12, 12, 12], 'compose must not mutate fns');
});

test('pipe: the same composition can be called repeatedly', () => {
  const f = pipe(double, increment);
  assert.deepEqual([f(5), f(5), f(5)], [11, 11, 11]);
});

test('compose is pipe reversed', () => {
  const fns = [increment, double, increment];
  assert.equal(compose(...fns)(3), pipe(...[...fns].reverse())(3));
});

test('tap: passes the value through', () => {
  assert.equal(tap(() => 'ignored')(5), 5, "tap must return the value, not fn's result");
});

test('tap: runs the side effect', () => {
  const seen = [];
  const result = pipe(tap((v) => seen.push(v)), double)(5);
  assert.equal(result, 10);
  assert.deepEqual(seen, [5]);
});

test('juxt: applies every function to one input', () => {
  assert.deepEqual(juxt(increment, double)(5), [6, 10]);
  assert.deepEqual(juxt(identity)(5), [5]);
  assert.deepEqual(juxt()(5), []);
});

test('juxt: keeps the given order', () => {
  assert.deepEqual(juxt(double, increment, identity)(3), [6, 4, 3]);
});

test('complement: negates a predicate', () => {
  const isEven = (n) => n % 2 === 0;
  assert.equal(complement(isEven)(3), true);
  assert.equal(complement(isEven)(4), false);
});

test('complement: forwards all arguments and coerces to a boolean', () => {
  const bothTruthy = (a, b) => a && b;
  assert.equal(complement(bothTruthy)(1, 0), true);
  assert.equal(complement(bothTruthy)(1, 1), false);
  assert.equal(complement(() => 0)(), true, 'a falsy return means true');
});

test('the pieces work together', () => {
  const slugify = pipe(
    (s) => s.trim(),
    (s) => s.toLowerCase(),
    (s) => s.replace(/\s+/g, '-'),
  );
  assert.equal(slugify('  Hello There World '), 'hello-there-world');
});
