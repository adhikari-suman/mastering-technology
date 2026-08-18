/**
 * Part 08, Lesson 04 — Well-Known Symbols
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 */

/**
 * A duration in milliseconds.
 *
 *   const d = new Duration(1500);
 *   +d              -> 1500        (number hint)
 *   `${d}`          -> '1.5s'      (string hint)
 *   d + ''          -> '1.5s'      (default hint behaves as string here)
 *   d.ms            -> 1500
 *   Object.prototype.toString.call(d) -> '[object Duration]'
 *
 * Format: milliseconds / 1000, then 's'. Trailing zeros dropped:
 * 1500 -> '1.5s', 2000 -> '2s', 500 -> '0.5s'.
 */
// TODO: export class Duration { ... }

/**
 * Wraps an array.
 *
 *   const c = new Collection([1, 2, 3]);
 *   [...c]                    -> [1, 2, 3]           (Symbol.iterator)
 *   for await (const x of c)  -> 1, 2, 3             (Symbol.asyncIterator)
 *   Object.prototype.toString.call(c) -> '[object Collection]'
 *   c.size                    -> 3
 */
// TODO: export class Collection { ... }

/**
 * An object (not a class) where `instanceof` reports whether the left operand
 * is a number greater than zero.
 *
 *   5 instanceof PositiveNumber    -> true
 *   0 instanceof PositiveNumber    -> false
 *   -1 instanceof PositiveNumber   -> false
 *   'x' instanceof PositiveNumber  -> false
 */
// TODO: export const PositiveNumber = { ... };

/**
 * An Array subclass whose map/filter/slice return PLAIN arrays, via
 * Symbol.species.
 *
 *   const a = PlainArray.from([1, 2, 3]);
 *   a instanceof PlainArray            -> true
 *   a.map(n => n) instanceof PlainArray -> false
 *   Array.isArray(a.map(n => n))        -> true
 */
// TODO: export class PlainArray extends Array { ... }

/**
 * The reliable type check: the word inside [object ___].
 *
 * typeTagOf([])        -> 'Array'
 * typeTagOf(null)      -> 'Null'
 * typeTagOf(new Map()) -> 'Map'
 */
export function typeTagOf(value) {
  // TODO
  throw new Error('typeTagOf: not implemented');
}

/**
 * Which hint an operation triggers. `operation` is 'add' | 'template' |
 * 'multiply' | 'string'. Return the hint the object actually received.
 *
 * Build a probe object with a Symbol.toPrimitive that records its hint, run
 * the operation, and report what came through.
 *
 * hintUsed('add')      -> 'default'
 * hintUsed('template') -> 'string'
 * hintUsed('multiply') -> 'number'
 * hintUsed('string')   -> 'string'
 */
export function hintUsed(operation) {
  // TODO
  throw new Error('hintUsed: not implemented');
}
