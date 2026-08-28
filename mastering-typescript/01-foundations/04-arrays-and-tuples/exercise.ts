/**
 * Part 01, Lesson 04 — Arrays and tuples
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 */

/** A two-element tuple: an `A` then a `B`. */
export type Pair<A, B> = unknown; // TODO

/** `[x, y]` of numbers, with both positions labelled. */
export type Coord = unknown; // TODO

/** Two tuples spliced end to end. Spread them; no conditional types needed. */
export type Concat<A extends readonly unknown[], B extends readonly unknown[]> = unknown; // TODO

/**
 * An array of `T` with at least one element — a tuple with a rest element.
 * `head` below relies on this being precise enough to make indexing safe.
 */
export type NonEmpty<T> = unknown; // TODO

/** The first element, or `undefined` if there isn't one. */
export function first<T>(xs: readonly T[]): T | undefined {
  throw new Error('first: not implemented');
}

/** The last element, or `undefined` if there isn't one. */
export function last<T>(xs: readonly T[]): T | undefined {
  throw new Error('last: not implemented');
}

/**
 * The first element of a non-empty array. Note the return type: no `undefined`,
 * and no assertion needed inside either — if `NonEmpty` is right, indexing at 0
 * already typechecks.
 */
export function head<T>(xs: NonEmpty<T>): T {
  throw new Error('head: not implemented');
}

/** `[a, b]` in, `[b, a]` out — and the element types swap with them. */
export function swap<A, B>(pair: Pair<A, B>): Pair<B, A> {
  throw new Error('swap: not implemented');
}

/**
 * Pair up elements positionally, stopping at the shorter input.
 * zip([1, 2, 3], ['a', 'b']) -> [[1, 'a'], [2, 'b']]
 */
export function zip<A, B>(as: readonly A[], bs: readonly B[]): Pair<A, B>[] {
  throw new Error('zip: not implemented');
}

/**
 * Split into runs of `size`. The final chunk may be shorter.
 * chunk([1, 2, 3, 4, 5], 2) -> [[1, 2], [3, 4], [5]]
 * A `size` below 1 throws a RangeError.
 */
export function chunk<T>(xs: readonly T[], size: number): T[][] {
  throw new Error('chunk: not implemented');
}
