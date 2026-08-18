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

const { all, allSettled, race, any, abortableWait, mapLimit } = solution;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const later = (ms, value) => sleep(ms).then(() => value);
const failLater = (ms, message) => sleep(ms).then(() => { throw new Error(message); });

test('all: resolves in input order, not completion order', async () => {
  assert.deepEqual(await all([later(20, 'a'), later(1, 'b')]), ['a', 'b']);
});

test('all: accepts non-promise values', async () => {
  assert.deepEqual(await all([1, later(1, 2), 3]), [1, 2, 3]);
});

test('all: empty array', async () => {
  assert.deepEqual(await all([]), []);
});

test('all: rejects on the first failure', async () => {
  await assert.rejects(() => all([later(20, 'a'), failLater(1, 'boom')]), /boom/);
});

test('allSettled: reports both outcomes', async () => {
  const result = await allSettled([later(1, 'ok'), failLater(1, 'boom')]);
  assert.equal(result[0].status, 'fulfilled');
  assert.equal(result[0].value, 'ok');
  assert.equal(result[1].status, 'rejected');
  assert.equal(result[1].reason.message, 'boom');
});

test('allSettled: never rejects, and keeps order', async () => {
  const result = await allSettled([failLater(1, 'x'), later(20, 'y')]);
  assert.deepEqual(result.map((r) => r.status), ['rejected', 'fulfilled']);
});

test('allSettled: empty array', async () => {
  assert.deepEqual(await allSettled([]), []);
});

test('race: first to settle wins', async () => {
  assert.equal(await race([later(20, 'slow'), later(1, 'fast')]), 'fast');
});

test('race: a fast rejection wins too', async () => {
  await assert.rejects(() => race([later(20, 'slow'), failLater(1, 'boom')]), /boom/);
});

test('any: ignores rejections and takes the first fulfilment', async () => {
  assert.equal(await any([failLater(1, 'boom'), later(10, 'ok')]), 'ok');
});

test('any: all rejected gives an AggregateError with reasons in order', async () => {
  await assert.rejects(
    () => any([failLater(1, 'one'), failLater(5, 'two')]),
    (err) => {
      assert.ok(err instanceof AggregateError);
      assert.deepEqual(err.errors.map((e) => e.message), ['one', 'two']);
      return true;
    },
  );
});

test('any: empty array rejects', async () => {
  await assert.rejects(() => any([]), (err) => err instanceof AggregateError);
});

test('abortableWait: resolves when not aborted', async () => {
  await abortableWait(5);
  await abortableWait(5, new AbortController().signal);
});

test('abortableWait: rejects when aborted mid-flight', async () => {
  const controller = new AbortController();
  const promise = abortableWait(200, controller.signal);
  setTimeout(() => controller.abort(new Error('cancelled')), 5);
  await assert.rejects(() => promise, /cancelled/);
});

test('abortableWait: rejects immediately if already aborted', async () => {
  const controller = new AbortController();
  controller.abort(new Error('already'));
  const start = Date.now();
  await assert.rejects(() => abortableWait(500, controller.signal), /already/);
  assert.ok(Date.now() - start < 100, 'must not wait out the timer');
});

test('mapLimit: results in order', async () => {
  assert.deepEqual(await mapLimit([1, 2, 3, 4], 2, async (n) => n * 2), [2, 4, 6, 8]);
});

test('mapLimit: never exceeds the limit', async () => {
  let inFlight = 0;
  let peak = 0;
  await mapLimit([1, 2, 3, 4, 5, 6], 2, async (n) => {
    inFlight++;
    peak = Math.max(peak, inFlight);
    await sleep(5);
    inFlight--;
    return n;
  });
  assert.ok(peak <= 2, `at most 2 should run at once, saw ${peak}`);
  assert.equal(peak, 2, 'and it should actually reach the limit');
});

test('mapLimit: empty input, and limit above length', async () => {
  assert.deepEqual(await mapLimit([], 2, async (n) => n), []);
  assert.deepEqual(await mapLimit([1, 2], 10, async (n) => n), [1, 2]);
});

test('mapLimit: rejects on failure', async () => {
  await assert.rejects(
    () => mapLimit([1, 2, 3], 2, async (n) => { if (n === 2) throw new Error('boom'); return n; }),
    /boom/,
  );
});
