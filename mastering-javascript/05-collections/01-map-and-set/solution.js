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
  const map = new Map();

  words.forEach((word, _) => {
    map.set(word, (map.get(word) ?? 0) + 1);
  });

  return map;
}

/**
 * Group items into a Map keyed by keyFn(item). Values are arrays, in the
 * order the items appeared.
 *
 * groupBy([1, 2, 3], n => n % 2 ? 'odd' : 'even')
 *   -> Map { 'odd' => [1, 3], 'even' => [2] }
 */
export function groupBy(items, keyFn) {
  const map = new Map();

  items.forEach((item, _) => {
    const key = keyFn(item);

    if (!map.has(key)) map.set(key, []);

    map.get(key).push(item);
  });

  return map;
}

/**
 * Remove duplicates, keeping first-seen order. Returns an array.
 * NaN counts as a duplicate of NaN.
 */
export function unique(items) {
  return [...new Set(items)];
}

/**
 * Values present in BOTH, as a Set, in `a`'s order.
 */
export function intersection(a, b) {
  const intersection = new Set();
  a = new Set(a);
  b = new Set(b);

  for (let item of a) {
    if (b.has(item) && !intersection.has(item)) {
      intersection.add(item);
    }
  }

  return intersection;
}

/**
 * Every value from either, as a Set, a's order then b's new ones.
 */
export function union(a, b) {
  return new Set([...a, ...b]);
}

/**
 * Values in `a` but not in `b`, as a Set.
 */
export function difference(a, b) {
  let difference = new Set();
  a = new Set(a);
  b = new Set(b);

  for (let item of a) {
    if (!b.has(item)) {
      difference.add(item);
    }
  }

  return difference;
}

/**
 * Map -> plain object. Assume string keys.
 */
export function mapToObject(map) {
  let obj = {};

  for (const [key, value] of map) {
    obj[key] = value;
  }
  return obj;
}

/**
 * Plain object -> Map, own enumerable keys only.
 */
export function objectToMap(obj) {
  const map = new Map();

  for (let key of Object.keys(obj)) {
    map.set(key, obj[key]);
  }

  return map;
}

/**
 * Memoize `fn` using a Map, so that OBJECT arguments work as cache keys —
 * something the plain-object memoize from Part 02 could never do.
 * Cache on the first argument.
 */
export function cacheWith(fn) {
  let cache = new Map();

  return (...args) => {
    const key = args[0];

    if (cache.has(key)) return cache.get(key);

    const result = fn(...args);
    cache.set(key, result);

    return cache.get(key);
  };
}
