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

const { resolveExport, isExported, listPublicSubpaths, resolveInternal, matchWildcard } = solution;

const simple = { exports: { '.': './index.js', './utils': './dist/utils.js' } };
const dual = {
  exports: {
    '.': { types: './index.d.ts', import: './esm/index.js', require: './cjs/index.cjs', default: './esm/index.js' },
  },
};
const wild = { exports: { './features/*': './dist/features/*.js' } };
const legacy = { main: './index.js' };

test('matchWildcard', () => {
  assert.equal(
    matchWildcard('./features/*', './dist/features/*.js', './features/auth'),
    './dist/features/auth.js',
  );
  assert.equal(matchWildcard('./features/*', './dist/*.js', './other/auth'), null);
  assert.equal(matchWildcard('./a/*', './b/*', './a/x/y'), './b/x/y', 'the star spans slashes');
});

test('resolveExport: plain string entries', () => {
  assert.equal(resolveExport(simple, '.'), './index.js');
  assert.equal(resolveExport(simple, './utils'), './dist/utils.js');
});

test('resolveExport: unlisted subpaths are blocked', () => {
  assert.equal(resolveExport(simple, './internal'), null);
  assert.equal(resolveExport(simple, './dist/utils.js'), null, 'the real path is not public');
});

test('resolveExport: exports as a bare string', () => {
  assert.equal(resolveExport({ exports: './index.js' }, '.'), './index.js');
  assert.equal(resolveExport({ exports: './index.js' }, './other'), null);
});

test('resolveExport: conditions, first match wins', () => {
  assert.equal(resolveExport(dual, '.', ['import']), './esm/index.js');
  assert.equal(resolveExport(dual, '.', ['require']), './cjs/index.cjs');
  assert.equal(resolveExport(dual, '.', ['types']), './index.d.ts');
});

test('resolveExport: default is the fallback', () => {
  assert.equal(resolveExport(dual, '.', []), './esm/index.js');
  assert.equal(resolveExport(dual, '.', ['browser']), './esm/index.js');
});

test('resolveExport: condition ORDER in the map wins, not the caller order', () => {
  assert.equal(
    resolveExport(dual, '.', ['require', 'import']),
    './esm/index.js',
    'the caller asked for require first, but the MAP lists import first — the map wins',
  );
});

test('resolveExport: nested conditions', () => {
  const nested = { exports: { '.': { node: { import: './node-esm.js', default: './node-cjs.js' }, default: './browser.js' } } };
  assert.equal(resolveExport(nested, '.', ['node', 'import']), './node-esm.js');
  assert.equal(resolveExport(nested, '.', ['node']), './node-cjs.js');
  assert.equal(resolveExport(nested, '.', ['browser']), './browser.js');
});

test('resolveExport: no matching condition gives null', () => {
  const strict = { exports: { '.': { import: './esm.js' } } };
  assert.equal(resolveExport(strict, '.', ['require']), null);
});

test('resolveExport: wildcards', () => {
  assert.equal(resolveExport(wild, './features/auth'), './dist/features/auth.js');
  assert.equal(resolveExport(wild, './features/db'), './dist/features/db.js');
  assert.equal(resolveExport(wild, './other'), null);
});

test('resolveExport: legacy main, everything permitted', () => {
  assert.equal(resolveExport(legacy, '.'), './index.js');
  assert.equal(resolveExport(legacy, './src/internal.js'), './src/internal.js');
  assert.equal(resolveExport({}, '.'), null, 'no main and no exports');
});

test('isExported', () => {
  assert.equal(isExported(simple, '.'), true);
  assert.equal(isExported(simple, './utils'), true);
  assert.equal(isExported(simple, './internal'), false);
  assert.equal(isExported(wild, './features/anything'), true);
  assert.equal(isExported(legacy, './anything-at-all'), true, 'no exports field means no boundary');
});

test('listPublicSubpaths', () => {
  assert.deepEqual(listPublicSubpaths(simple), ['.', './utils']);
  assert.deepEqual(listPublicSubpaths(wild), ['./features/*']);
  assert.deepEqual(listPublicSubpaths(legacy), []);
  assert.deepEqual(listPublicSubpaths({ exports: './index.js' }), ['.']);
});

test('resolveInternal', () => {
  const pkg = { imports: { '#config': './src/config.js', '#env': { node: './src/env.node.js', default: './src/env.js' } } };
  assert.equal(resolveInternal(pkg, '#config'), './src/config.js');
  assert.equal(resolveInternal(pkg, '#env', ['node']), './src/env.node.js');
  assert.equal(resolveInternal(pkg, '#env', []), './src/env.js');
  assert.equal(resolveInternal(pkg, '#missing'), null);
  assert.equal(resolveInternal({}, '#config'), null);
});
