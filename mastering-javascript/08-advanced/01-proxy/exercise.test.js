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

const { withDefault, readOnly, validated, negativeIndex, observed, countingProxy } = solution;

test('withDefault', () => {
  const obj = withDefault({ a: 1 }, 0);
  assert.equal(obj.a, 1);
  assert.equal(obj.z, 0);
});

test('withDefault: existing falsy values are not replaced', () => {
  const obj = withDefault({ zero: 0, empty: '', no: false }, 'FALLBACK');
  assert.equal(obj.zero, 0);
  assert.equal(obj.empty, '');
  assert.equal(obj.no, false);
});

test('withDefault: writes still work', () => {
  const obj = withDefault({}, 0);
  obj.x = 5;
  assert.equal(obj.x, 5);
});

test('readOnly: reads pass through', () => {
  assert.equal(readOnly({ a: 1 }).a, 1);
});

test('readOnly: writes and deletes throw', () => {
  const obj = readOnly({ a: 1 });
  assert.throws(() => { obj.a = 2; }, TypeError);
  assert.throws(() => { obj.b = 1; }, TypeError);
  assert.throws(() => { delete obj.a; }, TypeError);
  assert.equal(obj.a, 1, 'the target must be untouched');
});

test('validated: accepts valid values', () => {
  const user = validated({}, { age: (v) => typeof v === 'number' });
  user.age = 30;
  assert.equal(user.age, 30);
});

test('validated: rejects invalid values', () => {
  const user = validated({}, { age: (v) => typeof v === 'number' });
  assert.throws(() => { user.age = 'old'; }, TypeError);
  assert.equal(user.age, undefined, 'a rejected write must not land');
});

test('validated: unvalidated properties are free', () => {
  const user = validated({}, { age: (v) => typeof v === 'number' });
  user.anything = 'goes';
  assert.equal(user.anything, 'goes');
});

test('validated: several validators', () => {
  const user = validated({}, {
    age: (v) => typeof v === 'number',
    name: (v) => typeof v === 'string' && v.length > 0,
  });
  user.age = 1;
  user.name = 'Ada';
  assert.throws(() => { user.name = ''; }, TypeError);
});

test('negativeIndex: counts from the end', () => {
  const arr = negativeIndex([1, 2, 3]);
  assert.equal(arr[-1], 3);
  assert.equal(arr[-2], 2);
  assert.equal(arr[-3], 1);
});

test('negativeIndex: normal access is unaffected', () => {
  const arr = negativeIndex([1, 2, 3]);
  assert.equal(arr[0], 1);
  assert.equal(arr[2], 3);
  assert.equal(arr.length, 3);
  assert.equal(arr[99], undefined);
});

test('negativeIndex: methods and iteration still work', () => {
  const arr = negativeIndex([1, 2, 3]);
  assert.deepEqual(arr.map((n) => n * 2), [2, 4, 6]);
  assert.deepEqual([...arr], [1, 2, 3]);
  assert.equal(arr.includes(2), true);
});

test('observed: records reads in order', () => {
  const seen = [];
  const obj = observed({ a: 1, b: 2 }, (prop) => seen.push(prop));
  obj.a; obj.b; obj.a;
  assert.deepEqual(seen, ['a', 'b', 'a']);
});

test('observed: returns real values', () => {
  const obj = observed({ a: 1 }, () => {});
  assert.equal(obj.a, 1);
  assert.equal(obj.missing, undefined);
});

test('observed: symbol keys are not reported', () => {
  const seen = [];
  const obj = observed({ a: 1 }, (prop) => seen.push(prop));
  obj[Symbol.toPrimitive];
  `${JSON.stringify(obj)}`;
  assert.ok(seen.every((p) => typeof p === 'string'), 'symbols must be filtered out');
});

test('countingProxy: tallies each operation', () => {
  const { proxy, counts } = countingProxy({ a: 1 });
  proxy.a;
  proxy.b = 2;
  'a' in proxy;
  delete proxy.a;
  assert.equal(counts.get, 1);
  assert.equal(counts.set, 1);
  assert.equal(counts.has, 1);
  assert.equal(counts.deleteProperty, 1);
});

test('countingProxy: starts at zero and behaviour is unchanged', () => {
  const { proxy, counts } = countingProxy({ a: 1 });
  assert.deepEqual(counts, { get: 0, set: 0, has: 0, deleteProperty: 0 });
  proxy.b = 5;
  assert.equal(proxy.b, 5);
  assert.equal('b' in proxy, true);
  delete proxy.b;
  assert.equal(proxy.b, undefined);
});
