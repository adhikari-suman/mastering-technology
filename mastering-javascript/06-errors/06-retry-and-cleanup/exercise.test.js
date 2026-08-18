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

const { isTransient, exponentialDelay, retryWithBackoff, circuitBreaker, withResource, withResources } = solution;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const withCode = (code) => Object.assign(new Error(code), { code });
const withStatus = (status) => Object.assign(new Error(`HTTP ${status}`), { status });

test('isTransient: retryable codes and statuses', () => {
  assert.equal(isTransient(withCode('ETIMEDOUT')), true);
  assert.equal(isTransient(withCode('ECONNRESET')), true);
  assert.equal(isTransient(withCode('ECONNREFUSED')), true);
  assert.equal(isTransient(withStatus(429)), true);
  assert.equal(isTransient(withStatus(500)), true);
  assert.equal(isTransient(withStatus(503)), true);
});

test('isTransient: permanent failures', () => {
  assert.equal(isTransient(withStatus(400)), false);
  assert.equal(isTransient(withStatus(404)), false);
  assert.equal(isTransient(new Error('plain')), false);
  assert.equal(isTransient(withCode('ENOENT')), false);
});

test('exponentialDelay doubles', () => {
  assert.equal(exponentialDelay(0, 100), 100);
  assert.equal(exponentialDelay(1, 100), 200);
  assert.equal(exponentialDelay(2, 100), 400);
  assert.equal(exponentialDelay(3, 10), 80);
});

test('retryWithBackoff: succeeds first time', async () => {
  let calls = 0;
  assert.equal(await retryWithBackoff(async () => { calls++; return 'ok'; }), 'ok');
  assert.equal(calls, 1);
});

test('retryWithBackoff: retries then succeeds', async () => {
  let calls = 0;
  const flaky = async () => {
    calls++;
    if (calls < 3) throw withCode('ETIMEDOUT');
    return 'ok';
  };
  assert.equal(await retryWithBackoff(flaky, { attempts: 5, base: 1 }), 'ok');
  assert.equal(calls, 3);
});

test('retryWithBackoff: gives up with the last error', async () => {
  let calls = 0;
  const always = async () => { calls++; throw new Error(`fail ${calls}`); };
  await assert.rejects(() => retryWithBackoff(always, { attempts: 3, base: 1 }), /fail 3/);
  assert.equal(calls, 3, 'attempts counts total calls');
});

test('retryWithBackoff: shouldRetry stops it early', async () => {
  let calls = 0;
  const permanent = async () => { calls++; throw withStatus(404); };
  await assert.rejects(
    () => retryWithBackoff(permanent, { attempts: 5, base: 1, shouldRetry: isTransient }),
    /404/,
  );
  assert.equal(calls, 1, 'a permanent error must not be retried');
});

test('retryWithBackoff: onRetry sees each failure', async () => {
  const seen = [];
  await assert.rejects(() => retryWithBackoff(
    async () => { throw new Error('x'); },
    { attempts: 3, base: 1, onRetry: (err, attempt) => seen.push(attempt) },
  ));
  assert.deepEqual(seen, [0, 1], 'called before each retry, not after the last failure');
});

test('retryWithBackoff: actually waits between attempts', async () => {
  const start = Date.now();
  await assert.rejects(() => retryWithBackoff(
    async () => { throw new Error('x'); },
    { attempts: 3, base: 20 },
  ));
  assert.ok(Date.now() - start >= 55, 'should wait 20 + 40 = 60ms');
});

test('circuitBreaker: passes calls through while closed', async () => {
  const breaker = circuitBreaker(async (n) => n * 2);
  assert.equal(await breaker(5), 10);
  assert.equal(breaker.state, 'closed');
});

test('circuitBreaker: opens after the threshold', async () => {
  let calls = 0;
  const breaker = circuitBreaker(async () => { calls++; throw new Error('down'); }, { threshold: 2 });
  await assert.rejects(() => breaker());
  await assert.rejects(() => breaker());
  assert.equal(breaker.state, 'open');
  await assert.rejects(() => breaker(), /circuit open/);
  assert.equal(calls, 2, 'an open circuit must not call fn');
});

test('circuitBreaker: a success resets the failure count', async () => {
  let shouldFail = true;
  const breaker = circuitBreaker(
    async () => { if (shouldFail) throw new Error('down'); return 'ok'; },
    { threshold: 3 },
  );
  await assert.rejects(() => breaker());
  await assert.rejects(() => breaker());
  shouldFail = false;
  assert.equal(await breaker(), 'ok');
  shouldFail = true;
  await assert.rejects(() => breaker());
  await assert.rejects(() => breaker());
  assert.equal(breaker.state, 'closed', 'the success reset the count');
});

test('circuitBreaker: half-opens after the cooldown, then closes on success', async () => {
  let shouldFail = true;
  const breaker = circuitBreaker(
    async () => { if (shouldFail) throw new Error('down'); return 'ok'; },
    { threshold: 1, cooldown: 20 },
  );
  await assert.rejects(() => breaker());
  assert.equal(breaker.state, 'open');
  await sleep(30);
  assert.equal(breaker.state, 'half-open');
  shouldFail = false;
  assert.equal(await breaker(), 'ok');
  assert.equal(breaker.state, 'closed');
});

test('circuitBreaker: a failure in half-open re-opens it', async () => {
  const breaker = circuitBreaker(async () => { throw new Error('down'); }, { threshold: 1, cooldown: 20 });
  await assert.rejects(() => breaker());
  await sleep(30);
  await assert.rejects(() => breaker(), /down/);
  assert.equal(breaker.state, 'open');
});

test('withResource: releases on success', async () => {
  let released = false;
  const acquire = async () => ({ value: 'r', release: async () => { released = true; } });
  assert.equal(await withResource(acquire, async (r) => r.value), 'r');
  assert.equal(released, true);
});

test('withResource: releases on failure and rethrows', async () => {
  let released = false;
  const acquire = async () => ({ release: async () => { released = true; } });
  await assert.rejects(() => withResource(acquire, async () => { throw new Error('boom'); }), /boom/);
  assert.equal(released, true);
});

test("withResource: a failing release does not mask use's error", async () => {
  const acquire = async () => ({ release: async () => { throw new Error('release failed'); } });
  await assert.rejects(
    () => withResource(acquire, async () => { throw new Error('original'); }),
    /original/,
  );
});

test('withResources: releases in reverse order', async () => {
  const released = [];
  const make = (name) => async () => ({ name, release: async () => { released.push(name); } });
  await withResources([make('a'), make('b'), make('c')], async (rs) => rs.map((r) => r.name));
  assert.deepEqual(released, ['c', 'b', 'a']);
});

test('withResources: hands the resources to use', async () => {
  const make = (name) => async () => ({ name, release: async () => {} });
  assert.deepEqual(
    await withResources([make('a'), make('b')], async (rs) => rs.map((r) => r.name)),
    ['a', 'b'],
  );
});

test('withResources: a failed acquire still releases what was acquired', async () => {
  const released = [];
  const good = (name) => async () => ({ name, release: async () => { released.push(name); } });
  const bad = async () => { throw new Error('acquire failed'); };
  await assert.rejects(() => withResources([good('a'), bad], async () => 'x'), /acquire failed/);
  assert.deepEqual(released, ['a']);
});

test('withResources: one failing release still attempts the rest', async () => {
  const released = [];
  const make = (name, fails) => async () => ({
    name,
    release: async () => { if (fails) throw new Error('nope'); released.push(name); },
  });
  await withResources([make('a', false), make('b', true)], async () => 'x').catch(() => {});
  assert.deepEqual(released, ['a'], 'a must still be released after b failed');
});
