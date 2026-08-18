import test from 'node:test';
import assert from 'node:assert/strict';

// Your answers live in solution.js, which you create yourself:
//     cp exercise.js solution.js
//
// It is loaded leniently so that a missing file surfaces as one clear
// failure instead of a module-load crash that hides every other test.
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
  makeSecret,
  once,
  memoize,
  makeAccumulator,
  captureLoopVar,
  createBank,
  limit,
} = solution;

test('makeSecret: get and set', () => {
  const s = makeSecret(1);
  assert.equal(s.get(), 1);
  s.set(9);
  assert.equal(s.get(), 9);
});

test('makeSecret: the value is not exposed as a property', () => {
  const s = makeSecret(42);
  assert.ok(
    !Object.values(s).includes(42),
    'the value must live in the closure, not on the returned object',
  );
});

test('makeSecret: instances are independent', () => {
  const a = makeSecret('a');
  const b = makeSecret('b');
  a.set('changed');
  assert.equal(b.get(), 'b');
});

test('once: runs the function a single time', () => {
  let calls = 0;
  const f = once(() => ++calls);
  f();
  f();
  f();
  assert.equal(calls, 1);
});

test('once: every call returns the first result', () => {
  let n = 0;
  const f = once(() => ++n);
  assert.equal(f(), 1);
  assert.equal(f(), 1);
});

test('once: passes the first call arguments through', () => {
  const f = once((a, b) => a + b);
  assert.equal(f(2, 3), 5);
  assert.equal(f(100, 100), 5, 'later arguments are ignored');
});

test('once: a falsy first result is still cached', () => {
  let calls = 0;
  const f = once(() => { calls++; return 0; });
  assert.equal(f(), 0);
  assert.equal(f(), 0);
  assert.equal(calls, 1, 'do not use the result itself as the "has run" flag');
});

test('memoize: repeated arguments do not re-run the function', () => {
  let calls = 0;
  const double = memoize((n) => { calls++; return n * 2; });
  assert.equal(double(2), 4);
  assert.equal(double(2), 4);
  assert.equal(calls, 1);
});

test('memoize: different arguments each run once', () => {
  let calls = 0;
  const double = memoize((n) => { calls++; return n * 2; });
  double(1); double(2); double(1); double(2);
  assert.equal(calls, 2);
});

test('memoize: caches a falsy result', () => {
  let calls = 0;
  const zero = memoize(() => { calls++; return 0; });
  zero('k'); zero('k');
  assert.equal(calls, 1);
});

test('memoize: separate memoized functions have separate caches', () => {
  let a = 0, b = 0;
  const f = memoize(() => ++a);
  const g = memoize(() => ++b);
  f('x'); g('x');
  assert.equal(a, 1);
  assert.equal(b, 1);
});

test('makeAccumulator: keeps a running total', () => {
  const add = makeAccumulator();
  assert.equal(add(5), 5);
  assert.equal(add(3), 8);
  assert.equal(add(-8), 0);
});

test('makeAccumulator: accumulators are independent', () => {
  const a = makeAccumulator();
  const b = makeAccumulator();
  a(10);
  assert.equal(b(1), 1);
});

test('captureLoopVar: each closure keeps its own index', () => {
  assert.deepEqual(captureLoopVar(), [0, 1, 2]);
});

test('createBank: deposits and withdrawals', () => {
  const acct = createBank(100);
  assert.equal(acct.getBalance(), 100);
  assert.equal(acct.deposit(50), 150);
  assert.equal(acct.withdraw(30), 120);
  assert.equal(acct.getBalance(), 120);
});

test('createBank: refuses to overdraw', () => {
  const acct = createBank(10);
  assert.equal(acct.withdraw(11), null);
  assert.equal(acct.getBalance(), 10, 'a refused withdrawal must not change the balance');
});

test('createBank: withdrawing the exact balance is allowed', () => {
  const acct = createBank(10);
  assert.equal(acct.withdraw(10), 0);
});

test('createBank: the balance is not reachable from outside', () => {
  const acct = createBank(100);
  assert.ok(
    !Object.values(acct).includes(100),
    'the balance must live in the closure, not on the returned object',
  );
});

test('createBank: accounts are independent', () => {
  const a = createBank(100);
  const b = createBank(100);
  a.withdraw(100);
  assert.equal(b.getBalance(), 100);
});

test('limit: allows exactly max calls', () => {
  let calls = 0;
  const f = limit(() => ++calls, 2);
  assert.equal(f(), 1);
  assert.equal(f(), 2);
  assert.equal(f(), undefined);
  assert.equal(calls, 2, 'fn must not run after the limit');
});

test('limit: max of 0 never calls fn', () => {
  let calls = 0;
  const f = limit(() => ++calls, 0);
  assert.equal(f(), undefined);
  assert.equal(calls, 0);
});

test('limit: passes arguments through', () => {
  const f = limit((a, b) => a * b, 1);
  assert.equal(f(3, 4), 12);
});
