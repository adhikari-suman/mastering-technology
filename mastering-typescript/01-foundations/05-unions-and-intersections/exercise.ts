/**
 * Part 01, Lesson 05 — Unions and intersections
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 */

/** A circle: tag `'circle'`, plus `radius: number`. */
export type Circle = unknown; // TODO

/** A square: tag `'square'`, plus `side: number`. */
export type Square = unknown; // TODO

/** A rectangle: tag `'rect'`, plus `width` and `height`. */
export type Rect = unknown; // TODO

/** One of the three. */
export type Shape = unknown; // TODO

/** The three tags as a union. DERIVE it from `Shape` — don't retype the strings. */
export type Kind = unknown; // TODO

/** Whatever `T` is, plus a string `id`. */
export type WithId<T> = unknown; // TODO

/** An intersection no value can satisfy. Two primitives that can't coexist. */
export type Impossible = unknown; // TODO

/**
 * The keys present on BOTH `A` and `B`. One operator does this in one step —
 * work out which, from what a union of object types can safely offer.
 */
export type SharedKeys<A, B> = unknown; // TODO

/** The area of any shape. Narrow on the tag. */
export function area(shape: Shape): number {
  throw new Error('area: not implemented');
}

/**
 * A human-readable description:
 *   'circle r=2'      'square s=3'      'rect 2x3'
 */
export function describe(shape: Shape): string {
  throw new Error('describe: not implemented');
}

/** The combined area of many shapes. An empty list has area 0. */
export function totalArea(shapes: readonly Shape[]): number {
  throw new Error('totalArea: not implemented');
}

/** Attach an id to any object. Non-mutating. */
export function withId<T extends object>(value: T, id: string): WithId<T> {
  throw new Error('withId: not implemented');
}
