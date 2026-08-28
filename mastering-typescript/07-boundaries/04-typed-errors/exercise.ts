/**
 * Part 07, Lesson 04 — Typed errors
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`, no `as`. Everything here is reachable by narrowing on the
 * discriminant.
 */

/**
 * A success or a failure, discriminated on `ok`.
 *
 *   { ok: true;  value: T }
 *   { ok: false; error: E }
 *
 * `E` defaults to `Error`.
 */
export type Result<T, E = Error> = unknown; // TODO

/** Wrap a success. */
export function ok<T>(value: T): Result<T, never> {
  throw new Error('ok: not implemented');
}

/** Wrap a failure. */
export function err<E>(error: E): Result<never, E> {
  throw new Error('err: not implemented');
}

/** Narrowing predicates. Both must narrow the union, in both directions. */
export function isOk<T, E>(result: Result<T, E>): boolean {
  // TODO: the return annotation is wrong — it should narrow
  throw new Error('isOk: not implemented');
}

export function isErr<T, E>(result: Result<T, E>): boolean {
  // TODO: the return annotation is wrong — it should narrow
  throw new Error('isErr: not implemented');
}

/** Transform a success, leaving a failure alone. */
export function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  throw new Error('map: not implemented');
}

/** Transform a failure, leaving a success alone. */
export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  throw new Error('mapErr: not implemented');
}

/**
 * Chain a fallible step. The failure types accumulate as a union, which is what
 * makes a chain of different failures still exhaustively handleable.
 */
export function flatMap<T, U, E, F>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, F>,
): Result<U, E | F> {
  throw new Error('flatMap: not implemented');
}

/** The value, or `fallback` when it failed. */
export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  throw new Error('unwrapOr: not implemented');
}

/**
 * The value, throwing when it failed. The one place this module throws.
 * Message: `unwrap on an error result: ${String(error)}`
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  throw new Error('unwrap: not implemented');
}

/**
 * Many results into one. All successes gives an array of values; otherwise the
 * FIRST error, and no further results are inspected.
 *
 *   all([ok(1), ok(2)])          ->  ok([1, 2])
 *   all([ok(1), err('a'), err('b')]) -> err('a')
 *   all([])                      ->  ok([])
 */
export function all<T, E>(results: readonly Result<T, E>[]): Result<T[], E> {
  throw new Error('all: not implemented');
}

/**
 * Bridge a throwing function into a Result. The error slot is `unknown`,
 * because anything can be thrown and pretending otherwise is Lesson 01's
 * mistake all over again.
 */
export function tryCatch<T>(fn: () => T): Result<T, unknown> {
  throw new Error('tryCatch: not implemented');
}
