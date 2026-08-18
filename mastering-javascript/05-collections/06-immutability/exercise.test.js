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

const {
  setIn, updateIn, removeIn, push, insertAt, removeAt, replaceAt, sortBy, sharesBranch,
} = solution;

test('setIn: sets at depth', () => {
  assert.deepEqual(setIn({ a: { b: 1 } }, ['a', 'b'], 2), { a: { b: 2 } });
  assert.deepEqual(setIn({ a: 1 }, ['a'], 2), { a: 2 });
});

test('setIn: creates missing levels', () => {
  assert.deepEqual(setIn({}, ['a', 'b'], 1), { a: { b: 1 } });
  assert.deepEqual(setIn({ x: 1 }, ['a', 'b', 'c'], 2), { x: 1, a: { b: { c: 2 } } });
});

test('setIn: empty path replaces the whole value', () => {
  assert.equal(setIn({ a: 1 }, [], 5), 5);
});

test('setIn: does not mutate', () => {
  const original = { a: { b: 1 } };
  setIn(original, ['a', 'b'], 2);
  assert.deepEqual(original, { a: { b: 1 } });
});

test('setIn: untouched branches are shared, not copied', () => {
  const state = { changed: { x: 1 }, untouched: { y: 2 } };
  const next = setIn(state, ['changed', 'x'], 9);
  assert.equal(next.untouched, state.untouched, 'share what did not change');
  assert.notEqual(next.changed, state.changed, 'copy what did');
  assert.notEqual(next, state);
});

test('updateIn: computes from the old value', () => {
  assert.deepEqual(updateIn({ n: 1 }, ['n'], (x) => x + 1), { n: 2 });
  assert.deepEqual(updateIn({ a: { list: [1] } }, ['a', 'list'], (l) => [...l, 2]), { a: { list: [1, 2] } });
});

test('updateIn: does not mutate', () => {
  const original = { n: 1 };
  updateIn(original, ['n'], (x) => x + 1);
  assert.equal(original.n, 1);
});

test('removeIn: removes at depth', () => {
  assert.deepEqual(removeIn({ a: { b: 1, c: 2 } }, ['a', 'b']), { a: { c: 2 } });
  assert.deepEqual(removeIn({ a: 1, b: 2 }, ['a']), { b: 2 });
});

test('removeIn: a missing path is a no-op', () => {
  assert.deepEqual(removeIn({ a: 1 }, ['zzz']), { a: 1 });
  assert.deepEqual(removeIn({ a: 1 }, ['x', 'y']), { a: 1 });
});

test('removeIn: does not mutate', () => {
  const original = { a: { b: 1 } };
  removeIn(original, ['a', 'b']);
  assert.deepEqual(original, { a: { b: 1 } });
});

test('array helpers produce new arrays', () => {
  assert.deepEqual(push([1, 2], 3), [1, 2, 3]);
  assert.deepEqual(insertAt([1, 3], 1, 2), [1, 2, 3]);
  assert.deepEqual(removeAt([1, 2, 3], 1), [1, 3]);
  assert.deepEqual(replaceAt([1, 2, 3], 1, 9), [1, 9, 3]);
});

test('array helpers: edges', () => {
  assert.deepEqual(push([], 1), [1]);
  assert.deepEqual(insertAt([1], 0, 0), [0, 1]);
  assert.deepEqual(insertAt([1], 1, 2), [1, 2]);
  assert.deepEqual(removeAt([1], 0), []);
});

test('array helpers: never mutate', () => {
  const original = [1, 2, 3];
  push(original, 4); insertAt(original, 0, 0); removeAt(original, 0); replaceAt(original, 0, 9);
  assert.deepEqual(original, [1, 2, 3]);
});

test('sortBy: returns a sorted copy', () => {
  const users = [{ age: 30 }, { age: 20 }];
  assert.deepEqual(sortBy(users, (u) => u.age), [{ age: 20 }, { age: 30 }]);
  assert.deepEqual(users, [{ age: 30 }, { age: 20 }], 'sort mutates — copy first');
});

test('sortBy: strings too', () => {
  assert.deepEqual(sortBy(['b', 'a'], (s) => s), ['a', 'b']);
  assert.deepEqual(sortBy([], (s) => s), []);
});

test('sharesBranch', () => {
  const state = { a: { x: 1 }, b: { y: 2 } };
  const next = setIn(state, ['a', 'x'], 9);
  assert.equal(sharesBranch(state, next, ['b']), true);
  assert.equal(sharesBranch(state, next, ['a']), false);
  assert.equal(sharesBranch(state, next, []), false, 'the root always changes');
});
