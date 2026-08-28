/**
 * Part 04, Lesson 06 — Recursive types
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`. And note that a recursive type that will not compile is
 * usually not wrong — it is not tail-recursive. Rewrite before you give up.
 */

/** Anything `JSON.parse` can return: primitives, null, arrays, plain objects. */
export type Json = unknown; // TODO

/**
 * Read-only, all the way down.
 *
 *   DeepReadonly<{ a: { b: string } }>  ->  { readonly a: { readonly b: string } }
 *   DeepReadonly<string[]>              ->  readonly string[]
 *
 * Arrays must stay arrays and functions must stay functions — both are objects,
 * so the order of the checks is what makes this work.
 */
export type DeepReadonly<T> = unknown; // TODO

/**
 * Optional, all the way down. Same ordering concerns.
 *
 *   DeepPartial<{ a: { b: string } }>  ->  { a?: { b?: string } }
 */
export type DeepPartial<T> = unknown; // TODO

/**
 * A tuple of `N` copies of `T`.
 *
 *   TupleOf<3, 0>  ->  [0, 0, 0]
 *   TupleOf<0, 0>  ->  []
 *
 * There is no arithmetic in the type system — count by growing an accumulator
 * and comparing its `length`.
 */
export type TupleOf<N extends number, T, Acc extends T[] = []> = unknown; // TODO

/**
 * Reverse a tuple.
 *
 *   Reverse<[1, 2, 3]>  ->  [3, 2, 1]
 *   Reverse<[]>         ->  []
 *
 * Write it TAIL-recursively — the true branch must be nothing but the recursive
 * call — so that it survives long inputs.
 */
export type Reverse<T extends readonly unknown[], Acc extends unknown[] = []> = unknown; // TODO

/**
 * Every dotted path into a nested object, as a union of strings.
 *
 *   Paths<{ a: { b: string }; c: number }>  ->  'a' | 'a.b' | 'c'
 *
 * Carry a depth budget so a self-referential type cannot run away. Five levels
 * is plenty here.
 */
export type Paths<T, Depth extends unknown[] = [0, 0, 0, 0, 0]> = unknown; // TODO

/**
 * The runtime twin of `DeepReadonly`: freeze an object and everything reachable
 * from it. Returns the same object, now frozen. Must not loop forever on a
 * cyclic structure.
 */
export function deepFreeze<T>(value: T): DeepReadonly<T> {
  throw new Error('deepFreeze: not implemented');
}
