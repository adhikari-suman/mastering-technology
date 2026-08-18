/**
 * Part 03, Lesson 06 — Symbols
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
 * Attach `data` to obj under a symbol key that nothing else can collide with,
 * and return obj. The data must be invisible to Object.keys and JSON.stringify.
 *
 * Use ONE module-level symbol so readMetadata can find it again.
 */
export function attachMetadata(obj, data) {
  // TODO
  throw new Error('attachMetadata: not implemented');
}

/**
 * Read back what attachMetadata stored, or undefined if there is none.
 */
export function readMetadata(obj) {
  // TODO
  throw new Error('readMetadata: not implemented');
}

/**
 * Every symbol-keyed own property name on obj.
 *
 * symbolKeysOf({ [Symbol('a')]: 1 }).length -> 1
 */
export function symbolKeysOf(obj) {
  // TODO
  throw new Error('symbolKeysOf: not implemented');
}

/**
 * A class holding `from` and `to`, iterable with for...of and spread.
 *
 *   [...new Range(1, 3)]  -> [1, 2, 3]
 *   [...new Range(2, 2)]  -> [2]
 *   [...new Range(3, 1)]  -> []
 *
 * Implement [Symbol.iterator].
 */
// TODO: export class Range { ... }

/**
 * A class holding `amount` and `currency`.
 *
 *   const m = new Money(5, 'GBP');
 *   +m               -> 5             (numeric hint)
 *   `${m}`           -> '5 GBP'       (string hint)
 *   m + ''           -> '5 GBP'       (default hint — treat it as string here)
 *   Object.prototype.toString.call(m) -> '[object Money]'
 *
 * Implement [Symbol.toPrimitive] and [Symbol.toStringTag].
 */
// TODO: export class Money { ... }

/**
 * An object (not a class) for which `instanceof` reports whether the left side
 * is an even number.
 *
 *   4 instanceof Even  -> true
 *   3 instanceof Even  -> false
 *   'x' instanceof Even -> false
 *
 * Implement [Symbol.hasInstance].
 */
// TODO: export const Even = { ... };
