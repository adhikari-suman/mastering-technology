/**
 * Part 04, Lesson 02 — Distribution
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any` except where a stub's whole purpose is detecting it. And do
 * not import from ../../type-tests.ts — rebuilding `Equal` is the point.
 */

/**
 * Wrap each member of a union in an array, SEPARATELY.
 *
 *   Distribute<string | number>  ->  string[] | number[]
 *
 * Write it so distribution happens. The checked type has to be naked.
 */
export type Distribute<T> = unknown; // TODO

/**
 * The same intent, written so distribution does NOT happen.
 *
 *   NoDistribute<string | number>  ->  (string | number)[]
 */
export type NoDistribute<T> = unknown; // TODO

/**
 * True only for `never`.
 *
 *   MyIsNever<never>   -> true
 *   MyIsNever<string>  -> false
 *   MyIsNever<never | string> -> false   (never is absorbed, so this is string)
 *
 * The naive version returns `never` for `never`. Yours must return `false` for
 * everything that isn't, and `true` for the one that is.
 */
export type MyIsNever<T> = unknown; // TODO

/**
 * True only for `any`.
 *
 *   MyIsAny<any>      -> true
 *   MyIsAny<unknown>  -> false
 *   MyIsAny<never>    -> false
 *   MyIsAny<string>   -> false
 *
 * There is exactly one trick that works, and it turns on `any` being the only
 * type whose intersection with a literal is not `never`.
 */
export type MyIsAny<T> = unknown; // TODO

/**
 * True when `T` is a union of two or more members.
 *
 *   IsUnion<string | number>  -> true
 *   IsUnion<string>           -> false
 *   IsUnion<never>            -> false
 *   IsUnion<boolean>          -> true    (boolean IS true | false)
 *
 * You will need a second type parameter that defaults to `T`, so that one copy
 * distributes while the other stays whole.
 */
export type IsUnion<T, U = T> = unknown; // TODO

/**
 * Exact type identity — the assertion you have been using since Part 01.
 *
 *   MyEqual<string, string>                        -> true
 *   MyEqual<any, string>                           -> false
 *   MyEqual<{ a: string }, { readonly a: string }> -> false
 *   MyEqual<'a' | 'b', 'b' | 'a'>                  -> true
 *
 * Mutual assignability gets three of those wrong. What works is comparing two
 * generic function types whose bodies mention A and B while still deferred.
 */
export type MyEqual<A, B> = unknown; // TODO

/**
 * The runtime twin of distribution: apply `fn` to each member of an array and
 * flatten one level — the value-level shape of "map over the members".
 *
 *   flatMap([1, 2], n => [n, n])  ->  [1, 1, 2, 2]
 */
export function flatMap<T, U>(items: readonly T[], fn: (item: T) => readonly U[]): U[] {
  throw new Error('flatMap: not implemented');
}
