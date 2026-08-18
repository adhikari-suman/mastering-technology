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
  sequential, concurrent, timedSequential, timedConcurrent,
  mapSeries, mapParallel, safeCall, forEachIsBroken,
} = solution;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slow = (value, ms) => async () => { await sleep(ms); return value; };

test('sequential: results in order', async () => {
  assert.deepEqual(await sequential([slow('a', 5), slow('b', 1)]), ['a', 'b']);
  assert.deepEqual(await sequential([]), []);
});

test('sequential: really is one at a time', async () => {
  const order = [];
  const step = (name, ms) => async () => {
    order.push(`${name}-start`);
    await sleep(ms);
    order.push(`${name}-end`);
  };
  await sequential([step('a', 10), step('b', 1)]);
  assert.deepEqual(order, ['a-start', 'a-end', 'b-start', 'b-end']);
});

test('concurrent: results in input order', async () => {
  assert.deepEqual(await concurrent([slow('slow', 20), slow('fast', 1)]), ['slow', 'fast']);
  assert.deepEqual(await concurrent([]), []);
});

test('concurrent: really does overlap', async () => {
  const order = [];
  const step = (name, ms) => async () => {
    order.push(`${name}-start`);
    await sleep(ms);
  };
  await concurrent([step('a', 15), step('b', 1)]);
  assert.deepEqual(order.slice(0, 2), ['a-start', 'b-start'], 'both start before either ends');
});

test('sequential is measurably slower than concurrent', async () => {
  const tasks = [slow(1, 25), slow(2, 25), slow(3, 25)];
  const seq = await timedSequential(tasks);
  const con = await timedConcurrent(tasks);
  assert.deepEqual(seq.results, [1, 2, 3]);
  assert.deepEqual(con.results, [1, 2, 3]);
  assert.ok(seq.ms >= 70, `sequential should take ~75ms, took ${seq.ms}`);
  assert.ok(con.ms < 60, `concurrent should take ~25ms, took ${con.ms}`);
});

test('mapSeries: maps in order, one at a time', async () => {
  const order = [];
  const result = await mapSeries([3, 1], async (n) => {
    await sleep(n * 5);
    order.push(n);
    return n * 2;
  });
  assert.deepEqual(result, [6, 2]);
  assert.deepEqual(order, [3, 1], 'serial, so the slow one finishes first');
});

test('mapSeries: passes the index', async () => {
  assert.deepEqual(await mapSeries(['a', 'b'], async (v, i) => `${v}${i}`), ['a0', 'b1']);
});

test('mapParallel: maps all at once, results in order', async () => {
  const order = [];
  const result = await mapParallel([3, 1], async (n) => {
    await sleep(n * 5);
    order.push(n);
    return n * 2;
  });
  assert.deepEqual(result, [6, 2], 'results follow input order');
  assert.deepEqual(order, [1, 3], 'but completion follows speed');
});

test('mapParallel: empty input', async () => {
  assert.deepEqual(await mapParallel([], async (n) => n), []);
});

test('safeCall: success', async () => {
  assert.deepEqual(await safeCall(async () => 1), [null, 1]);
});

test('safeCall: rejection', async () => {
  const [err, value] = await safeCall(async () => { throw new Error('boom'); });
  assert.equal(err.message, 'boom');
  assert.equal(value, null);
});

test('safeCall: synchronous throw is caught too', async () => {
  const [err] = await safeCall(() => { throw new Error('sync boom'); });
  assert.equal(err.message, 'sync boom');
});

test('safeCall: a falsy resolved value still reports success', async () => {
  assert.deepEqual(await safeCall(async () => 0), [null, 0]);
});

test('forEachIsBroken: returns empty, because forEach ignores promises', async () => {
  const result = forEachIsBroken([1, 2, 3], async (n) => n * 2);
  assert.deepEqual(result, [], 'this is the bug — forEach does not await');
});
