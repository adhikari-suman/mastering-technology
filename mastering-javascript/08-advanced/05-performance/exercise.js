/**
 * Part 08, Lesson 05 — Performance, Honestly
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
 * Intersection the naive way: for each item in `a`, scan `b` with includes.
 * O(n * m). Written deliberately — this is the thing being measured.
 * Preserve a's order; no duplicates in the output.
 */
export function intersectSlow(a, b) {
  // TODO
  throw new Error('intersectSlow: not implemented');
}

/**
 * The same result, O(n + m), by indexing `b` first.
 */
export function intersectFast(a, b) {
  // TODO
  throw new Error('intersectFast: not implemented');
}

/**
 * Deduplicate with an O(n²) scan of what you've already kept.
 */
export function dedupeSlow(items) {
  // TODO
  throw new Error('dedupeSlow: not implemented');
}

/**
 * The same, O(n).
 */
export function dedupeFast(items) {
  // TODO
  throw new Error('dedupeFast: not implemented');
}

/**
 * Time `fn` honestly. Return { median, samples, iterations }.
 *
 *  - run fn `iterations` times as WARMUP, discarding the results
 *  - then take 5 samples, each timing `iterations` calls with performance.now()
 *  - median is the median SAMPLE, in milliseconds
 *  - samples is the array of 5 timings
 *
 * Accumulate fn's return value into something so the work can't be optimised
 * away.
 */
export function time(fn, iterations = 100) {
  // TODO
  throw new Error('time: not implemented');
}

/**
 * Compare two functions. Return
 *   { fasterIndex, ratio, medians }
 * where fasterIndex is 0 or 1, medians is [medianA, medianB], and ratio is
 * slower/faster (>= 1).
 *
 * If either median is 0, treat the ratio as Infinity rather than dividing.
 */
export function compare(a, b, iterations = 100) {
  // TODO
  throw new Error('compare: not implemented');
}

/**
 * Count work instead of timing it — deterministic, so it can be asserted on.
 *
 * Call fn with a `tick` function, and return how many times tick was called.
 *
 * countOperations((tick) => { for (const x of [1,2,3]) tick(); }) -> 3
 */
export function countOperations(fn) {
  // TODO
  throw new Error('countOperations: not implemented');
}

/**
 * Memoize with visible statistics.
 * Return a function that also carries a `stats` property: { hits, misses }.
 * Cache on the first argument, using a Map.
 */
export function memoizeWithStats(fn) {
  // TODO
  throw new Error('memoizeWithStats: not implemented');
}
