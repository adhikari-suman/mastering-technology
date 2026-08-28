import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import {
  esmGreeting, cjsShout, formatOf, candidatesFor, resolveSpecifier,
} from './solution.ts';
import type { Format, PackageType, Mode } from './solution.ts';

// Type-only imports of the fixtures, to assert on what each module shape gives.
import type { format as esmFormat } from './fixtures/greeter.ts';
import type legacy from './fixtures/legacy.cjs';

/* ------------------------------------------------------------------ types */

type _Format = Expect<Equal<Format, 'esm' | 'cjs'>>;
type _Mode = Expect<Equal<Mode, 'nodenext' | 'bundler'>>;
type _PackageType = Expect<Equal<PackageType, 'module' | 'commonjs'>>;

// The ESM fixture has named exports.
type _EsmFormat = Expect<Equal<typeof esmFormat, 'esm'>>;
// The CJS fixture is a single value reached as a default import.
type _CjsFormat = Expect<Equal<(typeof legacy)['format'], 'cjs'>>;
type _Shout = Expect<Equal<typeof legacy.shout, (text: string) => string>>;

/* ---------------------------------------------------------------- runtime */

test('the ESM fixture really loads', () => {
  assert.equal(esmGreeting('ada'), 'hello ada');
  assert.equal(esmGreeting(''), 'hello ');
});

test('the CommonJS fixture really loads', () => {
  assert.equal(cjsShout('hi'), 'HI!');
  assert.equal(cjsShout(''), '!');
});

test('formatOf: the extension wins where it is explicit', () => {
  assert.equal(formatOf('a.mjs', 'commonjs'), 'esm');
  assert.equal(formatOf('a.mts', 'commonjs'), 'esm');
  assert.equal(formatOf('a.cjs', 'module'), 'cjs');
  assert.equal(formatOf('a.cts', 'module'), 'cjs');
});

test('formatOf: an ambiguous extension defers to package type', () => {
  assert.equal(formatOf('a.ts', 'module'), 'esm');
  assert.equal(formatOf('a.ts', 'commonjs'), 'cjs');
  assert.equal(formatOf('a.js', 'module'), 'esm');
  assert.equal(formatOf('a.js', 'commonjs'), 'cjs');
  assert.equal(formatOf('a.tsx', 'module'), 'esm');
});

test('formatOf: paths, not just bare names', () => {
  assert.equal(formatOf('./deep/path/a.mjs', 'commonjs'), 'esm');
  assert.equal(formatOf('/abs/a.cjs', 'module'), 'cjs');
});

test('formatOf rejects an extension it does not know', () => {
  assert.throws(() => formatOf('a.json', 'module'), TypeError);
  assert.throws(() => formatOf('a', 'module'), TypeError);
});

test('candidatesFor: nodenext takes the specifier as written', () => {
  assert.deepEqual(candidatesFor('./a.js', 'nodenext'), ['./a.js']);
  assert.deepEqual(candidatesFor('./a', 'nodenext'), ['./a']);
});

test('candidatesFor: bundler guesses', () => {
  assert.deepEqual(candidatesFor('./a', 'bundler'), [
    './a', './a.ts', './a.tsx', './a.js', './a.jsx', './a/index.ts', './a/index.js',
  ]);
});

test('candidatesFor: an explicit extension is used as written in either mode', () => {
  assert.deepEqual(candidatesFor('./a.ts', 'bundler'), ['./a.ts']);
  assert.deepEqual(candidatesFor('./a.js', 'bundler'), ['./a.js']);
});

test('resolveSpecifier', () => {
  const files = new Set(['./a.ts', './b/index.js']);
  assert.equal(resolveSpecifier('./a', 'bundler', files), './a.ts');
  assert.equal(resolveSpecifier('./b', 'bundler', files), './b/index.js');
  assert.equal(resolveSpecifier('./a', 'nodenext', files), undefined);
  assert.equal(resolveSpecifier('./a.ts', 'nodenext', files), './a.ts');
  assert.equal(resolveSpecifier('./missing', 'bundler', files), undefined);
});

test('resolveSpecifier picks the first candidate, not the best one', () => {
  const files = new Set(['./a.js', './a.ts']);
  assert.equal(resolveSpecifier('./a', 'bundler', files), './a.ts', '.ts is tried first');
});
