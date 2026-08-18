/**
 * Part 05, Lesson 06 — Immutability
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 *
 * RULE: nothing here may mutate its arguments. Several tests check.
 */

/**
 * Set a nested value, returning a NEW object. Missing intermediate objects are
 * created. Untouched branches must be the SAME reference in the result.
 *
 * setIn({ a: { b: 1 } }, ['a', 'b'], 2) -> { a: { b: 2 } }
 * setIn({}, ['a', 'b'], 1)              -> { a: { b: 1 } }
 * setIn({ a: 1 }, [], 5)                -> 5   (empty path replaces everything)
 */
export function setIn(obj, path, value) {
  // TODO: recurse down the path, spreading at each level
  throw new Error('setIn: not implemented');
}

/**
 * Like setIn, but the new value is fn(oldValue).
 *
 * updateIn({ n: 1 }, ['n'], x => x + 1) -> { n: 2 }
 */
export function updateIn(obj, path, fn) {
  // TODO
  throw new Error('updateIn: not implemented');
}

/**
 * Remove a nested key, returning a NEW object.
 *
 * removeIn({ a: { b: 1, c: 2 } }, ['a', 'b']) -> { a: { c: 2 } }
 * A path that doesn't exist returns an equal object.
 */
export function removeIn(obj, path) {
  // TODO
  throw new Error('removeIn: not implemented');
}

/**
 * Non-mutating array append.
 */
export function push(array, value) {
  // TODO
  throw new Error('push: not implemented');
}

/**
 * Non-mutating insert at an index.
 * insertAt([1, 3], 1, 2) -> [1, 2, 3]
 */
export function insertAt(array, index, value) {
  // TODO
  throw new Error('insertAt: not implemented');
}

/**
 * Non-mutating removal by index.
 * removeAt([1, 2, 3], 1) -> [1, 3]
 */
export function removeAt(array, index) {
  // TODO
  throw new Error('removeAt: not implemented');
}

/**
 * Non-mutating replacement by index.
 * replaceAt([1, 2, 3], 1, 9) -> [1, 9, 3]
 */
export function replaceAt(array, index, value) {
  // TODO
  throw new Error('replaceAt: not implemented');
}

/**
 * A sorted COPY, ascending by keyFn(item). The input keeps its order.
 */
export function sortBy(items, keyFn) {
  // TODO
  throw new Error('sortBy: not implemented');
}

/**
 * True if `a` and `b` hold the exact same object reference at `path` — the
 * test for structural sharing.
 *
 * const next = setIn(state, ['x'], 1);
 * sharesBranch(state, next, ['untouched']) -> true
 */
export function sharesBranch(a, b, path) {
  // TODO
  throw new Error('sharesBranch: not implemented');
}
