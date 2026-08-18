import test from 'node:test';
import assert from 'node:assert/strict';
import * as solution from './solution.js';

const { makePrivateStore, Tagged, weakMemoize, visitOnce, canBeWeakKey, deepCountUnique } = solution;

test('makePrivateStore: stores and reads per object', () => {
  const store = makePrivateStore();
  const a = {};
  const b = {};
  store.set(a, 1);
  store.set(b, 2);
  assert.equal(store.get(a), 1);
  assert.equal(store.get(b), 2);
});

test('makePrivateStore: has and remove', () => {
  const store = makePrivateStore();
  const obj = {};
  assert.equal(store.has(obj), false);
  store.set(obj, 'x');
  assert.equal(store.has(obj), true);
  store.remove(obj);
  assert.equal(store.has(obj), false);
  assert.equal(store.get(obj), undefined);
});

test('makePrivateStore: leaves the object untouched', () => {
  const store = makePrivateStore();
  const obj = { visible: 1 };
  store.set(obj, { secret: 2 });
  assert.deepEqual(Object.keys(obj), ['visible']);
  assert.equal(JSON.stringify(obj), '{"visible":1}');
  assert.deepEqual(Object.getOwnPropertySymbols(obj), []);
});

test('makePrivateStore: separate stores are independent', () => {
  const a = makePrivateStore();
  const b = makePrivateStore();
  const obj = {};
  a.set(obj, 'a');
  assert.equal(b.get(obj), undefined);
});

test('Tagged: reads and writes its tag', () => {
  const t = new Tagged('a');
  assert.equal(t.getTag(), 'a');
  t.setTag('b');
  assert.equal(t.getTag(), 'b');
});

test('Tagged: nothing is stored on the instance', () => {
  const t = new Tagged('a');
  assert.deepEqual(Object.keys(t), []);
  assert.equal(JSON.stringify(t), '{}');
  assert.deepEqual(Object.getOwnPropertyNames(t), []);
});

test('Tagged: instances are independent', () => {
  const a = new Tagged('a');
  const b = new Tagged('b');
  a.setTag('changed');
  assert.equal(b.getTag(), 'b');
});

test('weakMemoize: caches by object identity', () => {
  let calls = 0;
  const size = weakMemoize((obj) => { calls++; return Object.keys(obj).length; });
  const key = { a: 1 };
  assert.equal(size(key), 1);
  assert.equal(size(key), 1);
  assert.equal(calls, 1);
});

test('weakMemoize: a different object misses', () => {
  let calls = 0;
  const f = weakMemoize(() => { calls++; return 1; });
  f({}); f({});
  assert.equal(calls, 2);
});

test('weakMemoize: primitives pass through uncached', () => {
  let calls = 0;
  const f = weakMemoize((n) => { calls++; return n * 2; });
  assert.equal(f(2), 4);
  assert.equal(f(2), 4);
  assert.equal(calls, 2, 'primitives cannot be WeakMap keys — just call through');
});

test('visitOnce: only the first visit runs fn', () => {
  const seen = [];
  const visit = visitOnce((n) => { seen.push(n.id); return n.id; });
  const a = { id: 'a' };
  assert.equal(visit(a), 'a');
  assert.equal(visit(a), undefined);
  assert.deepEqual(seen, ['a']);
});

test('visitOnce: distinct objects each get one visit', () => {
  const visit = visitOnce((n) => n.id);
  assert.equal(visit({ id: 1 }), 1);
  assert.equal(visit({ id: 2 }), 2);
});

test('canBeWeakKey', () => {
  assert.equal(canBeWeakKey({}), true);
  assert.equal(canBeWeakKey([]), true);
  assert.equal(canBeWeakKey(() => {}), true);
  assert.equal(canBeWeakKey(Symbol('s')), true);
  assert.equal(canBeWeakKey(null), false);
  assert.equal(canBeWeakKey('str'), false);
  assert.equal(canBeWeakKey(1), false);
  assert.equal(canBeWeakKey(undefined), false);
});

test('canBeWeakKey: agrees with the real WeakMap', () => {
  for (const value of [{}, [], () => {}, null, 'str', 1, undefined]) {
    let allowed = true;
    try { new WeakMap().set(value, 1); } catch { allowed = false; }
    assert.equal(canBeWeakKey(value), allowed, `disagreed for ${String(value)}`);
  }
});

test('deepCountUnique: counts distinct objects', () => {
  assert.equal(deepCountUnique({}), 1);
  assert.equal(deepCountUnique({ a: {}, b: {} }), 3);
  assert.equal(deepCountUnique({ a: { b: { c: {} } } }), 4);
});

test('deepCountUnique: a shared object counts once', () => {
  const shared = {};
  assert.equal(deepCountUnique({ a: shared, b: shared }), 2);
});

test('deepCountUnique: terminates on a cycle', () => {
  const a = { b: {} };
  a.self = a;
  assert.equal(deepCountUnique(a), 2);
});

test('deepCountUnique: ignores primitives', () => {
  assert.equal(deepCountUnique({ a: 1, b: 'x', c: null }), 1);
});
