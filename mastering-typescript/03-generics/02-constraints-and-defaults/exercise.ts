/**
 * Part 03, Lesson 02 — Constraints and defaults
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `as` in a SIGNATURE, and no `any` anywhere. Inside a body, two
 * situations resist it honestly — seeding a `Record` accumulator, and reading
 * past `noUncheckedIndexedAccess`. Use `as` there if you must, note where, and
 * Part 08 Lesson 04 will ask whether you still would.
 */

/** A container. Its parameter defaults to `string` when nobody says otherwise. */
export type Box<T> = { value: T }; // TODO: give T a default

/**
 * The longer of two values — anything with a `length`. Ties go to the first.
 *
 * The caller must get their OWN type back, not the constraint: `longest('a','b')`
 * is a `string`, not a `{ length: number }`.
 */
export function longest<T>(a: T, b: T): T {
  // TODO: constrain T
  throw new Error('longest: not implemented');
}

/**
 * `value` when it is defined, and `fallback` otherwise. The fallback may be a
 * different type from the value, and it defaults to `null` when the caller
 * doesn't say.
 *
 *   withDefault<string>(undefined, null)  ->  string | null
 *   withDefault('a', 'b')                 ->  string
 */
export function withDefault<T, D>(value: T | undefined, fallback: D): T | D {
  // TODO: give D a default of null
  throw new Error('withDefault: not implemented');
}

/**
 * `Object.keys`, but typed as the object's own keys.
 *
 * This is unsound and everyone ships it anyway — a value with extra properties
 * is assignable, so the array can hold keys not in `keyof T`. Know that you are
 * choosing it.
 */
export function keysOf<T>(obj: T): unknown {
  // TODO: constrain T, and fix the return annotation
  throw new Error('keysOf: not implemented');
}

/**
 * Merge two objects, right winning on conflict. The result type is their
 * intersection.
 */
export function merge<A, B>(a: A, b: B): unknown {
  // TODO: constrain both, and fix the return annotation
  throw new Error('merge: not implemented');
}

/**
 * Group items by a computed key.
 *
 *   groupBy([1, 2, 3], n => n % 2 === 0 ? 'even' : 'odd')
 *     -> { odd: [1, 3], even: [2] }
 *
 * The key may be any type that can index an object, not only a string. Groups
 * appear in the order their first member is seen.
 */
export function groupBy<T, K>(items: readonly T[], keyOf: (item: T) => K): unknown {
  // TODO: constrain K, and fix the return annotation
  throw new Error('groupBy: not implemented');
}
