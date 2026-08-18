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

const { loadHeavy, heavyLoadCount, loadLocale, tryImport, importAll, lazy } = solution;

test('the heavy module is NOT loaded just by importing solution.js', () => {
  assert.equal(heavyLoadCount(), 0, 'do not statically import the fixtures');
});

test('loadHeavy: returns the default export', async () => {
  const work = await loadHeavy();
  assert.equal(typeof work, 'function');
  assert.equal(work(2), 200);
});

test('loadHeavy: evaluates the module exactly once, however often it is called', async () => {
  await loadHeavy();
  await loadHeavy();
  await loadHeavy();
  assert.equal(heavyLoadCount(), 1, 'import() is cached — the body runs once');
});

test('loadLocale: computed specifiers', async () => {
  assert.equal((await loadLocale('en')).greeting, 'Hello');
  assert.equal((await loadLocale('fr')).greeting, 'Bonjour');
  assert.equal((await loadLocale('fr')).farewell, 'Au revoir');
});

test('tryImport: succeeds normally', async () => {
  const ns = await tryImport('./fixtures/en.js');
  assert.ok(ns);
  assert.equal(ns.default.greeting, 'Hello');
});

test('tryImport: a missing module gives null', async () => {
  assert.equal(await tryImport('./fixtures/does-not-exist.js'), null);
});

test('tryImport: a module that throws while evaluating gives null', async () => {
  assert.equal(await tryImport('./fixtures/broken.js'), null);
});

test('importAll: parallel, order preserved', async () => {
  const [en, fr] = await importAll(['./fixtures/en.js', './fixtures/fr.js']);
  assert.equal(en.default.greeting, 'Hello');
  assert.equal(fr.default.greeting, 'Bonjour');
});

test('importAll: empty input', async () => {
  assert.deepEqual(await importAll([]), []);
});

test('lazy: resolves the named export', async () => {
  const getGreeting = lazy('./fixtures/en.js', 'default');
  assert.equal((await getGreeting()).greeting, 'Hello');
});

test('lazy: does not import until called', async () => {
  let started = false;
  const original = heavyLoadCount();
  const getWork = lazy('./fixtures/heavy.js', 'default');
  started = true;
  assert.equal(heavyLoadCount(), original, 'creating the lazy loader imports nothing');
  assert.equal((await getWork())(1), 100);
  assert.ok(started);
});

test('lazy: reuses the same import across calls', async () => {
  const getWork = lazy('./fixtures/heavy.js', 'default');
  const [a, b] = await Promise.all([getWork(), getWork()]);
  assert.equal(a, b, 'the same function object both times');
  assert.equal(heavyLoadCount(), 1);
});
