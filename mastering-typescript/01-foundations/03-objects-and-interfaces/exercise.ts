/**
 * Part 01, Lesson 03 — Objects and interfaces
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 */

/** `id: number`, `name: string`, and an `email` that may be absent entirely. */
export type User = unknown; // TODO

/**
 * The same three fields, but `email` must always be PRESENT — it is just
 * allowed to hold `undefined`. Under `exactOptionalPropertyTypes` this is a
 * genuinely different type from `User`, and a test proves it.
 */
export type MaybeEmailUser = unknown; // TODO

/** Every property of `User`, read-only. Write the modifiers out by hand. */
export type FrozenUser = unknown; // TODO

/** An object of arbitrary string keys holding numbers. */
export type Counts = unknown; // TODO

/**
 * Read one key. The return type must admit that the key can be missing —
 * `noUncheckedIndexedAccess` is on, so this is what the index access already
 * gives you. Don't paper over it.
 */
export function lookup(counts: Counts, key: string): number | undefined {
  throw new Error('lookup: not implemented');
}

/** The same read, with a fallback for the missing case. */
export function lookupOr(counts: Counts, key: string, fallback: number): number {
  throw new Error('lookupOr: not implemented');
}

/**
 * Add one to `key`, treating a missing key as 0. Returns a NEW object; the
 * input must not be touched.
 */
export function increment(counts: Counts, key: string): Counts {
  throw new Error('increment: not implemented');
}

/** A copy of `user` with a new name. Non-mutating. */
export function rename(user: User, name: string): User {
  throw new Error('rename: not implemented');
}

/** Whether the user has an email. An empty string doesn't count. */
export function hasEmail(user: User): boolean {
  throw new Error('hasEmail: not implemented');
}
