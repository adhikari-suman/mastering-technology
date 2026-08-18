/**
 * Part 04, Lesson 05 — Combinators and Cancellation
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 *
 * RULE: implement the four combinators with `new Promise` and .then/.catch.
 * Don't delegate to Promise.all/allSettled/race/any.
 */

/**
 * Resolve with every value once ALL settle successfully, in input order.
 * Reject as soon as any one rejects.
 * all([]) resolves to [].
 */
export function all(promises) {
  // TODO: count completions; remember results by index, not arrival order
  throw new Error('all: not implemented');
}

/**
 * Never rejects. Resolves once every promise has settled, with
 * { status: 'fulfilled', value } or { status: 'rejected', reason } per entry.
 */
export function allSettled(promises) {
  // TODO
  throw new Error('allSettled: not implemented');
}

/**
 * Settle exactly as the FIRST promise to settle does — value or rejection.
 * race([]) stays pending forever, which is correct.
 */
export function race(promises) {
  // TODO
  throw new Error('race: not implemented');
}

/**
 * Resolve with the first promise to FULFIL, ignoring rejections.
 * If every one rejects, reject with an AggregateError whose `errors` array
 * holds the reasons in input order.
 * any([]) rejects with an AggregateError immediately.
 */
export function any(promises) {
  // TODO
  throw new Error('any: not implemented');
}

/**
 * Resolve after `ms`, unless `signal` aborts first — then reject with
 * signal.reason.
 *
 * Must also reject immediately if the signal is ALREADY aborted, and must
 * clearTimeout so the pending timer doesn't outlive the rejection.
 */
export function abortableWait(ms, signal) {
  // TODO
  throw new Error('abortableWait: not implemented');
}

/**
 * Map over items with an async fn, at most `limit` running at any moment.
 * Results in input order. Reject on the first failure.
 *
 * mapLimit([1,2,3,4], 2, fn) never has 3 in flight at once.
 */
export function mapLimit(items, limit, fn) {
  // TODO
  throw new Error('mapLimit: not implemented');
}
