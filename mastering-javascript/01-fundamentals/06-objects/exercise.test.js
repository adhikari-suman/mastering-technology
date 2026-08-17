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

const {
  getProperty,
  fullName,
  deepGet,
  withUpdated,
  omit,
  invert,
  filterValues,
  mergeObjects,
  makeRect,
  deepCopy,
} = solution;

test('getProperty', () => {
  assert.equal(getProperty({ a: 1 }, 'a'), 1);
  assert.equal(getProperty({ 'two words': 5 }, 'two words'), 5);
  assert.equal(getProperty({ a: 1 }, 'missing'), undefined);
  assert.equal(getProperty({}, 'a'), undefined);
});

test('fullName', () => {
  assert.equal(fullName({ first: 'Ada', last: 'Lovelace' }), 'Ada Lovelace');
  assert.equal(fullName({ first: 'Grace', last: 'Hopper', age: 45 }), 'Grace Hopper');
});

test('deepGet: walks the path', () => {
  assert.equal(deepGet({ a: { b: { c: 1 } } }, 'a.b.c'), 1);
  assert.equal(deepGet({ a: 1 }, 'a'), 1);
  assert.deepEqual(deepGet({ a: { b: 2 } }, 'a'), { b: 2 });
});

test('deepGet: never throws on a broken path', () => {
  assert.equal(deepGet({ a: {} }, 'a.b.c'), undefined);
  assert.equal(deepGet({}, 'a.b.c'), undefined);
  assert.equal(deepGet({ a: null }, 'a.b'), undefined);
});

test('withUpdated: adds and overwrites', () => {
  assert.deepEqual(withUpdated({ a: 1 }, 'b', 2), { a: 1, b: 2 });
  assert.deepEqual(withUpdated({ a: 1 }, 'a', 9), { a: 9 });
  assert.deepEqual(withUpdated({}, 'a', 1), { a: 1 });
});

test('withUpdated: does not mutate', () => {
  const original = { a: 1 };
  const updated = withUpdated(original, 'b', 2);
  assert.deepEqual(original, { a: 1 });
  assert.notEqual(updated, original, 'must be a new object');
});

test('omit', () => {
  assert.deepEqual(omit({ a: 1, b: 2 }, 'b'), { a: 1 });
  assert.deepEqual(omit({ a: 1 }, 'missing'), { a: 1 });
  assert.deepEqual(omit({ a: 1 }, 'a'), {});
});

test('omit: does not mutate', () => {
  const original = { a: 1, b: 2 };
  omit(original, 'b');
  assert.deepEqual(original, { a: 1, b: 2 });
});

test('invert', () => {
  assert.deepEqual(invert({ a: '1', b: '2' }), { 1: 'a', 2: 'b' });
  assert.deepEqual(invert({}), {});
  assert.deepEqual(invert({ name: 'Ada' }), { Ada: 'name' });
});

test('filterValues', () => {
  assert.deepEqual(filterValues({ a: 1, b: 5 }, (n) => n > 3), { b: 5 });
  assert.deepEqual(filterValues({ a: 1 }, () => true), { a: 1 });
  assert.deepEqual(filterValues({ a: 1 }, () => false), {});
  assert.deepEqual(filterValues({}, () => true), {});
});

test('mergeObjects: b wins', () => {
  assert.deepEqual(mergeObjects({ a: 1 }, { b: 2 }), { a: 1, b: 2 });
  assert.deepEqual(mergeObjects({ a: 1 }, { a: 9 }), { a: 9 });
  assert.deepEqual(mergeObjects({}, {}), {});
});

test('mergeObjects: does not mutate', () => {
  const a = { a: 1 };
  const b = { b: 2 };
  mergeObjects(a, b);
  assert.deepEqual(a, { a: 1 });
  assert.deepEqual(b, { b: 2 });
});

test('makeRect: has the fields and the method', () => {
  const rect = makeRect(3, 4);
  assert.equal(rect.width, 3);
  assert.equal(rect.height, 4);
  assert.equal(typeof rect.area, 'function');
});

test('makeRect: area() uses this', () => {
  assert.equal(makeRect(3, 4).area(), 12);
  assert.equal(makeRect(5, 5).area(), 25);
  assert.equal(makeRect(0, 10).area(), 0);
});

test('makeRect: the method follows the object it is called on', () => {
  const rect = makeRect(3, 4);
  rect.width = 10;
  assert.equal(rect.area(), 40, 'area() must read this.width, not a captured value');
});

test('deepCopy: equal in value', () => {
  const original = { a: 1, nested: { b: [1, 2, { c: 3 }] } };
  assert.deepEqual(deepCopy(original), original);
});

test('deepCopy: independent at every depth', () => {
  const original = { a: 1, nested: { b: { c: 3 } } };
  const copy = deepCopy(original);
  copy.nested.b.c = 999;
  assert.equal(original.nested.b.c, 3, 'a shallow spread is not enough here');
});
