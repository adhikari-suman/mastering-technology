/**
 * Part 04, Lesson 04 — async / await
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
 * Run each task (a function returning a promise) ONE AT A TIME, in order.
 * Resolve with the results in order.
 *
 * sequential([]) -> []
 */
export async function sequential(tasks) {
  // TODO: a for...of loop with await inside
  throw new Error('sequential: not implemented');
}

/**
 * Start every task at once, resolve with results in the ORIGINAL order.
 */
export async function concurrent(tasks) {
  // TODO
  throw new Error('concurrent: not implemented');
}

/**
 * Run `tasks` sequentially and resolve with { results, ms } where ms is the
 * elapsed milliseconds. Used to prove sequential is slower.
 */
export async function timedSequential(tasks) {
  // TODO
  throw new Error('timedSequential: not implemented');
}

/**
 * The same, run concurrently.
 */
export async function timedConcurrent(tasks) {
  // TODO
  throw new Error('timedConcurrent: not implemented');
}

/**
 * Async map, strictly one item at a time, results in order.
 * fn is called as fn(item, index).
 */
export async function mapSeries(items, fn) {
  // TODO
  throw new Error('mapSeries: not implemented');
}

/**
 * Async map, all at once, results in order.
 */
export async function mapParallel(items, fn) {
  // TODO
  throw new Error('mapParallel: not implemented');
}

/**
 * Call `fn` and never throw. Resolve with a tuple:
 *   [null, value]  on success
 *   [error, null]  on failure — from a rejection OR a synchronous throw
 *
 * await safeCall(async () => 1)              -> [null, 1]
 * await safeCall(() => { throw new Error() }) -> [Error, null]
 */
export async function safeCall(fn) {
  // TODO
  throw new Error('safeCall: not implemented');
}

/**
 * Deliberately demonstrate the trap: use items.forEach with an async callback
 * that pushes into an array, and return that array IMMEDIATELY without
 * awaiting anything.
 *
 * The array comes back EMPTY, because forEach ignores the promises the
 * callback returns. The test asserts it is empty — this is the bug, made
 * visible on purpose.
 */
export function forEachIsBroken(items, fn) {
  // TODO
  throw new Error('forEachIsBroken: not implemented');
}
