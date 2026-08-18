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

const { chainOf, ownKeys, allKeys, findOwner, hasOwnSafe, depthOf } = solution;

const grandparent = { g: 'g' };
const parent = Object.create(grandparent);
parent.p = 'p';
const child = Object.create(parent);
child.c = 'c';

test('chainOf: a plain object ends at Object.prototype', () => {
  assert.deepEqual(chainOf({}), [Object.prototype]);
});

test('chainOf: follows every link', () => {
  assert.deepEqual(chainOf(child), [parent, grandparent, Object.prototype]);
});

test('chainOf: a null-prototype object has no chain', () => {
  assert.deepEqual(chainOf(Object.create(null)), []);
});

test('chainOf: arrays go through Array.prototype', () => {
  assert.deepEqual(chainOf([]), [Array.prototype, Object.prototype]);
});

test('ownKeys: own enumerable only', () => {
  assert.deepEqual(ownKeys(child), ['c']);
  assert.deepEqual(ownKeys(parent), ['p']);
  assert.deepEqual(ownKeys({}), []);
});

test('allKeys: own first, then inherited', () => {
  assert.deepEqual(allKeys(child), ['c', 'p', 'g']);
});

test('allKeys: no duplicates when a key is shadowed', () => {
  const shadow = Object.create({ x: 1 });
  shadow.x = 2;
  assert.deepEqual(allKeys(shadow), ['x']);
});

test('allKeys: Object.prototype contributes nothing', () => {
  assert.deepEqual(allKeys({ a: 1 }), ['a']);
});

test('findOwner: own properties belong to the object itself', () => {
  assert.equal(findOwner(child, 'c'), child);
});

test('findOwner: inherited properties resolve up the chain', () => {
  assert.equal(findOwner(child, 'p'), parent);
  assert.equal(findOwner(child, 'g'), grandparent);
});

test('findOwner: missing keys give null', () => {
  assert.equal(findOwner(child, 'nope'), null);
});

test('findOwner: finds things living on Object.prototype', () => {
  assert.equal(findOwner({}, 'hasOwnProperty'), Object.prototype);
});

test('hasOwnSafe: normal objects', () => {
  assert.equal(hasOwnSafe(child, 'c'), true);
  assert.equal(hasOwnSafe(child, 'p'), false, 'inherited is not own');
  assert.equal(hasOwnSafe(child, 'nope'), false);
});

test('hasOwnSafe: survives a null-prototype object', () => {
  const bare = Object.create(null);
  bare.a = 1;
  assert.equal(hasOwnSafe(bare, 'a'), true);
  assert.equal(hasOwnSafe(bare, 'b'), false);
});

test('depthOf: counts the links', () => {
  assert.equal(depthOf(child, 'c'), 0);
  assert.equal(depthOf(child, 'p'), 1);
  assert.equal(depthOf(child, 'g'), 2);
  assert.equal(depthOf(child, 'nope'), -1);
});

test('depthOf: shadowing wins at depth 0', () => {
  const shadow = Object.create({ x: 1 });
  shadow.x = 2;
  assert.equal(depthOf(shadow, 'x'), 0);
});
