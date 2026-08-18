/**
 * Part 05, Lesson 05 — JSON
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
 * Parse without throwing.
 *   valid   -> [null, value]
 *   invalid -> [error, null]
 */
export function safeParse(text) {
  // TODO
  throw new Error('safeParse: not implemented');
}

/**
 * Stringify with object keys sorted, at every depth, so that two objects with
 * the same contents in a different order produce identical output.
 * Arrays keep their order.
 *
 * stringifyStable({ b: 1, a: 2 }) === stringifyStable({ a: 2, b: 1 })
 */
export function stringifyStable(value) {
  // TODO: a replacer sees each value — rebuild objects with sorted keys
  throw new Error('stringifyStable: not implemented');
}

/**
 * Stringify while dropping every key in `keys`, at any depth.
 *
 * redact({ user: 'a', password: 'x' }, ['password']) -> '{"user":"a"}'
 */
export function redact(obj, keys) {
  // TODO
  throw new Error('redact: not implemented');
}

/**
 * Parse, converting any string that looks like an ISO 8601 timestamp into a
 * Date. Everything else is left alone.
 *
 * reviveDates('{"at":"2020-01-01T00:00:00.000Z"}').at instanceof Date -> true
 */
export function reviveDates(text) {
  // TODO: use a reviver
  throw new Error('reviveDates: not implemented');
}

/**
 * Serialise a value to a string, surviving Map, Set and undefined — all of
 * which plain JSON loses. deserialise must restore them exactly.
 *
 * Design your own tagged encoding; the tests only check the round trip.
 */
export function serialise(value) {
  // TODO
  throw new Error('serialise: not implemented');
}

/**
 * The inverse of serialise.
 *
 * Careful: a JSON.parse REVIVER that returns undefined DELETES the key, so a
 * reviver alone can never restore an undefined value. Parse first, then walk
 * the result and assign explicitly — `out[key] = undefined` keeps the key.
 */
export function deserialise(text) {
  // TODO
  throw new Error('deserialise: not implemented');
}

/**
 * Deep clone, preserving Map, Set, Date and circular references.
 * There is a built-in that does all of this.
 */
export function deepClone(value) {
  // TODO
  throw new Error('deepClone: not implemented');
}

/**
 * True if a JSON round trip would CHANGE the value — because it contains
 * functions, undefined, Map, Set, NaN, Infinity, or similar.
 *
 * losesData({ a: 1 })          -> false
 * losesData({ fn: () => {} })  -> true
 * losesData({ n: NaN })        -> true
 */
export function losesData(value) {
  // TODO: compare the value against its own round trip
  throw new Error('losesData: not implemented');
}
