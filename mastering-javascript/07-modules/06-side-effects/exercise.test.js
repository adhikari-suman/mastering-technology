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

const { loadPure, loadImpure, sideEffectLog, evaluationOrder, isPure, shouldShake, parseSideEffects } = solution;

test('importing solution.js causes no side effects', () => {
  assert.deepEqual(sideEffectLog(), [], 'do not statically import the impure fixture');
});

test('loadPure: works and stays silent', async () => {
  const add = await loadPure();
  assert.equal(add(2, 3), 5);
  assert.deepEqual(sideEffectLog(), [], 'a pure module leaves no trace');
});

test('loadImpure: the side effect happens on evaluation', async () => {
  assert.equal(await loadImpure(), 'impure');
  assert.deepEqual(sideEffectLog(), ['impure evaluated']);
});

test('loadImpure: the effect happens once, however many imports', async () => {
  await loadImpure();
  await loadImpure();
  assert.deepEqual(sideEffectLog(), ['impure evaluated'], 'modules are singletons');
});

test('evaluationOrder: dependencies first', async () => {
  assert.deepEqual(await evaluationOrder(), ['a', 'b']);
});

test('isPure: a pure function', () => {
  assert.deepEqual(isPure((a, b) => a + b, [1, 2]), { pure: true, result: 3 });
});

test('isPure: detects a global write', () => {
  const result = isPure(() => { globalThis.__testImpurity = 1; return 'done'; }, []);
  assert.equal(result.pure, false);
  assert.equal(result.result, 'done');
  assert.equal(globalThis.__testImpurity, undefined, 'clean up after yourself');
});

test('isPure: mutating an argument is not detected — and that is honest', () => {
  const arg = { n: 1 };
  assert.equal(isPure((o) => { o.n = 2; return o.n; }, [arg]).pure, true);
  assert.equal(arg.n, 2, 'this check only sees globals');
});

test('shouldShake', () => {
  assert.equal(shouldShake({ hasTopLevelSideEffects: false, isImportedForEffectOnly: false, exports: ['a'] }), true);
  assert.equal(shouldShake({ hasTopLevelSideEffects: true, isImportedForEffectOnly: false, exports: ['a'] }), false);
  assert.equal(shouldShake({ hasTopLevelSideEffects: false, isImportedForEffectOnly: true, exports: ['a'] }), false);
  assert.equal(shouldShake({ hasTopLevelSideEffects: false, isImportedForEffectOnly: false, exports: [] }), false);
});

test('parseSideEffects: absent means assume the worst', () => {
  assert.equal(parseSideEffects({}, 'src/a.js'), true);
});

test('parseSideEffects: booleans', () => {
  assert.equal(parseSideEffects({ sideEffects: false }, 'src/a.js'), false);
  assert.equal(parseSideEffects({ sideEffects: true }, 'src/a.js'), true);
});

test('parseSideEffects: an array of patterns', () => {
  const pkg = { sideEffects: ['./src/polyfills.js', '*.css'] };
  assert.equal(parseSideEffects(pkg, './src/polyfills.js'), true);
  assert.equal(parseSideEffects(pkg, 'src/styles.css'), true);
  assert.equal(parseSideEffects(pkg, './src/pure.js'), false);
  assert.equal(parseSideEffects({ sideEffects: [] }, 'anything.js'), false);
});
