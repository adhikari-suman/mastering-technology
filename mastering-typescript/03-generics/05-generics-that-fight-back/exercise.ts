/**
 * Part 03, Lesson 05 — Generics that fight back
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * Every stub below is written the WRONG way, with a note saying which of the
 * four mistakes it makes. Repair the signature; the body follows from it.
 *
 * RULE: no `as` in a SIGNATURE, and no `any` anywhere. Inside a body, two
 * situations resist it honestly — seeding a `Record` accumulator, and reading
 * past `noUncheckedIndexedAccess`. Use `as` there if you must, note where, and
 * Part 08 Lesson 04 will ask whether you still would.
 */

/**
 * Render any value as a string for a log line:
 *   a string  -> itself
 *   anything else -> JSON.stringify, or String() when that returns undefined
 *
 * MISTAKE 1 — the parameter appears once. `T` relates nothing to anything, so
 * the caller learns nothing from it. Say what you actually mean.
 */
export function logValue<T>(value: T): string {
  // TODO: fix the signature first
  throw new Error('logValue: not implemented');
}

/**
 * Parse JSON.
 *
 * MISTAKE 2 — a return-only generic. Nothing in the arguments decides `T`, so
 * the caller asserts it and this function promises something it never checked.
 * Return what is actually known and make the caller narrow.
 */
export function parseJson<T>(json: string): T {
  // TODO: fix the signature first
  throw new Error('parseJson: not implemented');
}

/**
 * Read one property.
 *
 * MISTAKE 3 — the missing constraint. Without it the body cannot index, and the
 * result is a union of every property type instead of the one asked for.
 */
export function getProp<T, K>(obj: T, key: K): unknown {
  // TODO: fix the signature first
  throw new Error('getProp: not implemented');
}

/** The levels, in increasing severity. */
export const LEVELS = ['debug', 'info', 'warn', 'error'] as const;
export type Level = (typeof LEVELS)[number];

/**
 * Record the current level. Returns nothing.
 *
 * MISTAKE 4 — a union in disguise. `T` is constrained to a closed set, used
 * once, and absent from the return type.
 */
export function setLevel<T extends Level>(level: T): void {
  // TODO: fix the signature first
  throw new Error('setLevel: not implemented');
}

/** Whatever `setLevel` was last given, or 'info' before any call. */
export function currentLevel(): Level {
  throw new Error('currentLevel: not implemented');
}

/**
 * The numeric severity of a level: debug 0, info 1, warn 2, error 3.
 *
 * THIS ONE KEEPS ITS GENERIC — the return type depends on which member was
 * passed, so the parameter is earning its place:
 *
 *   levelValue('debug')  ->  0    (not `number`)
 *
 * You will need a lookup object precise enough to carry that, and the `satisfies`
 * habit from Part 02 Lesson 05.
 */
export function levelValue<T extends Level>(level: T): unknown {
  // TODO: the return annotation is wrong
  throw new Error('levelValue: not implemented');
}

/**
 * The first element, or a fallback. A correct generic, for contrast: `T`
 * appears three times and the caller learns the result type from their input.
 */
export function firstOr<T>(items: readonly T[], fallback: T): T {
  throw new Error('firstOr: not implemented');
}
