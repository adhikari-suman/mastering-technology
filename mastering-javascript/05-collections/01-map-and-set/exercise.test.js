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
  countWords, groupBy, unique, intersection, union, difference,
  mapToObject, objectToMap, cacheWith,
} = solution;

test('countWords: counts into a Map', () => {
  const result = countWords(['a', 'b', 'a']);
  assert.ok(result instanceof Map);
  assert.equal(result.get('a'), 2);
  assert.equal(result.get('b'), 1);
  assert.equal(result.size, 2);
});

test('countWords: keeps first-seen order', () => {
  assert.deepEqual([...countWords(['b', 'a', 'b']).keys()], ['b', 'a']);
});

test('countWords: empty input', () => {
  assert.equal(countWords([]).size, 0);
});

test('groupBy: groups in order', () => {
  const result = groupBy([1, 2, 3, 4], (n) => (n % 2 ? 'odd' : 'even'));
  assert.deepEqual(result.get('odd'), [1, 3]);
  assert.deepEqual(result.get('even'), [2, 4]);
});

test('groupBy: object keys work, unlike a plain object', () => {
  const a = { id: 'a' };
  const result = groupBy([1, 2], () => a);
  assert.deepEqual(result.get(a), [1, 2]);
  assert.equal(result.size, 1);
});

test('unique: preserves first-seen order', () => {
  assert.deepEqual(unique([3, 1, 3, 2, 1]), [3, 1, 2]);
  assert.deepEqual(unique([]), []);
});

test('unique: NaN is a duplicate of NaN', () => {
  assert.deepEqual(unique([NaN, NaN]), [NaN], 'SameValueZero, unlike ===');
});

test('unique: distinct objects are not duplicates', () => {
  assert.equal(unique([{}, {}]).length, 2);
});

test('intersection', () => {
  const result = intersection(new Set([1, 2, 3]), new Set([2, 3, 4]));
  assert.ok(result instanceof Set);
  assert.deepEqual([...result], [2, 3]);
  assert.deepEqual([...intersection(new Set([1]), new Set([2]))], []);
});

test('union', () => {
  assert.deepEqual([...union(new Set([1, 2]), new Set([2, 3]))], [1, 2, 3]);
  assert.deepEqual([...union(new Set(), new Set([1]))], [1]);
});

test('difference', () => {
  assert.deepEqual([...difference(new Set([1, 2, 3]), new Set([2]))], [1, 3]);
  assert.deepEqual([...difference(new Set([1]), new Set([1]))], []);
});

test('set operations do not mutate their inputs', () => {
  const a = new Set([1, 2]);
  const b = new Set([2, 3]);
  union(a, b); intersection(a, b); difference(a, b);
  assert.deepEqual([...a], [1, 2]);
  assert.deepEqual([...b], [2, 3]);
});

test('mapToObject', () => {
  assert.deepEqual(mapToObject(new Map([['a', 1], ['b', 2]])), { a: 1, b: 2 });
  assert.deepEqual(mapToObject(new Map()), {});
});

test('objectToMap', () => {
  const result = objectToMap({ a: 1, b: 2 });
  assert.ok(result instanceof Map);
  assert.equal(result.get('a'), 1);
  assert.equal(result.size, 2);
});

test('objectToMap: ignores inherited properties', () => {
  const child = Object.create({ inherited: 1 });
  child.own = 2;
  assert.deepEqual([...objectToMap(child).keys()], ['own']);
});

test('cacheWith: caches by value', () => {
  let calls = 0;
  const double = cacheWith((n) => { calls++; return n * 2; });
  assert.equal(double(2), 4);
  assert.equal(double(2), 4);
  assert.equal(calls, 1);
});

test('cacheWith: object keys work by identity', () => {
  let calls = 0;
  const size = cacheWith((obj) => { calls++; return Object.keys(obj).length; });
  const key = { a: 1 };
  assert.equal(size(key), 1);
  assert.equal(size(key), 1);
  assert.equal(calls, 1, 'the same object must hit the cache');
  assert.equal(size({ a: 1 }), 1);
  assert.equal(calls, 2, 'a different object with equal contents must miss');
});

test('cacheWith: caches falsy results', () => {
  let calls = 0;
  const zero = cacheWith(() => { calls++; return 0; });
  zero('k'); zero('k');
  assert.equal(calls, 1);
});
