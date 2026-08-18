/**
 * Part 05, Lesson 01 — Map and Set
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 */

/**
 * Count occurrences into a Map, in first-seen order.
 *
 * countWords(['a', 'b', 'a']) -> Map { 'a' => 2, 'b' => 1 }
 */
export function countWords(words) {
  // TODO
  throw new Error('countWords: not implemented');
}

/**
 * Group items into a Map keyed by keyFn(item). Values are arrays, in the
 * order the items appeared.
 *
 * groupBy([1, 2, 3], n => n % 2 ? 'odd' : 'even')
 *   -> Map { 'odd' => [1, 3], 'even' => [2] }
 */
export function groupBy(items, keyFn) {
  // TODO
  throw new Error('groupBy: not implemented');
}

/**
 * Remove duplicates, keeping first-seen order. Returns an array.
 * NaN counts as a duplicate of NaN.
 */
export function unique(items) {
  // TODO
  throw new Error('unique: not implemented');
}

/**
 * Values present in BOTH, as a Set, in `a`'s order.
 */
export function intersection(a, b) {
  // TODO: a and b are Sets
  throw new Error('intersection: not implemented');
}

/**
 * Every value from either, as a Set, a's order then b's new ones.
 */
export function union(a, b) {
  // TODO
  throw new Error('union: not implemented');
}

/**
 * Values in `a` but not in `b`, as a Set.
 */
export function difference(a, b) {
  // TODO
  throw new Error('difference: not implemented');
}

/**
 * Map -> plain object. Assume string keys.
 */
export function mapToObject(map) {
  // TODO
  throw new Error('mapToObject: not implemented');
}

/**
 * Plain object -> Map, own enumerable keys only.
 */
export function objectToMap(obj) {
  // TODO
  throw new Error('objectToMap: not implemented');
}

/**
 * Memoize `fn` using a Map, so that OBJECT arguments work as cache keys —
 * something the plain-object memoize from Part 02 could never do.
 * Cache on the first argument.
 */
export function cacheWith(fn) {
  // TODO
  throw new Error('cacheWith: not implemented');
}
