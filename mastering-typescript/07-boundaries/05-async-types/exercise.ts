/**
 * Part 07, Lesson 05 — Async types
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`, no `as`.
 */

/** A success or a failure — the same shape as Lesson 04, restated locally. */
export type Result<T, E = unknown> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/** Work that can be cancelled: it takes a signal and honours it. */
export type Cancellable<T> = unknown; // TODO

/** Thrown by `withTimeout` when the deadline wins. */
export class TimeoutError extends Error {
  override readonly name = 'TimeoutError';
}

/**
 * Race `work` against a deadline.
 *
 *   - the work wins    -> resolves with its value, and the timer is cleared
 *   - the deadline wins -> rejects with TimeoutError(`timed out after ${ms}ms`),
 *                          and the signal passed to `work` is aborted
 *   - the work throws  -> that error propagates, and the timer is cleared
 *
 * Leaving a timer pending keeps the process alive, so the cleanup is not
 * optional — one of the tests will hang without it.
 */
export function withTimeout<T>(work: Cancellable<T>, ms: number): Promise<T> {
  throw new Error('withTimeout: not implemented');
}

/**
 * Map over items SEQUENTIALLY, awaiting each before starting the next.
 * Order is preserved. An error from any step rejects the whole thing.
 */
export function mapAsync<T, U>(
  items: readonly T[],
  fn: (item: T, index: number) => Promise<U>,
): Promise<U[]> {
  throw new Error('mapAsync: not implemented');
}

/**
 * Run `fn` for every item, in order, awaiting each.
 *
 * The callback's return type is the exercise. Typed `=> void`, an async
 * callback is silently accepted and never awaited — the hole from Part 01
 * Lesson 06. Type it so that both a sync and an async callback work, AND the
 * async one is actually awaited.
 */
export function forEachAsync<T>(
  items: readonly T[],
  fn: (item: T, index: number) => void,
): Promise<void> {
  // TODO: fix the callback's return type
  throw new Error('forEachAsync: not implemented');
}

/**
 * Run everything CONCURRENTLY and report each outcome, never rejecting.
 *
 *   settle([Promise.resolve(1), Promise.reject('x')])
 *     -> [{ ok: true, value: 1 }, { ok: false, error: 'x' }]
 *
 * Order matches the input.
 */
export function settle<T>(promises: readonly Promise<T>[]): Promise<Result<T>[]> {
  throw new Error('settle: not implemented');
}

/**
 * Retry `work` up to `attempts` times, stopping early if the signal aborts.
 *
 *   - resolves with the first success
 *   - after the last failure, rejects with that failure
 *   - if `signal.aborted` before an attempt, rejects with the signal's reason
 *   - `attempts` below 1 rejects with a RangeError. Note that it cannot THROW:
 *     an `async` function turns every throw into a rejection, so "validate the
 *     arguments synchronously" is not something an async signature can offer.
 *
 * No delay between attempts; this is about the types and the control flow.
 */
export function retry<T>(
  work: Cancellable<T>,
  attempts: number,
  signal: AbortSignal,
): Promise<T> {
  throw new Error('retry: not implemented');
}
