import test from 'node:test';
import assert from 'node:assert/strict';
import * as solution from './solution.js';

const { Dog, Vault, Temperature, Registry, Bound, methodIsEnumerable } = solution;

test('Dog: constructs and speaks', () => {
  assert.equal(typeof Dog, 'function', 'export a class named Dog');
  assert.equal(new Dog('Rex').name, 'Rex');
  assert.equal(new Dog('Rex').speak(), 'Rex barks');
});

test('Dog: speak is shared', () => {
  assert.equal(new Dog('a').speak, new Dog('b').speak);
});

test('Dog: refuses to be called without new', () => {
  assert.throws(() => Dog('Rex'), TypeError);
});

test('Vault: deposits and withdrawals', () => {
  const v = new Vault(100);
  assert.equal(v.getBalance(), 100);
  assert.equal(v.deposit(50), 150);
  assert.equal(v.withdraw(30), 120);
});

test('Vault: refuses to overdraw', () => {
  const v = new Vault(10);
  assert.equal(v.withdraw(11), null);
  assert.equal(v.getBalance(), 10);
});

test('Vault: the balance is invisible from outside', () => {
  const v = new Vault(100);
  assert.deepEqual(Object.keys(v), [], 'a #private field is not an own key');
  assert.equal(JSON.stringify(v), '{}');
  assert.deepEqual(Object.getOwnPropertyNames(v), []);
});

test('Vault: instances are independent', () => {
  const a = new Vault(100);
  const b = new Vault(100);
  a.withdraw(100);
  assert.equal(b.getBalance(), 100);
});

test('Temperature: getter converts', () => {
  assert.equal(new Temperature(100).fahrenheit, 212);
  assert.equal(new Temperature(0).fahrenheit, 32);
  assert.equal(new Temperature(37).celsius, 37);
});

test('Temperature: setter converts back', () => {
  const t = new Temperature(100);
  t.fahrenheit = 32;
  assert.equal(t.celsius, 0);
  t.fahrenheit = 212;
  assert.equal(t.celsius, 100);
});

test('Temperature: fahrenheit is an accessor, not a stored value', () => {
  const descriptor = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(new Temperature(0)),
    'fahrenheit',
  );
  assert.ok(descriptor?.get, 'define fahrenheit with get/set, not as a field');
});

test('Registry: counts instances', () => {
  Registry.reset();
  assert.equal(Registry.count, 0);
  new Registry();
  new Registry();
  assert.equal(Registry.count, 2);
});

test('Registry: reset clears it', () => {
  Registry.reset();
  new Registry();
  Registry.reset();
  assert.equal(Registry.count, 0);
});

test('Registry: count lives on the class, not the instance', () => {
  Registry.reset();
  const r = new Registry();
  assert.equal(Object.hasOwn(r, 'count'), false);
});

test('Bound: survives detachment', () => {
  const b = new Bound();
  const fn = b.increment;
  fn();
  fn();
  assert.equal(b.count, 2);
});

test('Bound: instances stay independent', () => {
  const a = new Bound();
  const b = new Bound();
  a.increment();
  assert.equal(b.count, 0);
});

test('methodIsEnumerable: class methods are not enumerable', () => {
  assert.equal(methodIsEnumerable(Dog, 'speak'), false);
});

test('methodIsEnumerable: prototype assignment IS enumerable', () => {
  function Old() {}
  Old.prototype.hi = () => 'hi';
  assert.equal(methodIsEnumerable(Old, 'hi'), true, 'this is the leak class fixes');
});

test('methodIsEnumerable: a missing method is not enumerable either', () => {
  assert.equal(methodIsEnumerable(Dog, 'nope'), false);
});
