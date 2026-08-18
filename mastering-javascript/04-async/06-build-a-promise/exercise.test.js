import test from 'node:test';
import assert from 'node:assert/strict';
import * as solution from './solution.js';

const { MyPromise, deferred } = solution;

// Bridge MyPromise to the native world so we can await it in tests.
const toNative = (p) => new Promise((resolve, reject) => p.then(resolve, reject));

test('the executor runs synchronously', () => {
  let ran = false;
  new MyPromise(() => { ran = true; });
  assert.equal(ran, true);
});

test('resolves with a value', async () => {
  assert.equal(await toNative(new MyPromise((resolve) => resolve(5))), 5);
});

test('rejects with a reason', async () => {
  await assert.rejects(() => toNative(new MyPromise((_, reject) => reject(new Error('boom')))), /boom/);
});

test('an executor that throws rejects the promise', async () => {
  await assert.rejects(() => toNative(new MyPromise(() => { throw new Error('boom'); })), /boom/);
});

test('settles once — later calls are ignored', async () => {
  const p = new MyPromise((resolve, reject) => {
    resolve('first');
    resolve('second');
    reject(new Error('nope'));
  });
  assert.equal(await toNative(p), 'first');
});

test('handlers run asynchronously even when already settled', async () => {
  const order = [];
  MyPromise.resolve(1).then(() => order.push('then'));
  order.push('sync');
  await toNative(MyPromise.resolve());
  await new Promise((r) => setTimeout(r, 0));
  assert.deepEqual(order, ['sync', 'then'], 'use queueMicrotask, never call inline');
});

test('handlers registered while pending still run', async () => {
  const p = new MyPromise((resolve) => setTimeout(() => resolve('late'), 5));
  assert.equal(await toNative(p), 'late');
});

test('multiple handlers on one promise all run', async () => {
  const p = MyPromise.resolve(1);
  const seen = [];
  p.then((v) => seen.push(`a${v}`));
  p.then((v) => seen.push(`b${v}`));
  await new Promise((r) => setTimeout(r, 0));
  assert.deepEqual(seen, ['a1', 'b1']);
});

test('then returns a new promise', () => {
  const p = MyPromise.resolve(1);
  assert.notEqual(p.then(() => {}), p);
  assert.ok(p.then(() => {}) instanceof MyPromise);
});

test('chaining transforms the value', async () => {
  const p = MyPromise.resolve(2).then((v) => v * 2).then((v) => v + 1);
  assert.equal(await toNative(p), 5);
});

test('a handler that throws rejects the next promise', async () => {
  await assert.rejects(
    () => toNative(MyPromise.resolve(1).then(() => { throw new Error('boom'); })),
    /boom/,
  );
});

test('returning a thenable adopts it', async () => {
  const p = MyPromise.resolve(1).then(() => MyPromise.resolve('adopted'));
  assert.equal(await toNative(p), 'adopted');
});

test('adopts a native promise too', async () => {
  const p = MyPromise.resolve(1).then(() => Promise.resolve('native'));
  assert.equal(await toNative(p), 'native');
});

test('a missing handler passes values through', async () => {
  assert.equal(await toNative(MyPromise.resolve('v').then(null).then()), 'v');
});

test('a missing handler passes rejections through to catch', async () => {
  const p = MyPromise.reject(new Error('boom')).then((v) => v).then((v) => v);
  await assert.rejects(() => toNative(p), /boom/);
});

test('catch handles a rejection and recovers the chain', async () => {
  const p = MyPromise.reject(new Error('boom')).catch(() => 'recovered').then((v) => `${v}!`);
  assert.equal(await toNative(p), 'recovered!');
});

test('finally runs on both paths and passes through', async () => {
  const seen = [];
  assert.equal(await toNative(MyPromise.resolve('v').finally(() => seen.push('ok'))), 'v');
  await assert.rejects(
    () => toNative(MyPromise.reject(new Error('boom')).finally(() => seen.push('err'))),
    /boom/,
  );
  assert.deepEqual(seen, ['ok', 'err']);
});

test('finally ignores its own return value', async () => {
  assert.equal(await toNative(MyPromise.resolve('v').finally(() => 'ignored')), 'v');
});

test('MyPromise.resolve adopts a thenable', async () => {
  assert.equal(await toNative(MyPromise.resolve(MyPromise.resolve('inner'))), 'inner');
});

test('MyPromise.all: order and empty', async () => {
  assert.deepEqual(await toNative(MyPromise.all([MyPromise.resolve(1), 2])), [1, 2]);
  assert.deepEqual(await toNative(MyPromise.all([])), []);
});

test('MyPromise.all: rejects on the first failure', async () => {
  await assert.rejects(
    () => toNative(MyPromise.all([MyPromise.resolve(1), MyPromise.reject(new Error('boom'))])),
    /boom/,
  );
});

test('MyPromise.allSettled: never rejects', async () => {
  const result = await toNative(
    MyPromise.allSettled([MyPromise.resolve(1), MyPromise.reject(new Error('boom'))]),
  );
  assert.equal(result[0].status, 'fulfilled');
  assert.equal(result[0].value, 1);
  assert.equal(result[1].status, 'rejected');
  assert.equal(result[1].reason.message, 'boom');
});

test('MyPromise.race: first to settle', async () => {
  const slow = new MyPromise((resolve) => setTimeout(() => resolve('slow'), 20));
  const fast = new MyPromise((resolve) => setTimeout(() => resolve('fast'), 1));
  assert.equal(await toNative(MyPromise.race([slow, fast])), 'fast');
});

test('deferred: settle from outside', async () => {
  const d = deferred();
  d.resolve(5);
  assert.equal(await toNative(d.promise), 5);
});

test('deferred: reject from outside', async () => {
  const d = deferred();
  d.reject(new Error('boom'));
  await assert.rejects(() => toNative(d.promise), /boom/);
});

test('no native promises leaked into then', () => {
  assert.ok(
    MyPromise.resolve(1).then(() => {}) instanceof MyPromise,
    'then must return a MyPromise, not a native Promise',
  );
});
