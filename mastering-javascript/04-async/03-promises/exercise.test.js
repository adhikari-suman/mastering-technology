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

const { wait, resolveAfter, rejectAfter, chain, retry, withTimeout, settle, tapPromise } = solution;

test('wait: resolves after the delay', async () => {
  const start = Date.now();
  await wait(20);
  assert.ok(Date.now() - start >= 18, 'should actually wait');
});

test('resolveAfter / rejectAfter', async () => {
  assert.equal(await resolveAfter(1, 'x'), 'x');
  await assert.rejects(() => rejectAfter(1, new Error('boom')), /boom/);
});

test('chain: threads through sync and async steps', async () => {
  assert.equal(await chain(2, (n) => n + 1, async (n) => n * 10), 30);
});

test('chain: no functions returns the value', async () => {
  assert.equal(await chain(2), 2);
});

test('chain: runs in order', async () => {
  assert.equal(await chain('a', (s) => `${s}b`, (s) => `${s}c`), 'abc');
});

test('chain: a rejection propagates', async () => {
  await assert.rejects(() => chain(1, () => { throw new Error('boom'); }), /boom/);
  await assert.rejects(() => chain(1, () => rejectAfter(1, new Error('async boom'))), /async boom/);
});

test('chain: stops at the first failure', async () => {
  let ran = false;
  await assert.rejects(() => chain(1, () => { throw new Error('x'); }, () => { ran = true; }));
  assert.equal(ran, false);
});

test('retry: succeeds first time', async () => {
  let calls = 0;
  assert.equal(await retry(async () => { calls++; return 'ok'; }, 3), 'ok');
  assert.equal(calls, 1, 'no retry needed');
});

test('retry: succeeds on a later attempt', async () => {
  let calls = 0;
  const flaky = async () => {
    calls++;
    if (calls < 3) throw new Error('not yet');
    return 'ok';
  };
  assert.equal(await retry(flaky, 5), 'ok');
  assert.equal(calls, 3);
});

test('retry: gives up and reports the last error', async () => {
  let calls = 0;
  const always = async () => { calls++; throw new Error(`fail ${calls}`); };
  await assert.rejects(() => retry(always, 3), /fail 3/);
  assert.equal(calls, 3);
});

test('retry: one attempt means no retry', async () => {
  let calls = 0;
  await assert.rejects(() => retry(async () => { calls++; throw new Error('x'); }, 1));
  assert.equal(calls, 1);
});

test('withTimeout: fast enough', async () => {
  assert.equal(await withTimeout(resolveAfter(1, 'x'), 50), 'x');
});

test('withTimeout: too slow', async () => {
  await assert.rejects(() => withTimeout(resolveAfter(50, 'x'), 5), /^Error: timeout$/);
});

test('withTimeout: an original rejection passes through', async () => {
  await assert.rejects(() => withTimeout(rejectAfter(1, new Error('original')), 50), /original/);
});

test('settle: never rejects', async () => {
  assert.deepEqual(await settle(resolveAfter(1, 'x')), { status: 'fulfilled', value: 'x' });
  const result = await settle(rejectAfter(1, new Error('boom')));
  assert.equal(result.status, 'rejected');
  assert.equal(result.reason.message, 'boom');
});

test('tapPromise: passes the value through', async () => {
  const seen = [];
  assert.equal(await resolveAfter(1, 5).then(tapPromise((v) => seen.push(v))), 5);
  assert.deepEqual(seen, [5]);
});

test('tapPromise: waits for an async side effect', async () => {
  const order = [];
  await resolveAfter(1, 'v').then(tapPromise(async () => {
    await wait(10);
    order.push('effect');
  }));
  order.push('after');
  assert.deepEqual(order, ['effect', 'after']);
});
