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
  ORDER_PREDICTIONS,
  recordOrder,
  nextMicrotask,
  nextMacrotask,
  runAfterDrain,
  isStarved,
} = solution;

const EXPECTED = {
  basic: ['1', '4', '3', '2'],
  awaitSplit: ['a', 'c', 'b'],
  chained: ['p1', 'p2', 't1', 't2'],
  nested: ['outer', 'inner', 'timer'],
};

test('ORDER_PREDICTIONS: every snippet answered', () => {
  assert.ok(ORDER_PREDICTIONS, 'export an ORDER_PREDICTIONS object');
  const todo = Object.keys(EXPECTED).filter((k) => ORDER_PREDICTIONS[k] === 'TODO');
  assert.deepEqual(todo, [], `still marked TODO: ${todo.join(', ')}`);
});

for (const [name, order] of Object.entries(EXPECTED)) {
  test(`ORDER_PREDICTIONS: ${name}`, () => {
    assert.deepEqual(ORDER_PREDICTIONS?.[name], order);
  });
}

test('recordOrder: sync, then microtasks, then macrotasks', async () => {
  assert.deepEqual(await recordOrder(), ['sync', 'sync-end', 'micro', 'macro']);
});

test('nextMicrotask beats a pending timer', async () => {
  const order = [];
  const timer = new Promise((resolve) => setTimeout(() => { order.push('macro'); resolve(); }, 0));
  await nextMicrotask();
  order.push('micro');
  await timer;
  assert.deepEqual(order, ['micro', 'macro']);
});

test('nextMacrotask loses to a pending microtask', async () => {
  const order = [];
  const micro = Promise.resolve().then(() => order.push('micro'));
  await nextMacrotask();
  order.push('macro');
  await micro;
  assert.deepEqual(order, ['micro', 'macro']);
});

test('runAfterDrain: runs after the queued microtasks', async () => {
  const order = [];
  Promise.resolve().then(() => order.push('m1'));
  Promise.resolve().then(() => order.push('m2'));
  Promise.resolve().then(() => order.push('m3'));
  await runAfterDrain(() => order.push('after'));
  assert.deepEqual(order, ['m1', 'm2', 'm3', 'after']);
});

test('runAfterDrain: resolves with the function result', async () => {
  assert.equal(await runAfterDrain(() => 42), 42);
});

test('isStarved: the whole microtask queue drains in one pass', async () => {
  assert.deepEqual(await isStarved(3), [0, 1, 2]);
  assert.deepEqual(await isStarved(0), []);
  assert.deepEqual(await isStarved(5), [0, 1, 2, 3, 4]);
});
