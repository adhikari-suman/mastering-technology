import test from 'node:test';
import assert from 'node:assert/strict';
import * as solution from './solution.js';

const { readCount, bumpCount, namespaceKeys, defaultOf, reexported, isModuleNamespace, moduleThis } = solution;

test('live bindings: the imported value updates', () => {
  const before = readCount();
  bumpCount();
  assert.equal(readCount(), before + 1, 'an ESM import is a live view, not a copy');
  bumpCount();
  assert.equal(readCount(), before + 2);
});

test('namespaceKeys: named exports, sorted', async () => {
  const ns = await import('./fixtures/shapes.js');
  assert.deepEqual(namespaceKeys(ns), ['area', 'circle', 'square']);
});

test('namespaceKeys: default counts as a key', async () => {
  const ns = await import('./fixtures/counter.js');
  assert.ok(namespaceKeys(ns).includes('default'));
  assert.ok(namespaceKeys(ns).includes('count'));
});

test('defaultOf', async () => {
  assert.equal(defaultOf(await import('./fixtures/counter.js')), 'the default export');
  assert.equal(defaultOf(await import('./fixtures/shapes.js')), undefined);
});

test('reexported: forwards the function', () => {
  assert.equal(typeof reexported, 'function', 're-export area as reexported');
  assert.equal(reexported('circle'), 3.14);
  assert.equal(reexported('square'), 1);
});

test('isModuleNamespace', async () => {
  assert.equal(isModuleNamespace(await import('./fixtures/shapes.js')), true);
  assert.equal(isModuleNamespace({}), false);
  assert.equal(isModuleNamespace(null), false);
  assert.equal(isModuleNamespace({ [Symbol.toStringTag]: 'Module' }), true, 'duck-typed');
});

test('moduleThis is undefined at the top level of an ES module', () => {
  assert.equal(moduleThis, undefined, 'not globalThis — that is a CommonJS thing');
});

test('modules are singletons: two imports give the same namespace', async () => {
  const a = await import('./fixtures/counter.js');
  const b = await import('./fixtures/counter.js');
  assert.equal(a, b, 'the module body runs once and is cached');
});

test('the namespace reflects live state too', async () => {
  const ns = await import('./fixtures/counter.js');
  const before = ns.count;
  bumpCount();
  assert.equal(ns.count, before + 1);
});
