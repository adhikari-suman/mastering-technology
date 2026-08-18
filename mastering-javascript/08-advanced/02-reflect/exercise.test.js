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

const { safeDefine, allKeys, forwardingProxy, brokenProxy, receiverMatters, construct, describeOperations } = solution;

const makeTarget = () => ({
  _name: 'inner',
  plain: 1,
  get name() { return this._name; },
});

test('safeDefine: succeeds', () => {
  const obj = {};
  assert.equal(safeDefine(obj, 'x', { value: 1, configurable: true }), true);
  assert.equal(obj.x, 1);
});

test('safeDefine: returns false instead of throwing', () => {
  const obj = Object.freeze({});
  assert.equal(safeDefine(obj, 'x', { value: 1 }), false, 'no throw — a boolean');
});

test('safeDefine: false when redefining a non-configurable property', () => {
  const obj = {};
  Object.defineProperty(obj, 'locked', { value: 1, configurable: false });
  assert.equal(safeDefine(obj, 'locked', { value: 2 }), false);
});

test('allKeys: strings and symbols, enumerable or not', () => {
  const sym = Symbol('s');
  const obj = { visible: 1, [sym]: 2 };
  Object.defineProperty(obj, 'hidden', { value: 3, enumerable: false });
  const keys = allKeys(obj);
  assert.ok(keys.includes('visible'));
  assert.ok(keys.includes('hidden'), 'non-enumerable keys count');
  assert.ok(keys.includes(sym), 'symbol keys count');
  assert.equal(keys.length, 3);
});

test('allKeys: empty object', () => {
  assert.deepEqual(allKeys({}), []);
});

test('forwardingProxy: logs and returns real values', () => {
  const seen = [];
  const proxy = forwardingProxy({ a: 1 }, (p) => seen.push(p));
  assert.equal(proxy.a, 1);
  assert.deepEqual(seen, ['a']);
});

test('forwardingProxy: a getter runs against the proxy, so nested reads are seen', () => {
  const seen = [];
  const proxy = forwardingProxy(makeTarget(), (p) => seen.push(p));
  assert.equal(proxy.name, 'inner');
  assert.deepEqual(seen, ['name', '_name'], 'Reflect.get with the receiver catches both');
});

test('brokenProxy: the nested read is missed', () => {
  const seen = [];
  const proxy = brokenProxy(makeTarget(), (p) => seen.push(p));
  assert.equal(proxy.name, 'inner');
  assert.deepEqual(seen, ['name'], 'target[prop] runs the getter against the target');
});

test('receiverMatters: shows both behaviours side by side', () => {
  const result = receiverMatters(makeTarget());
  assert.deepEqual(result.forwarded, ['name', '_name']);
  assert.deepEqual(result.broken, ['name']);
});

test('construct: builds an instance', () => {
  class Point {
    constructor(x, y) { this.x = x; this.y = y; }
  }
  const p = construct(Point, [1, 2]);
  assert.ok(p instanceof Point);
  assert.equal(p.x, 1);
  assert.equal(p.y, 2);
});

test('construct: works with built-ins', () => {
  assert.deepEqual(construct(Array, [1, 2, 3]), [1, 2, 3]);
  assert.equal(construct(Date, [0]).getTime(), 0);
});

test('describeOperations: every trap has a Reflect twin', () => {
  const result = describeOperations();
  assert.deepEqual(result, {
    get: true, set: true, has: true, deleteProperty: true,
    ownKeys: true, apply: true, construct: true,
  });
});
