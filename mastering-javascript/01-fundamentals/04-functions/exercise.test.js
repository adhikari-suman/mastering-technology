import test from 'node:test';
import assert from 'node:assert/strict';
import * as ex from './exercise.js';

test('square: exists and squares', () => {
  assert.equal(typeof ex.square, 'function', 'export a function named square');
  assert.equal(ex.square(4), 16);
  assert.equal(ex.square(0), 0);
  assert.equal(ex.square(-3), 9);
});

test('cube: exists and cubes', () => {
  assert.equal(typeof ex.cube, 'function', 'export a function named cube');
  assert.equal(ex.cube(3), 27);
  assert.equal(ex.cube(-2), -8);
});

test('double: exists and doubles', () => {
  assert.equal(typeof ex.double, 'function', 'export a function named double');
  assert.equal(ex.double(5), 10);
  assert.equal(ex.double(-1), -2);
});

test('makeGreeting: uses the default greeting', () => {
  assert.equal(ex.makeGreeting('Ada'), 'Hello, Ada!');
});

test('makeGreeting: accepts an override', () => {
  assert.equal(ex.makeGreeting('Ada', 'Howdy'), 'Howdy, Ada!');
});

test('makeGreeting: undefined falls back to the default', () => {
  assert.equal(ex.makeGreeting('Ada', undefined), 'Hello, Ada!');
});

test('sumAll: any number of arguments', () => {
  assert.equal(ex.sumAll(1, 2, 3), 6);
  assert.equal(ex.sumAll(42), 42);
  assert.equal(ex.sumAll(), 0);
  assert.equal(ex.sumAll(1, -1, 5, -5), 0);
});

test('applyTwice: applies the function twice', () => {
  assert.equal(ex.applyTwice((n) => n + 3, 1), 7);
  assert.equal(ex.applyTwice((n) => n * 2, 3), 12);
  assert.equal(ex.applyTwice((s) => s + '!', 'hi'), 'hi!!');
});

test('makeAdder: returns a function', () => {
  const add5 = ex.makeAdder(5);
  assert.equal(typeof add5, 'function');
  assert.equal(add5(10), 15);
  assert.equal(add5(0), 5);
});

test('makeAdder: adders are independent', () => {
  const add1 = ex.makeAdder(1);
  const add100 = ex.makeAdder(100);
  assert.equal(add1(10), 11);
  assert.equal(add100(10), 110);
});

test('makeCounter: counts from 1', () => {
  const next = ex.makeCounter();
  assert.equal(next(), 1);
  assert.equal(next(), 2);
  assert.equal(next(), 3);
});

test('makeCounter: each counter has its own state', () => {
  const a = ex.makeCounter();
  const b = ex.makeCounter();
  a();
  a();
  assert.equal(a(), 3);
  assert.equal(b(), 1, 'b must not see any of the calls made to a');
});

test('makePoint: implicit object return', () => {
  assert.equal(typeof ex.makePoint, 'function', 'export a function named makePoint');
  assert.deepEqual(ex.makePoint(1, 2), { x: 1, y: 2 });
  assert.deepEqual(ex.makePoint(0, 0), { x: 0, y: 0 });
});
