/**
 * Part 02, Lesson 04 — Recursion
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests. (Don't copy run commands out of
 * this header into your solution.js — they go stale; the README doesn't.)
 *
 * RULE FOR THIS WHOLE LESSON: every function must be recursive. No for, no
 * while, and no reduce standing in for the recursion.
 */

/**
 * factorial(0) -> 1     (the base case: 0! is 1 by definition)
 * factorial(5) -> 120
 */
export function factorial(n) {
  // TODO
  throw new Error('factorial: not implemented');
}

/**
 * The Fibonacci sequence, 0-indexed: 0, 1, 1, 2, 3, 5, 8, ...
 *
 * fibonacci(0) -> 0
 * fibonacci(1) -> 1
 * fibonacci(10) -> 55
 *
 * Naive branching recursion is fine here — the tests stay small.
 */
export function fibonacci(n) {
  // TODO: two base cases, two recursive calls
  throw new Error('fibonacci: not implemented');
}

/**
 * The same sequence, but memoized so that big inputs are instant.
 * A test calls fastFibonacci(60), which the naive version could never finish.
 *
 * Reuse the idea from lesson 01: a cache in a closure.
 */
export function fastFibonacci(n) {
  // TODO
  throw new Error('fastFibonacci: not implemented');
}

/**
 * Sum every number, however deeply nested in arrays.
 *
 * sumNested([1, [2, [3, [4]]]]) -> 10
 * sumNested([])                 -> 0
 * sumNested(5)                  -> 5     (a bare number is its own sum)
 */
export function sumNested(value) {
  // TODO: is it an array? recurse into each element. Otherwise it's a number.
  throw new Error('sumNested: not implemented');
}

/**
 * Flatten an array of any depth into a single level.
 *
 * flattenDeep([1, [2, [3, [4]]]]) -> [1, 2, 3, 4]
 * flattenDeep([])                 -> []
 *
 * Don't use Array.prototype.flat — that's the thing you're building.
 */
export function flattenDeep(array) {
  // TODO
  throw new Error('flattenDeep: not implemented');
}

/**
 * Count every node in a tree shaped like:
 *   { value: 1, children: [ { value: 2, children: [] } ] }
 *
 * A node always has `children`, possibly empty.
 * countNodes({ value: 1, children: [] }) -> 1
 */
export function countNodes(tree) {
  // TODO
  throw new Error('countNodes: not implemented');
}

/**
 * How many levels deep the tree goes. A single node with no children is 1.
 *
 * maxDepth({ value: 1, children: [] }) -> 1
 */
export function maxDepth(tree) {
  // TODO: 1 + the deepest child, or 1 if there are no children
  throw new Error('maxDepth: not implemented');
}

/**
 * Reverse a string recursively.
 *
 * reverseString('abc') -> 'cba'
 * reverseString('')    -> ''
 */
export function reverseString(str) {
  // TODO
  throw new Error('reverseString: not implemented');
}
