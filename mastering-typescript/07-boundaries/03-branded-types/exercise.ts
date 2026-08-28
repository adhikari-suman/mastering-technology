/**
 * Part 07, Lesson 03 — Branded types
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`. Every constructor here needs exactly ONE `as`, at the return,
 * after the check — that is the design, not a compromise. Any other `as` is a
 * hole.
 */

/**
 * The brand key. A `unique symbol` that is declared and never exported, so
 * nothing outside this file can produce it — deliberately not `'__brand'`,
 * which an object literal could stumble into.
 */
declare const brand: unique symbol;

/**
 * `T`, marked with `B`. Erases to `T` at runtime; assignable to `T`, but not
 * the other way round.
 */
export type Brand<T, B> = unknown; // TODO

/** An identifier of the form `u_<digits>`. */
export type UserId = unknown; // TODO

/** An identifier of the form `p_<digits>`. */
export type PostId = unknown; // TODO

/** The only way to make a UserId. Throws a TypeError on anything else. */
export function userId(value: string): UserId {
  throw new Error('userId: not implemented');
}

/** The only way to make a PostId. Message: `bad post id: ${value}` */
export function postId(value: string): PostId {
  throw new Error('postId: not implemented');
}

/** A number known to be greater than zero. */
export type Positive = unknown; // TODO

/**
 * The only way to make one. Throws a RangeError for zero, negatives and NaN.
 * Message: `not positive: ${value}`
 */
export function positive(value: number): Positive {
  throw new Error('positive: not implemented');
}

/**
 * Division that cannot divide by zero — because the type of the divisor says
 * so, and there is no runtime check here at all.
 */
export function divide(numerator: number, denominator: Positive): number {
  throw new Error('divide: not implemented');
}

/** An array known to hold at least one element. */
export type NonEmptyArray<T> = unknown; // TODO

/**
 * The only way to make one. Throws a RangeError on an empty array.
 * Message: 'array is empty'
 */
export function nonEmpty<T>(values: readonly T[]): NonEmptyArray<T> {
  throw new Error('nonEmpty: not implemented');
}

/**
 * The first element. Note the return type: no `undefined`, and no check in the
 * body — the brand already proved it.
 */
export function firstOf<T>(values: NonEmptyArray<T>): T {
  throw new Error('firstOf: not implemented');
}
