/**
 * Part 06, Lesson 04 — Errors in Async Code
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
 * Run an async fn and resolve with [error, value], never rejecting.
 * A synchronous throw must be caught too.
 */
export async function catchAsync(fn) {
  // TODO
  throw new Error('catchAsync: not implemented');
}

/**
 * Demonstrate the trap ON PURPOSE.
 *
 * Inside a try/catch, call an async function that rejects WITHOUT awaiting it,
 * and catch nothing. Return the string 'not caught' from the try block, and
 * 'caught' from the catch block.
 *
 * Because the rejection happens after the try exits, this returns 'not caught'.
 *
 * Attach a .catch to the floating promise so it does not crash the process —
 * that is deliberate, and the point is what the RETURN value is.
 */
export function missingAwait() {
  // TODO
  throw new Error('missingAwait: not implemented');
}

/**
 * The same shape, with the await in place, so the catch actually fires.
 * Returns 'caught'.
 */
export async function withAwait() {
  // TODO
  throw new Error('withAwait: not implemented');
}

/**
 * Wait for every promise, then resolve with
 *   { successes: [values], failures: [reasons] }
 * Never rejects. Order within each array follows the input order.
 */
export async function settleAll(promises) {
  // TODO
  throw new Error('settleAll: not implemented');
}

/**
 * Resolve with EVERY rejection reason, not just the first — the thing
 * Promise.all throws away. Resolves with [] if none failed.
 */
export async function firstError(promises) {
  // TODO
  throw new Error('firstError: not implemented');
}

/**
 * Run async `fn`, then always run async `cleanup`.
 * Return fn's value, or let its error propagate.
 *
 * A cleanup that itself throws must NOT mask fn's error — fn's error wins.
 * If fn succeeded and cleanup throws, the cleanup error propagates.
 */
export async function withAsyncCleanup(fn, cleanup) {
  // TODO
  throw new Error('withAsyncCleanup: not implemented');
}

/**
 * Make a fire-and-forget promise explicit: attach onError to its rejection so
 * it can never become an unhandled rejection, and return undefined
 * immediately without waiting.
 */
export function guardFloating(promise, onError) {
  // TODO
  throw new Error('guardFloating: not implemented');
}
