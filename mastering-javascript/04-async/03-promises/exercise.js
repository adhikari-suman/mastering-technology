/**
 * Part 04, Lesson 03 — Promises
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
 * A promise resolving with undefined after `ms` milliseconds.
 */
export function wait(ms) {
  // TODO
  throw new Error('wait: not implemented');
}

/**
 * A promise resolving with `value` after `ms` milliseconds.
 */
export function resolveAfter(ms, value) {
  // TODO
  throw new Error('resolveAfter: not implemented');
}

/**
 * A promise rejecting with `error` after `ms` milliseconds.
 */
export function rejectAfter(ms, error) {
  // TODO
  throw new Error('rejectAfter: not implemented');
}

/**
 * Thread `value` through each function in order. A function may return a plain
 * value or a promise; either way the next one receives the resolved value.
 * Resolve with the final result. Any rejection propagates.
 *
 * chain(2, n => n + 1, async n => n * 10) -> 30
 * chain(2) -> 2
 */
export function chain(value, ...fns) {
  // TODO: build a chain of .then, or await in a loop
  throw new Error('chain: not implemented');
}

/**
 * Call `fn` (which returns a promise). If it rejects, try again, up to
 * `attempts` total calls. Resolve with the first success; if every attempt
 * fails, reject with the LAST error.
 *
 * attempts of 1 means no retry at all.
 */
export function retry(fn, attempts) {
  // TODO
  throw new Error('retry: not implemented');
}

/**
 * Resolve with the promise's value if it settles within `ms`.
 * Otherwise reject with an Error whose message is exactly 'timeout'.
 *
 * A rejection from the original promise must propagate unchanged.
 */
export function withTimeout(promise, ms) {
  // TODO: race the promise against a timer
  throw new Error('withTimeout: not implemented');
}

/**
 * Never rejects. Resolves with:
 *   { status: 'fulfilled', value }   or   { status: 'rejected', reason }
 *
 * This is one element of Promise.allSettled, which you build in lesson 05.
 */
export function settle(promise) {
  // TODO
  throw new Error('settle: not implemented');
}

/**
 * Run `fn` for its side effect with the resolved value, then pass the value
 * through unchanged — Part 02's tap, for promises.
 *
 * resolveAfter(1, 5).then(tapPromise(console.log)) still resolves to 5
 */
export function tapPromise(fn) {
  // TODO
  throw new Error('tapPromise: not implemented');
}
