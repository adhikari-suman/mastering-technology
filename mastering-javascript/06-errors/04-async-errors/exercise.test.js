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

const { catchAsync, missingAwait, withAwait, settleAll, firstError, withAsyncCleanup, guardFloating } = solution;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fails = (message) => Promise.reject(new Error(message));

test('catchAsync: success', async () => {
  assert.deepEqual(await catchAsync(async () => 1), [null, 1]);
  assert.deepEqual(await catchAsync(async () => 0), [null, 0]);
});

test('catchAsync: rejection', async () => {
  const [err, value] = await catchAsync(async () => { throw new Error('boom'); });
  assert.equal(err.message, 'boom');
  assert.equal(value, null);
});

test('catchAsync: synchronous throw', async () => {
  const [err] = await catchAsync(() => { throw new Error('sync'); });
  assert.equal(err.message, 'sync');
});

test('missingAwait: the catch never fires', () => {
  assert.equal(missingAwait(), 'not caught', 'the try block exits before the rejection');
});

test('withAwait: the catch fires', async () => {
  assert.equal(await withAwait(), 'caught');
});

test('settleAll: splits successes and failures', async () => {
  const result = await settleAll([Promise.resolve(1), fails('boom'), Promise.resolve(2)]);
  assert.deepEqual(result.successes, [1, 2]);
  assert.deepEqual(result.failures.map((e) => e.message), ['boom']);
});

test('settleAll: never rejects', async () => {
  const result = await settleAll([fails('a'), fails('b')]);
  assert.deepEqual(result.successes, []);
  assert.deepEqual(result.failures.map((e) => e.message), ['a', 'b']);
});

test('settleAll: empty input', async () => {
  assert.deepEqual(await settleAll([]), { successes: [], failures: [] });
});

test('firstError: reports every failure', async () => {
  const errors = await firstError([fails('one'), Promise.resolve(1), fails('two')]);
  assert.deepEqual(errors.map((e) => e.message), ['one', 'two'], 'Promise.all would lose "two"');
});

test('firstError: none failed', async () => {
  assert.deepEqual(await firstError([Promise.resolve(1)]), []);
});

test('withAsyncCleanup: runs cleanup and returns the value', async () => {
  let cleaned = false;
  const value = await withAsyncCleanup(async () => 'v', async () => { cleaned = true; });
  assert.equal(value, 'v');
  assert.equal(cleaned, true);
});

test('withAsyncCleanup: runs cleanup then rethrows', async () => {
  let cleaned = false;
  await assert.rejects(
    () => withAsyncCleanup(async () => { throw new Error('boom'); }, async () => { cleaned = true; }),
    /boom/,
  );
  assert.equal(cleaned, true);
});

test("withAsyncCleanup: a failing cleanup must not mask fn's error", async () => {
  await assert.rejects(
    () => withAsyncCleanup(
      async () => { throw new Error('original'); },
      async () => { throw new Error('cleanup'); },
    ),
    /original/,
  );
});

test('withAsyncCleanup: a failing cleanup propagates when fn succeeded', async () => {
  await assert.rejects(
    () => withAsyncCleanup(async () => 'v', async () => { throw new Error('cleanup'); }),
    /cleanup/,
  );
});

test('withAsyncCleanup: waits for an async cleanup', async () => {
  const order = [];
  await withAsyncCleanup(
    async () => { order.push('fn'); return 1; },
    async () => { await sleep(10); order.push('cleanup'); },
  );
  order.push('after');
  assert.deepEqual(order, ['fn', 'cleanup', 'after']);
});

test('guardFloating: returns immediately', () => {
  assert.equal(guardFloating(sleep(50), () => {}), undefined);
});

test('guardFloating: routes the rejection to onError', async () => {
  const seen = [];
  guardFloating(fails('boom'), (err) => seen.push(err.message));
  await sleep(10);
  assert.deepEqual(seen, ['boom']);
});

test('guardFloating: a success calls nothing', async () => {
  const seen = [];
  guardFloating(Promise.resolve(1), (err) => seen.push(err));
  await sleep(10);
  assert.deepEqual(seen, []);
});
