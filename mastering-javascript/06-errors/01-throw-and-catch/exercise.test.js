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
  attempt, normaliseError, withCleanup, swallowsError,
  rethrowWithContext, causeChain, isErrorLike,
} = solution;

test('attempt: success', () => {
  assert.deepEqual(attempt(() => 42), [null, 42]);
  assert.deepEqual(attempt(() => 0), [null, 0], 'a falsy value is still success');
});

test('attempt: failure', () => {
  const [err, value] = attempt(() => { throw new Error('boom'); });
  assert.equal(err.message, 'boom');
  assert.equal(value, null);
});

test('attempt: normalises a thrown string', () => {
  const [err] = attempt(() => { throw 'just a string'; });
  assert.ok(err instanceof Error);
  assert.equal(err.message, 'just a string');
});

test('normaliseError', () => {
  const original = new Error('keep me');
  assert.equal(normaliseError(original), original, 'an Error passes through unchanged');
  assert.ok(normaliseError('boom') instanceof Error);
  assert.equal(normaliseError('boom').message, 'boom');
  assert.equal(normaliseError(42).message, '42');
  assert.ok(normaliseError(null) instanceof Error);
});

test('normaliseError: a TypeError stays a TypeError', () => {
  const original = new TypeError('typed');
  assert.equal(normaliseError(original), original);
});

test('withCleanup: runs cleanup on success and returns the value', () => {
  let cleaned = false;
  assert.equal(withCleanup(() => 'v', () => { cleaned = true; }), 'v');
  assert.equal(cleaned, true);
});

test('withCleanup: runs cleanup on failure and rethrows', () => {
  let cleaned = false;
  assert.throws(
    () => withCleanup(() => { throw new Error('boom'); }, () => { cleaned = true; }),
    /boom/,
  );
  assert.equal(cleaned, true, 'cleanup must run even when fn throws');
});

test('withCleanup: cleanup does not swallow the error', () => {
  assert.throws(() => withCleanup(() => { throw new Error('boom'); }, () => 'ignored'), /boom/);
});

test('swallowsError: the finally-return trap', () => {
  assert.equal(swallowsError(), 'swallowed', 'returning from finally discards the error');
});

test('rethrowWithContext: wraps with cause', () => {
  assert.throws(
    () => rethrowWithContext(() => { throw new Error('inner'); }, 'outer'),
    (err) => {
      assert.equal(err.message, 'outer');
      assert.equal(err.cause.message, 'inner');
      return true;
    },
  );
});

test('rethrowWithContext: passes success through', () => {
  assert.equal(rethrowWithContext(() => 'fine', 'outer'), 'fine');
});

test('causeChain: walks to the root', () => {
  const root = new Error('root');
  const middle = new Error('middle', { cause: root });
  const top = new Error('top', { cause: middle });
  assert.deepEqual(causeChain(top).map((e) => e.message), ['top', 'middle', 'root']);
});

test('causeChain: a lone error', () => {
  assert.deepEqual(causeChain(new Error('only')).map((e) => e.message), ['only']);
});

test('causeChain: survives a circular cause', () => {
  const a = new Error('a');
  const b = new Error('b', { cause: a });
  a.cause = b;
  const chain = causeChain(b);
  assert.ok(chain.length <= 2, 'must not loop forever');
});

test('isErrorLike', () => {
  assert.equal(isErrorLike(new Error('x')), true);
  assert.equal(isErrorLike(new TypeError('x')), true);
  assert.equal(isErrorLike({ name: 'Error', message: 'faked' }), true, 'duck-typed across realms');
  assert.equal(isErrorLike({ message: 'no name' }), false);
  assert.equal(isErrorLike('string'), false);
  assert.equal(isErrorLike(null), false);
  assert.equal(isErrorLike(undefined), false);
});
