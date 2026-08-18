import test from 'node:test';
import assert from 'node:assert/strict';

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

const { Dog, construct, isInstanceOf, sharesMethod, makeCounterCtor, constructorOf } = solution;

test('Dog: sets its own property', () => {
  assert.equal(new Dog('Rex').name, 'Rex');
});

test('Dog: speak works', () => {
  assert.equal(new Dog('Rex').speak(), 'Rex barks');
});

test('Dog: speak lives on the prototype, shared by all instances', () => {
  assert.equal(
    new Dog('a').speak,
    new Dog('b').speak,
    'put speak on Dog.prototype, not on `this` inside the constructor',
  );
  assert.equal(Object.hasOwn(new Dog('a'), 'speak'), false);
});

test('construct: builds a working instance without `new`', () => {
  const rex = construct(Dog, 'Rex');
  assert.equal(rex.name, 'Rex');
  assert.equal(rex.speak(), 'Rex barks');
});

test('construct: links the prototype', () => {
  assert.equal(Object.getPrototypeOf(construct(Dog, 'a')), Dog.prototype);
  assert.ok(construct(Dog, 'a') instanceof Dog);
});

test('construct: an explicitly returned object wins', () => {
  function Weird() {
    this.ignored = true;
    return { chosen: true };
  }
  assert.deepEqual(construct(Weird), { chosen: true });
});

test('construct: a returned primitive is ignored', () => {
  function Primitive() {
    this.kept = true;
    return 42;
  }
  assert.equal(construct(Primitive).kept, true, 'only objects override the result');
});

test('isInstanceOf: direct and inherited', () => {
  assert.equal(isInstanceOf(new Dog('a'), Dog), true);
  assert.equal(isInstanceOf(new Dog('a'), Object), true);
  assert.equal(isInstanceOf({}, Dog), false);
  assert.equal(isInstanceOf([], Array), true);
  assert.equal(isInstanceOf([], Object), true);
});

test('isInstanceOf: a null-prototype object is an instance of nothing', () => {
  assert.equal(isInstanceOf(Object.create(null), Object), false);
});

test('isInstanceOf: agrees with the real operator', () => {
  const cases = [[new Dog('a'), Dog], [[], Array], [{}, Array], [new Date(), Date]];
  for (const [obj, Fn] of cases) {
    assert.equal(isInstanceOf(obj, Fn), obj instanceof Fn, `disagreed for ${Fn.name}`);
  }
});

test('sharesMethod: true for prototype methods', () => {
  assert.equal(sharesMethod(new Dog('a'), new Dog('b'), 'speak'), true);
});

test('sharesMethod: false when each instance gets its own copy', () => {
  function PerInstance() {
    this.hi = function () { return 'hi'; };
  }
  assert.equal(sharesMethod(new PerInstance(), new PerInstance(), 'hi'), false);
});

test('makeCounterCtor: the returned object is used', () => {
  const C = makeCounterCtor();
  const c = new C();
  assert.equal(c.count, 0);
  assert.equal(c.increment(), 1);
  assert.equal(c.increment(), 2);
});

test('makeCounterCtor: instances are independent', () => {
  const C = makeCounterCtor();
  const a = new C();
  const b = new C();
  a.increment();
  assert.equal(b.count, 0);
});

test('constructorOf', () => {
  assert.equal(constructorOf(new Dog('a')), Dog);
  assert.equal(constructorOf({}), Object);
  assert.equal(constructorOf([]), Array);
  assert.equal(constructorOf(new Date()), Date);
});
