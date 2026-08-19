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
  if (n === 0) return 1;

  return n * factorial(n - 1);
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
  if (n === 0 || n === 1) return n;

  return fibonacci(n - 1) + fibonacci(n - 2);
}

/**
 * The same sequence, but memoized so that big inputs are instant.
 * A test calls fastFibonacci(60), which the naive version could never finish.
 *
 * Reuse the idea from lesson 01: a cache in a closure.
 */
export function fastFibonacci(n) {
  const cache = new Map();
  cache.set(0, 0);
  cache.set(1, 1);

  function fib(k) {
    if (cache.has(k)) {
      return cache.get(k);
    }

    cache.set(k, fib(k - 1) + fib(k - 2));

    return cache.get(k);
  }

  return fib(n);
}

/**
 * Sum every number, however deeply nested in arrays.
 *
 * sumNested([1, [2, [3, [4]]]]) -> 10
 * sumNested([])                 -> 0
 * sumNested(5)                  -> 5     (a bare number is its own sum)
 */
export function sumNested(value) {
  if (!Array.isArray(value)) {
    return value;
  }

  if (value.length === 0) {
    return 0;
  }

  const [head, ...rest] = value;

  return sumNested(head) + sumNested(rest);
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
  if (!Array.isArray(array)) {
    return [array];
  }

  if (array.length === 0) {
    return [];
  }

  const [head, ...rest] = array;

  return [...flattenDeep(head), ...flattenDeep(rest)];
}

/**
 * Count every node in a tree shaped like:
 *   { value: 1, children: [ { value: 2, children: [] } ] }
 *
 * A node always has `children`, possibly empty.
 * countNodes({ value: 1, children: [] }) -> 1
 */
export function countNodes(tree) {
  if (tree == null) return 0;

  function countChildren(children) {
    if (children.length === 0) return 0;

    const [head, ...rest] = children;

    return countNodes(head) + countChildren(rest);
  }

  return 1 + countChildren(tree.children);
}

/**
 * How many levels deep the tree goes. A single node with no children is 1.
 *
 * maxDepth({ value: 1, children: [] }) -> 1
 */
export function maxDepth(tree) {
  if (tree == null) return 0;

  function maxChildDepth(children) {
    if (children == null || children.length === 0) return 0;

    const [head, ...rest] = children;

    return Math.max(maxDepth(head), maxChildDepth(rest));
  }

  return 1 + maxChildDepth(tree.children);
}

/**
 * Reverse a string recursively.
 *
 * reverseString('abc') -> 'cba'
 * reverseString('')    -> ''
 */
export function reverseString(str) {
  if (str == null || str === "") return str;

  return str[str.length - 1] + reverseString(str.slice(0, str.length - 1));
}
