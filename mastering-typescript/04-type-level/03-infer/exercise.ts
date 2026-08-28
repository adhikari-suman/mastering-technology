/**
 * Part 04, Lesson 03 — infer
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any` except in a pattern position where the built-ins use it, and
 * none of these may use the built-in ReturnType, Parameters or Awaited.
 */

/**
 * Any function type, for constraining the ones below.
 *
 * Note the `never[]`: parameters are contravariant, so `never[]` is assignable
 * to any parameter list and this pattern matches every function — including the
 * uncallable ones that the standard library's `(...args: any)` pattern misses.
 */
export type AnyFn = (...args: never[]) => unknown;

/**
 * The return type of a function type. Anything that is not a function gives
 * `never`.
 *
 *   MyReturnType<() => string>          -> string
 *   MyReturnType<(a: number) => void>   -> void
 *   MyReturnType<string>                -> never
 *
 * Match with the `never[]` parameter pattern, not `any` — see `AnyFn` above.
 */
export type MyReturnType<T> = unknown; // TODO

/**
 * Its parameters, as a tuple. A non-function gives `never`.
 *
 *   MyParameters<(a: number, b: string) => void>  ->  [a: number, b: string]
 *   MyParameters<() => void>                      ->  []
 */
export type MyParameters<T> = unknown; // TODO

/**
 * Unwrap promises, all the way down.
 *
 *   MyAwaited<Promise<string>>                 -> string
 *   MyAwaited<Promise<Promise<number>>>        -> number
 *   MyAwaited<string>                          -> string
 */
export type MyAwaited<T> = unknown; // TODO

/**
 * The element type of an array or tuple.
 *
 *   ElementOf<string[]>        -> string
 *   ElementOf<[1, 2]>          -> 1 | 2
 *   ElementOf<string>          -> never
 */
export type ElementOf<T> = unknown; // TODO

/**
 * The first element of a tuple, and everything after it.
 *
 *   Head<[1, 2, 3]>  -> 1        Tail<[1, 2, 3]>  -> [2, 3]
 *   Head<[]>         -> never    Tail<[]>         -> []
 */
export type Head<T extends readonly unknown[]> = unknown; // TODO
export type Tail<T extends readonly unknown[]> = unknown; // TODO

/**
 * The LAST element of a tuple.
 *
 *   Last<[1, 2, 3]>  -> 3
 *   Last<[]>         -> never
 *
 * One pattern does this in a single step, with no recursion.
 */
export type Last<T extends readonly unknown[]> = unknown; // TODO

/**
 * The runtime twin of `MyAwaited`: await through however many layers of
 * promise there are, and return the value underneath.
 */
export async function unwrap<T>(value: T): Promise<MyAwaited<T>> {
  throw new Error('unwrap: not implemented');
}
