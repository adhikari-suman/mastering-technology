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

const { reactive, effect, computed, stop, batch, dependencyCount } = solution;

test('reactive: behaves like the original object', () => {
  const state = reactive({ a: 1 });
  assert.equal(state.a, 1);
  state.a = 2;
  assert.equal(state.a, 2);
  state.b = 3;
  assert.equal(state.b, 3);
  assert.deepEqual(Object.keys(state), ['a', 'b']);
});

test('effect: runs immediately', () => {
  const runs = [];
  effect(() => runs.push('ran'));
  assert.deepEqual(runs, ['ran']);
});

test('effect: re-runs when a dependency changes', () => {
  const state = reactive({ count: 0 });
  const seen = [];
  effect(() => seen.push(state.count));
  state.count = 1;
  state.count = 2;
  assert.deepEqual(seen, [0, 1, 2]);
});

test('effect: ignores properties it never read', () => {
  const state = reactive({ count: 0, other: 'x' });
  let runs = 0;
  effect(() => { state.count; runs++; });
  state.other = 'changed';
  assert.equal(runs, 1, 'only the properties actually read create a dependency');
});

test('effect: an unchanged write triggers nothing', () => {
  const state = reactive({ count: 0 });
  let runs = 0;
  effect(() => { state.count; runs++; });
  state.count = 0;
  assert.equal(runs, 1, 'use Object.is to compare before triggering');
});

test('effect: NaN is not a change', () => {
  const state = reactive({ n: NaN });
  let runs = 0;
  effect(() => { state.n; runs++; });
  state.n = NaN;
  assert.equal(runs, 1, 'Object.is(NaN, NaN) is true — === would get this wrong');
});

test('effect: several effects on one property all re-run', () => {
  const state = reactive({ count: 0 });
  const seen = [];
  effect(() => seen.push(`a${state.count}`));
  effect(() => seen.push(`b${state.count}`));
  state.count = 1;
  assert.deepEqual(seen, ['a0', 'b0', 'a1', 'b1']);
});

test('effect: the runner re-runs manually and returns the value', () => {
  const state = reactive({ count: 5 });
  const runner = effect(() => state.count * 2);
  assert.equal(runner(), 10);
});

test('effect: dependencies are re-collected each run', () => {
  const state = reactive({ useA: true, a: 1, b: 2 });
  let runs = 0;
  effect(() => { runs++; return state.useA ? state.a : state.b; });
  assert.equal(runs, 1);
  state.b = 20;
  assert.equal(runs, 1, 'b was never read yet');
  state.useA = false;
  assert.equal(runs, 2);
  state.a = 10;
  assert.equal(runs, 2, 'a is no longer read, so it must no longer trigger');
  state.b = 200;
  assert.equal(runs, 3, 'b is read now');
});

test('effect: nested effects do not clobber each other', () => {
  const state = reactive({ outer: 0, inner: 0 });
  let outerRuns = 0;
  let innerRuns = 0;
  effect(() => {
    outerRuns++;
    state.outer;
    effect(() => { innerRuns++; state.inner; });
  });
  state.outer = 1;
  assert.equal(outerRuns, 2);
  const before = innerRuns;
  state.inner = 1;
  assert.ok(innerRuns > before, 'the inner effect still tracks its own dependency');
});

test('effect: a throwing effect restores tracking state', () => {
  const state = reactive({ a: 1 });
  let shouldThrow = true;
  // Throws on its first run only, so it does not poison later triggers.
  assert.throws(
    () => effect(() => { state.a; if (shouldThrow) { shouldThrow = false; throw new Error('boom'); } }),
    /boom/,
  );
  let runs = 0;
  effect(() => { state.a; runs++; });
  state.a = 2;
  assert.equal(runs, 2, 'tracking must still work after an effect threw');
});

test('deleteProperty triggers effects', () => {
  const state = reactive({ a: 1 });
  let runs = 0;
  effect(() => { state.a; runs++; });
  delete state.a;
  assert.equal(runs, 2);
});

test('computed: derives a value', () => {
  const state = reactive({ count: 2 });
  const double = computed(() => state.count * 2);
  assert.equal(double.value, 4);
  state.count = 5;
  assert.equal(double.value, 10);
});

test('computed: does not recompute when nothing changed', () => {
  const state = reactive({ count: 2 });
  let computations = 0;
  const double = computed(() => { computations++; return state.count * 2; });
  double.value;
  double.value;
  double.value;
  assert.equal(computations, 1, 'cache until a dependency changes');
});

test('stop: the effect no longer re-runs', () => {
  const state = reactive({ count: 0 });
  let runs = 0;
  const runner = effect(() => { state.count; runs++; });
  state.count = 1;
  assert.equal(runs, 2);
  stop(runner);
  state.count = 2;
  assert.equal(runs, 2, 'stopped effects stay stopped');
});

test('stop: removes it from the dependency graph', () => {
  const raw = { count: 0 };
  const state = reactive(raw);
  const runner = effect(() => { state.count; });
  assert.equal(dependencyCount(state, 'count'), 1);
  stop(runner);
  assert.equal(dependencyCount(state, 'count'), 0);
});

test('dependencyCount: counts subscribers', () => {
  const state = reactive({ a: 0, b: 0 });
  assert.equal(dependencyCount(state, 'a'), 0);
  effect(() => { state.a; });
  effect(() => { state.a; });
  effect(() => { state.b; });
  assert.equal(dependencyCount(state, 'a'), 2);
  assert.equal(dependencyCount(state, 'b'), 1);
  assert.equal(dependencyCount(state, 'missing'), 0);
});

test('batch: several writes cause one re-run', () => {
  const state = reactive({ a: 0, b: 0 });
  let runs = 0;
  effect(() => { state.a; state.b; runs++; });
  assert.equal(runs, 1);
  batch(() => { state.a = 1; state.b = 2; });
  assert.equal(runs, 2, 'two writes, one re-run');
});

test('batch: returns the value and flushes on throw', () => {
  const state = reactive({ a: 0 });
  assert.equal(batch(() => 'result'), 'result');
  let runs = 0;
  effect(() => { state.a; runs++; });
  assert.throws(() => batch(() => { state.a = 1; throw new Error('boom'); }), /boom/);
  assert.equal(runs, 2, 'pending effects must still flush');
});

test('the whole thing works together', () => {
  const state = reactive({ first: 'Ada', last: 'Lovelace' });
  const full = computed(() => `${state.first} ${state.last}`);
  const log = [];
  effect(() => log.push(full.value));
  assert.deepEqual(log, ['Ada Lovelace']);
  batch(() => { state.first = 'Grace'; state.last = 'Hopper'; });
  assert.deepEqual(log, ['Ada Lovelace', 'Grace Hopper']);
});
