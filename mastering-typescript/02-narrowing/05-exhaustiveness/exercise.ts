/**
 * Part 02, Lesson 05 — Exhaustiveness
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `default: throw`, no `as`, and no `any`. Every dispatch here must
 * fail to COMPILE when a member is added, not merely fail at runtime.
 */

/** A circle, a square, a rectangle — tagged with `kind`. */
export type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'rect'; width: number; height: number };

/** Every tag, derived from `Shape`. */
export type Kind = unknown; // TODO

/**
 * The exhaustiveness tool. Takes a value the checker believes is `never`, and
 * throws at runtime because that belief can be wrong — the wire does not read
 * your types.
 *
 * Message format: `unhandled: ${JSON.stringify(value)}`
 */
export function assertNever(value: never): never {
  throw new Error('assertNever: not implemented');
}

/**
 * Area, by an exhaustive `switch` on the tag, closed with `assertNever`.
 *
 *   circle  pi * r^2
 *   square  s^2
 *   rect    w * h
 */
export function area(shape: Shape): number {
  throw new Error('area: not implemented');
}

/**
 * A label per kind: 'circle' -> 'Circle', 'square' -> 'Square', 'rect' -> 'Rectangle'.
 *
 * Must be checked against every `Kind` while keeping its exact value types —
 * an annotation gives you the first and loses the second.
 */
export const LABELS = {}; // TODO

/** The label for a shape, via `LABELS` rather than a switch. */
export function describe(shape: Shape): string {
  throw new Error('describe: not implemented');
}

/**
 * Perimeter, as an `if` / `else if` chain closed the same way as `area`.
 *
 *   circle  2 * pi * r
 *   square  4 * s
 *   rect    2 * (w + h)
 */
export function perimeter(shape: Shape): number {
  throw new Error('perimeter: not implemented');
}
