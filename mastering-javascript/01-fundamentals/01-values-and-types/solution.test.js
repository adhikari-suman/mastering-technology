import test from 'node:test';
import assert from 'node:assert/strict';
import * as solution from './solution.js';

// Pulled off the namespace rather than destructured in the import itself:
// a blank solution.js then shows up as readable per-test failures instead
// of one module-load crash.
const {
  typeOf,
  toNumber,
  isReallyNaN,
  describeNumber,
  formatIntro,
  almostEqual,
} = solution;

test('typeOf: reports the seven primitives', () => {
  assert.equal(typeOf('hi'), 'string');
  assert.equal(typeOf(42), 'number');
  assert.equal(typeOf(true), 'boolean');
  assert.equal(typeOf(undefined), 'undefined');
  assert.equal(typeOf(10n), 'bigint');
  assert.equal(typeOf(Symbol('id')), 'symbol');
});

test('typeOf: fixes the null bug', () => {
  assert.equal(typeOf(null), 'null');
});

test('typeOf: distinguishes arrays from plain objects', () => {
  assert.equal(typeOf([]), 'array');
  assert.equal(typeOf([1, 2, 3]), 'array');
  assert.equal(typeOf({}), 'object');
  assert.equal(typeOf(new Date()), 'object');
});

test('typeOf: functions are functions', () => {
  assert.equal(typeOf(() => {}), 'function');
});

test('toNumber: converts what it can', () => {
  assert.equal(toNumber('42'), 42);
  assert.equal(toNumber('3.5'), 3.5);
  assert.equal(toNumber(true), 1);
  assert.equal(toNumber(false), 0);
  assert.equal(toNumber(''), 0);
  assert.equal(toNumber(null), 0);
});

test('toNumber: returns null instead of leaking NaN', () => {
  assert.equal(toNumber('42abc'), null);
  assert.equal(toNumber('hello'), null);
  assert.equal(toNumber(undefined), null);
  assert.equal(toNumber({}), null);
});

test('isReallyNaN: only true for the actual NaN value', () => {
  assert.equal(isReallyNaN(NaN), true);
  assert.equal(isReallyNaN(0 / 0), true);
  assert.equal(isReallyNaN('hello'), false);
  assert.equal(isReallyNaN(undefined), false);
  assert.equal(isReallyNaN(42), false);
});

test('describeNumber: classifies', () => {
  assert.equal(describeNumber(42), 'integer');
  assert.equal(describeNumber(-7), 'integer');
  assert.equal(describeNumber(0), 'integer');
  assert.equal(describeNumber(3.14), 'float');
  assert.equal(describeNumber(Infinity), 'infinite');
  assert.equal(describeNumber(-Infinity), 'infinite');
  assert.equal(describeNumber(NaN), 'not a number');
  assert.equal(describeNumber('42'), 'not a number');
});

test('formatIntro: builds the sentence', () => {
  assert.equal(formatIntro('Ada', 36), 'Ada is 36 years old.');
  assert.equal(formatIntro('Grace', 1), 'Grace is 1 years old.');
});

test('almostEqual: survives floating point', () => {
  assert.equal(almostEqual(0.1 + 0.2, 0.3), true);
  assert.equal(0.1 + 0.2 === 0.3, false, 'sanity check: === really does fail');
  assert.equal(almostEqual(1, 1), true);
  assert.equal(almostEqual(0.1, 0.2), false);
  assert.equal(almostEqual(1, 1.5, 1), true, 'a big epsilon should be permissive');
});
