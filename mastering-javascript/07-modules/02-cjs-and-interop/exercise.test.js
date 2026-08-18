import test from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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

const { loadLegacy, loadLegacyDefault, cjsCopiesValues, moduleDir, moduleFile, resolveRelative, moduleTypeOf } = solution;
const here = dirname(fileURLToPath(import.meta.url));

test('loadLegacy: reads module.exports', () => {
  const legacy = loadLegacy();
  assert.equal(legacy.name, 'legacy');
  assert.equal(typeof legacy.increment, 'function');
});

test('loadLegacyDefault: a function assigned to module.exports', () => {
  const double = loadLegacyDefault();
  assert.equal(typeof double, 'function');
  assert.equal(double(5), 10);
});

test('cjsCopiesValues: require caches, so state is shared', () => {
  const result = cjsCopiesValues();
  assert.equal(result.sameObject, true, 'require returns the cached module.exports');
  assert.equal(result.countFromSecond, 1, 'the increment is visible through both');
});

test('moduleDir: this lesson folder', () => {
  assert.equal(moduleDir(), here);
});

test('moduleFile: this solution file', () => {
  assert.equal(moduleFile(), join(here, 'solution.js'));
});

test('resolveRelative', () => {
  assert.equal(resolveRelative('fixtures/legacy.cjs'), join(here, 'fixtures/legacy.cjs'));
  assert.equal(resolveRelative('a.js'), join(here, 'a.js'));
});

test('moduleTypeOf: extensions decide', () => {
  assert.equal(moduleTypeOf('a.mjs'), 'esm');
  assert.equal(moduleTypeOf('a.cjs'), 'commonjs');
  assert.equal(moduleTypeOf('a.mjs', 'commonjs'), 'esm', 'the extension wins');
  assert.equal(moduleTypeOf('a.cjs', 'module'), 'commonjs');
});

test('moduleTypeOf: .js follows package type', () => {
  assert.equal(moduleTypeOf('a.js', 'module'), 'esm');
  assert.equal(moduleTypeOf('a.js', 'commonjs'), 'commonjs');
  assert.equal(moduleTypeOf('a.js'), 'commonjs', 'absent type means commonjs');
});
