import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { parseDiagnostic, rootCause, pathTo, summarise, classify } from './solution.ts';
import type { Diagnostic, Category } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Diagnostic = Expect<
  Equal<Diagnostic, { readonly message: string; readonly causes: readonly Diagnostic[] }>
>;
type _Classify = Expect<Equal<ReturnType<typeof classify>, Category>>;

function _typeOnly(diagnostic: Diagnostic) {
  // @ts-expect-error - a Diagnostic is readonly all the way down
  diagnostic.causes = [];
  // @ts-expect-error - including the message
  diagnostic.message = 'x';
}

/* ---------------------------------------------------------------- runtime */

const REAL = [
  "Type 'Config' is not assignable to type 'Options'.",
  "  Types of property 'user' are incompatible.",
  "    Types of property 'address' are incompatible.",
  "      Types of property 'postcode' are incompatible.",
  "        Type 'number' is not assignable to type 'string'.",
].join('\n');

test('parseDiagnostic: a flat message', () => {
  const d = parseDiagnostic('Something went wrong.');
  assert.equal(d.message, 'Something went wrong.');
  assert.deepEqual(d.causes, []);
});

test('parseDiagnostic: one level', () => {
  const d = parseDiagnostic("Top.\n  Because of this.");
  assert.equal(d.message, 'Top.');
  assert.equal(d.causes.length, 1);
  assert.equal(d.causes[0]?.message, 'Because of this.');
});

test('parseDiagnostic: a real chain', () => {
  const d = parseDiagnostic(REAL);
  assert.equal(d.message, "Type 'Config' is not assignable to type 'Options'.");
  assert.equal(d.causes[0]?.causes[0]?.causes[0]?.message, "Types of property 'postcode' are incompatible.");
});

test('parseDiagnostic: siblings at the same depth', () => {
  const d = parseDiagnostic("Top.\n  First.\n  Second.");
  assert.equal(d.causes.length, 2);
  assert.equal(d.causes[1]?.message, 'Second.');
});

test('parseDiagnostic ignores blank lines', () => {
  const d = parseDiagnostic("Top.\n\n  Cause.\n\n");
  assert.equal(d.causes.length, 1);
});

test('parseDiagnostic rejects malformed input', () => {
  assert.throws(() => parseDiagnostic(''), SyntaxError);
  assert.throws(() => parseDiagnostic('   \n  \n'), SyntaxError);
  assert.throws(() => parseDiagnostic('Top.\nAlso top.'), SyntaxError, 'two roots');
  assert.throws(() => parseDiagnostic('Top.\n    Skipped a level.'), SyntaxError);
});

test('rootCause', () => {
  assert.equal(rootCause(parseDiagnostic(REAL)), "Type 'number' is not assignable to type 'string'.");
  assert.equal(rootCause(parseDiagnostic('Alone.')), 'Alone.');
});

test('rootCause follows the first branch', () => {
  const d = parseDiagnostic("Top.\n  First.\n    Deep first.\n  Second.");
  assert.equal(rootCause(d), 'Deep first.');
});

test('pathTo', () => {
  assert.deepEqual(pathTo(parseDiagnostic(REAL)), ['user', 'address', 'postcode']);
});

test('pathTo: nothing to collect', () => {
  assert.deepEqual(pathTo(parseDiagnostic('Alone.')), []);
  assert.deepEqual(pathTo(parseDiagnostic("Top.\n  Not a property message.")), []);
});

test('summarise', () => {
  assert.equal(
    summarise(parseDiagnostic(REAL)),
    "Type 'Config' is not assignable to type 'Options'. -> Type 'number' is not assignable to type 'string'.",
  );
});

test('summarise: nothing underneath', () => {
  assert.equal(summarise(parseDiagnostic('Alone.')), 'Alone.');
});

test('classify', () => {
  assert.equal(
    classify("Object literal may only specify known properties, and 'z' does not exist."),
    'excess-property',
  );
  assert.equal(classify("Type 'Rect' is not assignable to type 'never'."), 'exhaustiveness');
  assert.equal(
    classify('Type instantiation is excessively deep and possibly infinite.'),
    'deep-instantiation',
  );
  assert.equal(
    classify("Two different types with this name exist, but they are unrelated."),
    'duplicate-package',
  );
  assert.equal(classify("Property 'x' does not exist on type 'never'."), 'narrowed-to-never');
  assert.equal(
    classify("Argument of type 'string' is not assignable to parameter of type 'never'."),
    'no-inference-candidate',
  );
});

test('classify: anything else', () => {
  assert.equal(classify('Cannot find name foo.'), 'unknown');
  assert.equal(classify(''), 'unknown');
});

test('classify prefers the more specific pattern', () => {
  // This one contains both "is not assignable to type 'never'" and, further on,
  // a mention of a parameter. Exhaustiveness is the useful reading.
  assert.equal(
    classify("Type 'Circle' is not assignable to type 'never'. parameter of type 'never'"),
    'exhaustiveness',
  );
});
