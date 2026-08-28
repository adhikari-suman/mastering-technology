/**
 * Part 01, Lesson 01 — Types and values
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.ts solution.ts
 *
 * Then write your answers in solution.ts. See README.md for how to run it.
 *
 * CONVENTION: type stubs are `unknown` and function stubs `throw`, so this file
 * compiles as it stands. Every stub is independent — fixing one never breaks
 * another, so you can go green one test at a time.
 */

/** Given: an ordinary value. Don't annotate it; a later stub depends on that. */
export const origin = { x: 0, y: 0 };

/** An object type with `x` and `y`, both `number`. */
export type Point = unknown; // TODO

/** `Point`'s keys as a union. Use `keyof` — don't write `'x' | 'y'` by hand. */
export type PointKey = unknown; // TODO

/** The type of any value held in a `Point`. Indexed access, with a union key. */
export type PointValue = unknown; // TODO

/** The type of the `origin` value above, recovered from the value itself. */
export type Origin = unknown; // TODO

/**
 * An interface with `x: number` and `y: number` — but declared in TWO separate
 * blocks, so that the merge is what produces the second property. One block
 * with both properties in it passes no test here.
 */
export interface Vec {
  // TODO
}

/**
 * One name, both namespaces — and no collision, because they are looked up
 * separately. The value half is already here; write the type half so that the
 * two describe the same shape.
 */
export type Named = unknown; // TODO
export const Named = { name: 'anonymous' };

/** Build a `Point`. Its return type must be `Point`, not a fresh literal type. */
export function makePoint(x: number, y: number): Point {
  throw new Error('makePoint: not implemented');
}

/** Euclidean distance between two points. */
export function distance(a: Point, b: Point): number {
  throw new Error('distance: not implemented');
}

/** The type of `makePoint` itself, recovered from the function value. */
export type MakePoint = unknown; // TODO
