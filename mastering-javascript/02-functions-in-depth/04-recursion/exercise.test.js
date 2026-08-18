import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

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
  factorial,
  fibonacci,
  fastFibonacci,
  sumNested,
  flattenDeep,
  countNodes,
  maxDepth,
  reverseString,
} = solution;

const LEAF = (value) => ({ value, children: [] });
const TREE = {
  value: 1,
  children: [
    { value: 2, children: [LEAF(4), LEAF(5)] },
    { value: 3, children: [{ value: 6, children: [LEAF(7)] }] },
  ],
};

test('factorial', () => {
  assert.equal(factorial(0), 1, '0! is 1 by definition');
  assert.equal(factorial(1), 1);
  assert.equal(factorial(5), 120);
  assert.equal(factorial(10), 3628800);
});

test('fibonacci: base cases', () => {
  assert.equal(fibonacci(0), 0);
  assert.equal(fibonacci(1), 1);
});

test('fibonacci: the sequence', () => {
  assert.deepEqual([2, 3, 4, 5, 6].map(fibonacci), [1, 2, 3, 5, 8]);
  assert.equal(fibonacci(10), 55);
});

test('fastFibonacci: agrees with the naive version', () => {
  for (const n of [0, 1, 2, 10, 20]) {
    assert.equal(fastFibonacci(n), fibonacci(n), `disagreed at n=${n}`);
  }
});

test('fastFibonacci: handles an input the naive version never could', () => {
  assert.equal(fastFibonacci(60), 1548008755920);
});

test('sumNested', () => {
  assert.equal(sumNested([1, [2, [3, [4]]]]), 10);
  assert.equal(sumNested([1, 2, 3]), 6);
  assert.equal(sumNested([]), 0);
  assert.equal(sumNested(5), 5, 'a bare number is its own sum');
  assert.equal(sumNested([[[[]]]]), 0);
});

test('flattenDeep', () => {
  assert.deepEqual(flattenDeep([1, [2, [3, [4]]]]), [1, 2, 3, 4]);
  assert.deepEqual(flattenDeep([1, 2, 3]), [1, 2, 3]);
  assert.deepEqual(flattenDeep([]), []);
  assert.deepEqual(flattenDeep([[[[1]]]]), [1]);
  assert.deepEqual(flattenDeep([1, [], [2, []], 3]), [1, 2, 3]);
});

test('flattenDeep: does not mutate its input', () => {
  const input = [1, [2, [3]]];
  flattenDeep(input);
  assert.deepEqual(input, [1, [2, [3]]]);
});

test('countNodes', () => {
  assert.equal(countNodes(LEAF(1)), 1);
  assert.equal(countNodes(TREE), 7);
  assert.equal(countNodes({ value: 1, children: [LEAF(2)] }), 2);
});

test('maxDepth', () => {
  assert.equal(maxDepth(LEAF(1)), 1, 'a lone node is depth 1');
  assert.equal(maxDepth({ value: 1, children: [LEAF(2)] }), 2);
  assert.equal(maxDepth(TREE), 4);
});

test('maxDepth: takes the deepest branch, not the first', () => {
  const lopsided = {
    value: 1,
    children: [LEAF(2), { value: 3, children: [{ value: 4, children: [LEAF(5)] }] }],
  };
  assert.equal(maxDepth(lopsided), 4);
});

test('reverseString', () => {
  assert.equal(reverseString('abc'), 'cba');
  assert.equal(reverseString(''), '');
  assert.equal(reverseString('a'), 'a');
  assert.equal(reverseString('recursion'), 'noisrucer');
});

test('every function is actually recursive — no loops', () => {
  const source = readFileSync(new URL('./solution.js', import.meta.url), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')   // strip block comments
    .replace(/\/\/.*/g, '');            // strip line comments
  for (const banned of [/\bfor\s*\(/, /\bwhile\s*\(/, /\.reduce\s*\(/, /\.flat\s*\(/]) {
    assert.ok(
      !banned.test(source),
      `found ${banned} in solution.js — this lesson is about the recursive shape`,
    );
  }
});
