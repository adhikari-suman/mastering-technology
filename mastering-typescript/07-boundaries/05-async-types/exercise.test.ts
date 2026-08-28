import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import {
  TimeoutError, withTimeout, mapAsync, forEachAsync, settle, retry,
} from './solution.ts';
import type { Cancellable, Result } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Cancellable = Expect<Equal<Cancellable<number>, (signal: AbortSignal) => Promise<number>>>;

// An async function's return type is the OUTER promise.
type _Timeout = Expect<Equal<ReturnType<typeof withTimeout<number>>, Promise<number>>>;
type _Awaited = Expect<Equal<Awaited<ReturnType<typeof withTimeout<number>>>, number>>;

function _typeOnly() {
  // The callback must accept both a sync and an async function...
  forEachAsync([1], () => {});
  forEachAsync([1], async () => { await Promise.resolve(); });

  // ...and the async one must be awaitable, which `=> void` alone would not be.
  type Callback = Parameters<typeof forEachAsync<number>>[1];
  type _Callback = Expect<
    Equal<Callback, (item: number, index: number) => void | Promise<void>>
  >;

  // Promises are covariant, and SOUNDLY so — there is no way to write into one.
  const dogs: Promise<{ legs: number; bark(): void }> = Promise.resolve({
    legs: 4, bark() {},
  });
  const animals: Promise<{ legs: number }> = dogs;

  // Arrays are covariant too — but unsoundly, since you can write into one.
  // TypeScript allows this deliberately; Part 08 Lesson 02 collects the rest.
  const dogArray: { legs: number; bark(): void }[] = [];
  const animalArray: { legs: number }[] = dogArray;
  animalArray.push({ legs: 2 });   // a "dog" with no bark is now in dogArray
}

/* ---------------------------------------------------------------- runtime */

const later = <T>(value: T, ms: number): Promise<T> =>
  new Promise((resolve) => { setTimeout(() => resolve(value), ms); });

test('withTimeout: the work wins', async () => {
  assert.equal(await withTimeout(async () => 1, 50), 1);
});

test('withTimeout: the deadline wins', async () => {
  await assert.rejects(
    () => withTimeout(() => later(1, 100), 10),
    { name: 'TimeoutError', message: 'timed out after 10ms' },
  );
});

test('withTimeout aborts the signal when it times out', async () => {
  let aborted = false;
  await assert.rejects(() =>
    withTimeout((signal) => {
      signal.addEventListener('abort', () => { aborted = true; });
      return later(1, 100);
    }, 10),
  TimeoutError);
  assert.equal(aborted, true, 'the work was told to stop');
});

test('withTimeout propagates the work\'s own error', async () => {
  await assert.rejects(
    () => withTimeout(async () => { throw new Error('inner'); }, 50),
    { message: 'inner' },
  );
});

test('withTimeout clears its timer', async () => {
  // A timer left pending keeps the event loop alive. Forget the cleanup and
  // this file takes two extra seconds to exit — which is the symptom you would
  // see in a real process, scaled down.
  assert.equal(await withTimeout(async () => 'done', 2000), 'done');
});

test('mapAsync preserves order', async () => {
  assert.deepEqual(await mapAsync([1, 2, 3], async (n) => n * 2), [2, 4, 6]);
  assert.deepEqual(await mapAsync([], async (n: number) => n), []);
});

test('mapAsync is sequential', async () => {
  const order: number[] = [];
  await mapAsync([30, 10, 1], async (ms, i) => {
    await later(null, ms);
    order.push(i);
    return i;
  });
  assert.deepEqual(order, [0, 1, 2], 'each waited for the last');
});

test('mapAsync passes the index and rejects on the first error', async () => {
  assert.deepEqual(await mapAsync(['a', 'b'], async (s, i) => `${s}${i}`), ['a0', 'b1']);
  await assert.rejects(
    () => mapAsync([1, 2], async (n) => { if (n === 2) throw new Error('two'); return n; }),
    { message: 'two' },
  );
});

test('forEachAsync awaits an async callback', async () => {
  const seen: number[] = [];
  await forEachAsync([1, 2, 3], async (n) => {
    await later(null, 1);
    seen.push(n);
  });
  assert.deepEqual(seen, [1, 2, 3], 'all three finished before we got here');
});

test('forEachAsync accepts a sync callback too', async () => {
  const seen: number[] = [];
  await forEachAsync([1, 2], (n, i) => { seen.push(n + i); });
  assert.deepEqual(seen, [1, 3]);
});

test('settle reports every outcome, in order', async () => {
  const results = await settle([
    Promise.resolve(1),
    Promise.reject(new Error('x')),
    Promise.resolve(3),
  ]);
  assert.equal(results.length, 3);
  assert.deepEqual(results[0], { ok: true, value: 1 });
  assert.equal(results[1]?.ok, false);
  assert.deepEqual(results[2], { ok: true, value: 3 });
});

test('settle never rejects', async () => {
  await assert.doesNotReject(() => settle([Promise.reject('nope')]));
  assert.deepEqual(await settle([]), []);
});

test('settle runs concurrently', async () => {
  const started = Date.now();
  await settle([later(1, 30), later(2, 30), later(3, 30)]);
  assert.ok(Date.now() - started < 80, 'not one after another');
});

test('retry returns the first success', async () => {
  let calls = 0;
  const value = await retry(async () => {
    calls++;
    if (calls < 3) throw new Error('again');
    return 'ok';
  }, 5, new AbortController().signal);
  assert.equal(value, 'ok');
  assert.equal(calls, 3);
});

test('retry gives up after the last attempt, with that error', async () => {
  let calls = 0;
  await assert.rejects(
    () => retry(async () => { calls++; throw new Error(`fail ${calls}`); }, 3,
      new AbortController().signal),
    { message: 'fail 3' },
  );
  assert.equal(calls, 3);
});

test('retry stops when the signal is already aborted', async () => {
  const controller = new AbortController();
  controller.abort(new Error('cancelled'));
  let calls = 0;
  await assert.rejects(
    () => retry(async () => { calls++; return 1; }, 3, controller.signal),
    { message: 'cancelled' },
  );
  assert.equal(calls, 0, 'never even tried');
});

test('retry rejects a nonsense attempt count', async () => {
  // Not `assert.throws`: an async function converts every throw into a
  // rejection, so there is no synchronous failure to catch.
  await assert.rejects(
    () => retry(async () => 1, 0, new AbortController().signal),
    RangeError,
  );
  await assert.rejects(
    () => retry(async () => 1, -1, new AbortController().signal),
    RangeError,
  );
});
