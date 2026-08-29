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
  if (path.length === 0) return value;

  const [key, ...rest] = path;
  const base = obj == null || typeof obj !== "object" ? {} : obj;
  const copy = Array.isArray(base) ? [...base] : { ...base };

  copy[key] = setIn(base[key], rest, value);

  return copy;
}

/**
 * Like setIn, but the new value is fn(oldValue).
 *
 * updateIn({ n: 1 }, ['n'], x => x + 1) -> { n: 2 }
 */
export function updateIn(obj, path, fn) {
  if (path.length === 0) return fn(obj);

  const [key, ...rest] = path;
  const base = obj == null || typeof obj !== "object" ? {} : obj;
  const copy = Array.isArray(base) ? [...base] : { ...base };

  copy[key] = updateIn(base[key], rest, fn);

  return copy;
}

/**
 * Remove a nested key, returning a NEW object.
 *
 * removeIn({ a: { b: 1, c: 2 } }, ['a', 'b']) -> { a: { c: 2 } }
 * A path that doesn't exist returns an equal object.
 */
export function removeIn(obj, path) {
  if (path.length === 0) return undefined;

  const [key, ...rest] = path;
  const base = obj == null || typeof obj !== "object" ? {} : obj;
  const copy = Array.isArray(base) ? [...base] : { ...base };

  if (!Object.hasOwn(copy, key)) {
    return copy;
  }

  if (path.length === 1) {
    delete copy[key];
  } else {
    copy[key] = removeIn(copy[key], rest);
  }

  return copy;
}

/**
 * Non-mutating array append.
 */
export function push(array, value) {
  return [...array, value];
}

/**
 * Non-mutating insert at an index.
 * insertAt([1, 3], 1, 2) -> [1, 2, 3]
 */
export function insertAt(array, index, value) {
  const first = array.slice(0, index);
  const last = array.slice(index);

  return [...first, value, ...last];
}

/**
 * Non-mutating removal by index.
 * removeAt([1, 2, 3], 1) -> [1, 3]
 */
export function removeAt(array, index) {
  const first = array.slice(0, index);
  const last = array.slice(index + 1);

  return [...first, ...last];
}

/**
 * Non-mutating replacement by index.
 * replaceAt([1, 2, 3], 1, 9) -> [1, 9, 3]
 */
export function replaceAt(array, index, value) {
  const first = array.slice(0, index);
  const last = array.slice(index + 1);

  return [...first, value, ...last];
}

/**
 * A sorted COPY, ascending by keyFn(item). The input keeps its order.
 */
export function sortBy(items, keyFn) {
  return [...items].sort((a, b) => {
    const ka = keyFn(a);
    const kb = keyFn(b);

    return ka > kb ? 1 : ka < kb ? -1 : 0;
  });
}

/**
 * True if `a` and `b` hold the exact same object reference at `path` — the
 * test for structural sharing.
 *
 * const next = setIn(state, ['x'], 1);
 * sharesBranch(state, next, ['untouched']) -> true
 */
export function sharesBranch(a, b, path) {
  if (path.length === 0) return a === b;

  const [key, ...rest] = path;
  return sharesBranch(a?.[key], b?.[key], rest);
}
