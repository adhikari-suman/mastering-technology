import test from 'node:test';
import assert from 'node:assert/strict';
import * as solution from './solution.js';

const { Animal, Dog, legacyInherit, mixin, Bird, ancestryOf, overrides } = solution;

test('Animal: base behaviour', () => {
  assert.equal(typeof Animal, 'function', 'export a class named Animal');
  assert.equal(new Animal('Rex').name, 'Rex');
  assert.equal(new Animal('Rex').speak(), 'Rex makes a sound');
});

test('Dog: super() sets the inherited field', () => {
  const d = new Dog('Rex', 'lab');
  assert.equal(d.name, 'Rex');
  assert.equal(d.breed, 'lab');
});

test('Dog: speak extends rather than replaces', () => {
  assert.equal(new Dog('Rex', 'lab').speak(), 'Rex makes a sound, specifically a bark');
});

test('Dog: is an Animal', () => {
  const d = new Dog('Rex', 'lab');
  assert.ok(d instanceof Dog);
  assert.ok(d instanceof Animal);
});

test('Dog: the prototype chain has both levels', () => {
  assert.equal(Object.getPrototypeOf(Dog.prototype), Animal.prototype);
});

test('legacyInherit: links the prototypes', () => {
  function Parent() {}
  Parent.prototype.hello = () => 'hello';
  function Child() {}
  legacyInherit(Child, Parent);
  assert.equal(new Child().hello(), 'hello');
  assert.ok(new Child() instanceof Parent);
});

test('legacyInherit: restores constructor', () => {
  function Parent() {}
  function Child() {}
  legacyInherit(Child, Parent);
  assert.equal(
    new Child().constructor,
    Child,
    'reassigning the prototype clobbers constructor — put it back',
  );
});

test('legacyInherit: constructor is not enumerable', () => {
  function Parent() {}
  function Child() {}
  legacyInherit(Child, Parent);
  assert.equal(
    Object.keys(Child.prototype).includes('constructor'),
    false,
    'use defineProperty so constructor stays non-enumerable, as it is natively',
  );
});

test('mixin: copies properties and returns the target', () => {
  const target = {};
  const result = mixin(target, { a: 1 }, { b: 2 });
  assert.equal(result, target);
  assert.deepEqual(target, { a: 1, b: 2 });
});

test('mixin: later sources win', () => {
  assert.deepEqual(mixin({}, { a: 1 }, { a: 2 }), { a: 2 });
});

test('mixin: methods keep working with this', () => {
  const obj = mixin({ name: 'Ada' }, { greet() { return `Hi, ${this.name}`; } });
  assert.equal(obj.greet(), 'Hi, Ada');
});

test('Bird: inherits speak and mixes in fly', () => {
  const b = new Bird('Tweety');
  assert.equal(b.speak(), 'Tweety makes a sound');
  assert.equal(b.fly(), 'Tweety flies');
  assert.ok(b instanceof Animal);
});

test('ancestryOf', () => {
  assert.deepEqual(ancestryOf(Dog), [Animal]);
  assert.deepEqual(ancestryOf(Bird), [Animal]);
  assert.deepEqual(ancestryOf(Animal), []);
});

test('overrides: true only when it genuinely replaces', () => {
  assert.equal(overrides(Dog, 'speak'), true);
  assert.equal(overrides(Bird, 'speak'), false, 'Bird inherits speak untouched');
  assert.equal(overrides(Dog, 'nope'), false);
  assert.equal(overrides(Animal, 'speak'), false, 'nothing above it defines speak');
});
