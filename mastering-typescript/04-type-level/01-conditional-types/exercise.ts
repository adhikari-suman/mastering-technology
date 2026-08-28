/**
 * Part 04, Lesson 01 — Conditional types
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`, and none of these may use the built-in `Exclude`, `Extract`
 * or `NonNullable`. Rebuilding them is the exercise.
 */

/**
 * The members of `T` that are NOT assignable to `U`.
 *
 *   MyExclude<'a' | 'b' | 'c', 'a'>        -> 'b' | 'c'
 *   MyExclude<string | number, string>     -> number
 */
export type MyExclude<T, U> = unknown; // TODO

/**
 * The members of `T` that ARE assignable to `U`.
 *
 *   MyExtract<'a' | 'b', 'a' | 'z'>        -> 'a'
 *   MyExtract<string | number, string>     -> string
 */
export type MyExtract<T, U> = unknown; // TODO

/**
 * `T` without `null` or `undefined`.
 *
 *   MyNonNullable<string | null>           -> string
 *   MyNonNullable<null | undefined>        -> never
 */
export type MyNonNullable<T> = unknown; // TODO

/**
 * A conditional driven by a boolean, so conditionals can be composed:
 *
 *   If<true, 'yes', 'no'>   -> 'yes'
 *   If<false, 'yes', 'no'>  -> 'no'
 *
 * Constrain `C` so that only booleans may be passed.
 */
export type If<C, T, F> = unknown; // TODO

/**
 * Name the kind of a type, as a cascade:
 *
 *   Kind<'x'>       -> 'string'
 *   Kind<1>         -> 'number'
 *   Kind<true>      -> 'boolean'
 *   Kind<null>      -> 'null'
 *   Kind<undefined> -> 'undefined'
 *   Kind<() => void>-> 'function'
 *   Kind<string[]>  -> 'array'
 *   Kind<{}>        -> 'object'
 *
 * Order matters: several of these are assignable to more than one test, so the
 * cascade has to ask the specific questions first.
 */
export type Kind<T> = unknown; // TODO

/**
 * The runtime twin of `Kind`, returning the same strings for the same shapes.
 * `null` is 'null'; an array is 'array'; anything else object-ish is 'object'.
 */
export function kindOf(value: unknown): string {
  throw new Error('kindOf: not implemented');
}
