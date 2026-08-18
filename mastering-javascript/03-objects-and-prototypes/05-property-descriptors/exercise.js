/**
 * Part 03, Lesson 05 — Property Descriptors
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
 * The own property descriptor for `key`, or null if it isn't an own property.
 * (The built-in returns undefined; normalise that to null.)
 */
export function describe(obj, key) {
  // TODO
  throw new Error('describe: not implemented');
}

/**
 * Define a constant: readable and visible to Object.keys, but not writable,
 * not configurable, and not deletable. Return obj.
 *
 * In strict mode, assigning to it throws.
 */
export function defineConstant(obj, key, value) {
  // TODO
  throw new Error('defineConstant: not implemented');
}

/**
 * Define a property that behaves normally for reading and writing, but never
 * appears in Object.keys, for...in, spread or JSON.stringify. Return obj.
 */
export function defineHidden(obj, key, value) {
  // TODO
  throw new Error('defineHidden: not implemented');
}

/**
 * Define an enumerable getter-only property backed by `getter`, which is
 * called with obj as `this`. Return obj.
 *
 * defineComputed(user, 'full', function () { return `${this.first} ${this.last}`; })
 */
export function defineComputed(obj, key, getter) {
  // TODO
  throw new Error('defineComputed: not implemented');
}

/**
 * Own ENUMERABLE keys only.
 */
export function enumerableKeys(obj) {
  // TODO
  throw new Error('enumerableKeys: not implemented');
}

/**
 * ALL own keys, enumerable or not.
 */
export function allOwnKeys(obj) {
  // TODO
  throw new Error('allOwnKeys: not implemented');
}

/**
 * Freeze an object and every plain object or array reachable from it.
 * Return the object. Must not loop forever on a circular reference.
 */
export function deepFreeze(obj) {
  // TODO: freeze, then recurse into values that are objects
  throw new Error('deepFreeze: not implemented');
}

/**
 * True if obj and everything reachable from it is frozen.
 */
export function isDeeplyFrozen(obj) {
  // TODO
  throw new Error('isDeeplyFrozen: not implemented');
}
