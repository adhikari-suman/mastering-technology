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

const { intersectSlow, intersectFast, dedupeSlow, dedupeFast, time, compare, countOperations, memoizeWithStats } = solution;

test('both intersections agree', () => {
  const cases = [
    [[1, 2, 3], [2, 3, 4]],
    [[1, 2], [3, 4]],
    [[], [1]],
    [[1, 1, 2], [1, 2]],
  ];
  for (const [a, b] of cases) {
    assert.deepEqual(intersectSlow(a, b), intersectFast(a, b), `disagreed on ${JSON.stringify([a, b])}`);
  }
});

test('intersection: correct results', () => {
  assert.deepEqual(intersectFast([1, 2, 3], [2, 3, 4]), [2, 3]);
  assert.deepEqual(intersectFast([3, 1], [1, 3]), [3, 1], "a's order is preserved");
  assert.deepEqual(intersectFast([1, 1, 2], [1, 2]), [1, 2], 'no duplicates');
  assert.deepEqual(intersectFast([], []), []);
});

test('intersectFast is genuinely faster on a large input', () => {
  const a = Array.from({ length: 2000 }, (_, i) => i);
  const b = Array.from({ length: 2000 }, (_, i) => i + 1000);
  const result = compare(() => intersectSlow(a, b), () => intersectFast(a, b), 1);
  assert.equal(result.fasterIndex, 1, 'the O(n) version should win at this size');
});

test('both dedupes agree', () => {
  for (const input of [[1, 2, 1, 3], [], [1], ['a', 'a', 'b']]) {
    assert.deepEqual(dedupeSlow(input), dedupeFast(input));
  }
});

test('dedupe: order preserved', () => {
  assert.deepEqual(dedupeFast([3, 1, 3, 2, 1]), [3, 1, 2]);
});

test('time: shape of the result', () => {
  const result = time(() => 1 + 1, 10);
  assert.equal(typeof result.median, 'number');
  assert.ok(result.median >= 0);
  assert.equal(result.samples.length, 5);
  assert.equal(result.iterations, 10);
  assert.ok(result.samples.every((s) => typeof s === 'number'));
});

test('time: actually calls the function', () => {
  let calls = 0;
  time(() => { calls++; return calls; }, 10);
  assert.ok(calls >= 60, `warmup + 5 samples of 10 should be at least 60 calls, saw ${calls}`);
});

test('time: measures something slow as slower', () => {
  const spin = () => { let n = 0; for (let i = 0; i < 200000; i++) n += i; return n; };
  const slow = time(spin, 5);
  const fast = time(() => 1, 5);
  assert.ok(slow.median > fast.median, 'the busy function should measure slower');
});

test('compare: identifies the faster function', () => {
  const spin = () => { let n = 0; for (let i = 0; i < 200000; i++) n += i; return n; };
  const result = compare(spin, () => 1, 5);
  assert.equal(result.fasterIndex, 1);
  assert.ok(result.ratio >= 1, 'ratio is slower/faster');
  assert.equal(result.medians.length, 2);
});

test('countOperations: deterministic work counting', () => {
  assert.equal(countOperations((tick) => { for (const x of [1, 2, 3]) tick(); }), 3);
  assert.equal(countOperations(() => {}), 0);
});

test('countOperations: shows the complexity difference', () => {
  const a = [1, 2, 3, 4];
  const b = [3, 4, 5, 6];
  const slow = countOperations((tick) => {
    for (const x of a) for (const y of b) { tick(); if (x === y) break; }
  });
  const fast = countOperations((tick) => {
    const set = new Set();
    for (const y of b) { tick(); set.add(y); }
    for (const x of a) { tick(); set.has(x); }
  });
  assert.ok(fast < slow, `O(n+m)=${fast} should beat O(n*m)=${slow}`);
});

test('memoizeWithStats: counts hits and misses', () => {
  const double = memoizeWithStats((n) => n * 2);
  double(1); double(1); double(2);
  assert.deepEqual(double.stats, { hits: 1, misses: 2 });
});

test('memoizeWithStats: returns correct values and starts at zero', () => {
  const double = memoizeWithStats((n) => n * 2);
  assert.deepEqual(double.stats, { hits: 0, misses: 0 });
  assert.equal(double(5), 10);
  assert.equal(double(5), 10);
  assert.equal(double.stats.hits, 1);
});

test('memoizeWithStats: caches falsy results', () => {
  let calls = 0;
  const zero = memoizeWithStats(() => { calls++; return 0; });
  zero('k'); zero('k');
  assert.equal(calls, 1);
  assert.equal(zero.stats.hits, 1);
});
