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

const { callWith, applyWith, bindWith } = solution;

const whoAmI = function () { return this?.name; };
const greet = function (greeting, name) { return `${greeting}, ${name}`; };

/* ---------------------------- STAGE 1 ---------------------------- */

test('callWith: sets this', () => {
  assert.equal(callWith(whoAmI, { name: 'Ada' }), 'Ada');
});

test('callWith: passes arguments', () => {
  assert.equal(callWith(greet, null, 'Hi', 'Ada'), 'Hi, Ada');
});

test('callWith: leaves the object untouched', () => {
  const obj = { name: 'Ada' };
  callWith(whoAmI, obj);
  assert.deepEqual(Object.keys(obj), ['name'], 'no leftover property');
  assert.equal(Object.getOwnPropertySymbols(obj).length, 0, 'no leftover symbol key');
});

test('callWith: does not clobber an existing property', () => {
  const obj = { name: 'Ada', temp: 'precious' };
  callWith(whoAmI, obj);
  assert.equal(obj.temp, 'precious', 'use a Symbol key, not a fixed name');
});

test('callWith: nullish thisArg means globalThis', () => {
  const readThis = function () { return this; };
  assert.equal(callWith(readThis, null), globalThis);
  assert.equal(callWith(readThis, undefined), globalThis);
});

test('callWith: returns whatever fn returns, including undefined', () => {
  assert.equal(callWith(() => undefined, {}), undefined);
  assert.equal(callWith(() => 0, {}), 0);
});

test('applyWith: arguments as an array', () => {
  assert.equal(applyWith(greet, null, ['Hi', 'Ada']), 'Hi, Ada');
  assert.equal(applyWith(whoAmI, { name: 'Grace' }, []), 'Grace');
});

test('applyWith: a missing array means no arguments', () => {
  assert.equal(applyWith(whoAmI, { name: 'Ada' }), 'Ada');
  assert.equal(applyWith(whoAmI, { name: 'Ada' }, null), 'Ada');
});

test('applyWith: leaves the object untouched', () => {
  const obj = { name: 'Ada' };
  applyWith(whoAmI, obj, []);
  assert.deepEqual(Object.keys(obj), ['name']);
});

test('bindWith: returns a new function, does not call yet', () => {
  let called = false;
  const bound = bindWith(() => { called = true; }, null);
  assert.equal(typeof bound, 'function');
  assert.equal(called, false, 'bind must not invoke fn');
  bound();
  assert.equal(called, true);
});

test('bindWith: binds this', () => {
  assert.equal(bindWith(whoAmI, { name: 'Ada' })(), 'Ada');
});

test('bindWith: preset arguments come first', () => {
  assert.equal(bindWith(greet, null, 'Hi')('Ada'), 'Hi, Ada');
  assert.equal(bindWith(greet, null, 'Hi', 'Ada')(), 'Hi, Ada');
  assert.equal(bindWith(greet, null)('Hi', 'Ada'), 'Hi, Ada');
});

test('bindWith: a bound function cannot be rebound', () => {
  const bound = bindWith(whoAmI, { name: 'first' });
  assert.equal(bound.call({ name: 'second' }), 'first');
});

test('bindWith: survives being passed as a callback', () => {
  const user = { name: 'Ada', greet() { return `Hi, ${this.name}`; } };
  const bound = bindWith(user.greet, user);
  assert.deepEqual([1].map(() => bound()), ['Hi, Ada']);
});

/* ---------------------------- STAGE 2 ---------------------------- */

test('myCall: defined on Function.prototype', () => {
  assert.equal(typeof whoAmI.myCall, 'function', 'define Function.prototype.myCall');
});

test('myCall: this is the function it was called on', () => {
  assert.equal(whoAmI.myCall({ name: 'Ada' }), 'Ada');
  assert.equal(greet.myCall(null, 'Hi', 'Ada'), 'Hi, Ada');
});

test('myCall: leaves the object untouched', () => {
  const obj = { name: 'Ada', temp: 'precious' };
  whoAmI.myCall(obj);
  assert.deepEqual(Object.keys(obj), ['name', 'temp']);
  assert.equal(obj.temp, 'precious');
});

test('myApply: arguments as an array', () => {
  assert.equal(greet.myApply(null, ['Hi', 'Ada']), 'Hi, Ada');
  assert.equal(whoAmI.myApply({ name: 'Grace' }), 'Grace');
});

test('myBind: binds this and preset arguments', () => {
  assert.equal(whoAmI.myBind({ name: 'Ada' })(), 'Ada');
  assert.equal(greet.myBind(null, 'Hi')('Ada'), 'Hi, Ada');
});

test('myBind: cannot be rebound', () => {
  assert.equal(whoAmI.myBind({ name: 'first' }).call({ name: 'second' }), 'first');
});

test('prototype methods are non-enumerable', () => {
  const keys = [];
  // eslint-disable-next-line guard-for-in
  for (const key in function () {}) keys.push(key);
  assert.deepEqual(
    keys,
    [],
    'use Object.defineProperty with enumerable: false — otherwise every ' +
      'for...in over a function in the whole program sees your methods',
  );
});

test('the real call, apply and bind still work', () => {
  assert.equal(whoAmI.call({ name: 'Ada' }), 'Ada');
  assert.equal(greet.apply(null, ['Hi', 'Ada']), 'Hi, Ada');
  assert.equal(whoAmI.bind({ name: 'Ada' })(), 'Ada', 'do not overwrite the built-ins');
});
