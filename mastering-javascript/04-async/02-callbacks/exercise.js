/**
 * Part 04, Lesson 02 — Callbacks
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 *
 * Every callback here is error-first: cb(err, value), err === null on success.
 */

/**
 * Call `cb(null, value)` after `ms` milliseconds.
 * If `value` is an Error, call cb(value) instead — a way to simulate failure.
 *
 * delay(1, 'x', (err, v) => ...)   // v === 'x'
 */
export function delay(ms, value, cb) {
  // TODO
  throw new Error('delay: not implemented');
}

/**
 * Turn an error-first callback function into one returning a promise.
 *
 * const wait = promisify(delay);
 * await wait(1, 'x')  -> 'x'
 * A callback error must reject the promise.
 */
export function promisify(fn) {
  // TODO
  throw new Error('promisify: not implemented');
}

/**
 * The reverse: turn a promise-returning function into an error-first callback
 * function. The callback is appended to the arguments.
 *
 * const cbStyle = callbackify(async (n) => n * 2);
 * cbStyle(5, (err, v) => ...)   // v === 10
 */
export function callbackify(fn) {
  // TODO
  throw new Error('callbackify: not implemented');
}

/**
 * Run `tasks` — an array of functions each taking a single callback — ONE AT A
 * TIME, in order. Call `cb(null, results)` with the values in order.
 * On the first error, call cb(err) immediately and run nothing further.
 *
 * series([], cb) -> cb(null, [])
 */
export function series(tasks, cb) {
  // TODO
  throw new Error('series: not implemented');
}

/**
 * Run all `tasks` at once. Call cb(null, results) with results in the ORIGINAL
 * order, whatever order they finished in.
 * On the first error, call cb(err) — and cb must still only fire once.
 */
export function parallel(tasks, cb) {
  // TODO
  throw new Error('parallel: not implemented');
}

/**
 * Wrap a function so it can only ever be called once. Later calls do nothing
 * and return undefined. Used to make a callback safe against double-calling.
 */
export function once(fn) {
  // TODO
  throw new Error('once: not implemented');
}

/**
 * Wrap `fn` so it NEVER runs synchronously, even though it could.
 * The returned function schedules fn on the microtask queue.
 *
 * This is the fix for Zalgo: consistent asynchrony.
 */
export function deferred(fn) {
  // TODO
  throw new Error('deferred: not implemented');
}
