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

const { delay, promisify, callbackify, series, parallel, once, deferred } = solution;

const task = (value, ms = 1) => (cb) => delay(ms, value, cb);
const failing = (message) => (cb) => delay(1, new Error(message), cb);

test('delay: calls back with the value', (t, done) => {
  delay(1, 'x', (err, value) => {
    assert.equal(err, null);
    assert.equal(value, 'x');
    done();
  });
});

test('delay: an Error value becomes the error', (t, done) => {
  delay(1, new Error('boom'), (err, value) => {
    assert.equal(err.message, 'boom');
    assert.equal(value, undefined);
    done();
  });
});

test('delay: is actually asynchronous', (t, done) => {
  let sync = true;
  delay(1, 'x', () => {
    assert.equal(sync, false, 'the callback must not fire synchronously');
    done();
  });
  sync = false;
});

test('promisify: resolves', async () => {
  assert.equal(await promisify(delay)(1, 'x'), 'x');
});

test('promisify: rejects on a callback error', async () => {
  await assert.rejects(() => promisify(delay)(1, new Error('boom')), /boom/);
});

test('callbackify: calls back with the resolved value', (t, done) => {
  callbackify(async (n) => n * 2)(5, (err, value) => {
    assert.equal(err, null);
    assert.equal(value, 10);
    done();
  });
});

test('callbackify: calls back with a rejection as the error', (t, done) => {
  callbackify(async () => { throw new Error('boom'); })((err, value) => {
    assert.equal(err.message, 'boom');
    assert.equal(value, undefined);
    done();
  });
});

test('series: results in order', (t, done) => {
  series([task('a'), task('b'), task('c')], (err, results) => {
    assert.equal(err, null);
    assert.deepEqual(results, ['a', 'b', 'c']);
    done();
  });
});

test('series: runs strictly one at a time', (t, done) => {
  const order = [];
  const step = (name, ms) => (cb) => {
    order.push(`${name}-start`);
    delay(ms, name, (e, v) => { order.push(`${name}-end`); cb(e, v); });
  };
  series([step('a', 5), step('b', 1)], () => {
    assert.deepEqual(order, ['a-start', 'a-end', 'b-start', 'b-end']);
    done();
  });
});

test('series: stops at the first error', (t, done) => {
  let ran = false;
  series([failing('boom'), (cb) => { ran = true; cb(null, 'never'); }], (err) => {
    assert.equal(err.message, 'boom');
    assert.equal(ran, false, 'later tasks must not run');
    done();
  });
});

test('series: empty array', (t, done) => {
  series([], (err, results) => {
    assert.equal(err, null);
    assert.deepEqual(results, []);
    done();
  });
});

test('parallel: results keep the original order', (t, done) => {
  parallel([task('slow', 10), task('fast', 1)], (err, results) => {
    assert.equal(err, null);
    assert.deepEqual(results, ['slow', 'fast'], 'order by position, not by finish time');
    done();
  });
});

test('parallel: really does overlap', (t, done) => {
  const started = [];
  const step = (name) => (cb) => { started.push(name); delay(5, name, cb); };
  parallel([step('a'), step('b')], () => {
    assert.deepEqual(started, ['a', 'b'], 'both must start before either finishes');
    done();
  });
});

test('parallel: reports an error once', (t, done) => {
  let calls = 0;
  parallel([failing('one'), failing('two')], (err) => {
    calls++;
    assert.ok(err);
    setTimeout(() => {
      assert.equal(calls, 1, 'the callback must fire exactly once');
      done();
    }, 20);
  });
});

test('parallel: empty array', (t, done) => {
  parallel([], (err, results) => {
    assert.equal(err, null);
    assert.deepEqual(results, []);
    done();
  });
});

test('once: only the first call goes through', () => {
  let calls = 0;
  const f = once(() => ++calls);
  assert.equal(f(), 1);
  assert.equal(f(), undefined);
  assert.equal(calls, 1);
});

test('deferred: never runs synchronously', async () => {
  const order = [];
  const f = deferred(() => order.push('fn'));
  f();
  order.push('after');
  await Promise.resolve();
  assert.deepEqual(order, ['after', 'fn']);
});

test('deferred: forwards arguments', async () => {
  let seen;
  deferred((a, b) => { seen = [a, b]; })(1, 2);
  await Promise.resolve();
  assert.deepEqual(seen, [1, 2]);
});
