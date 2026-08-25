/**
 * Part 03, Lesson 01 — The Prototype Chain
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
 * Every object in the prototype chain, starting with the one AFTER obj and
 * ending with the last one before null.
 *
 * const a = {}; chainOf(a) -> [Object.prototype]
 * chainOf(Object.create(null)) -> []
 */
export function chainOf(obj) {
  const proto = Object.getPrototypeOf(obj);

  if (proto == null) return [];

  return [proto, ...chainOf(proto)];
}

/**
 * Own enumerable keys only — nothing inherited.
 *
 * const proto = { a: 1 };
 * const o = Object.create(proto); o.b = 2;
 * ownKeys(o) -> ['b']
 */
export function ownKeys(obj) {
  return Object.keys(obj);
}

/**
 * Own AND inherited enumerable keys, own ones first, no duplicates.
 *
 * const proto = { a: 1 };
 * const o = Object.create(proto); o.b = 2;
 * allKeys(o) -> ['b', 'a']
 *
 * Object.prototype's own properties are all non-enumerable, so they never
 * show up here.
 */
export function allKeys(obj) {
  const result = [];

  for (const key in obj) {
    result.push(key);
  }

  return result;
}

/**
 * Return the object in the chain that actually owns `key` — obj itself if it
 * is an own property, otherwise whichever prototype holds it. null if nobody
 * in the chain has it.
 *
 * const proto = { a: 1 };
 * const o = Object.create(proto);
 * findOwner(o, 'a') -> proto
 * findOwner(o, 'z') -> null
 */
export function findOwner(obj, key) {
  if (obj == null) return null;

  if (Object.hasOwn(obj, key)) return obj;

  return findOwner(Object.getPrototypeOf(obj), key);
}

/**
 * True if `key` is an OWN property of obj. Must work on objects created with
 * Object.create(null), which have no inherited hasOwnProperty to call.
 *
 * hasOwnSafe(Object.assign(Object.create(null), { a: 1 }), 'a') -> true
 */
export function hasOwnSafe(obj, key) {
  return Object.hasOwn(obj, key);
}

/**
 * How many links up the chain `key` was found.
 * 0 = own property, 1 = on the immediate prototype, and so on.
 * -1 if it is nowhere in the chain.
 */
export function depthOf(obj, key) {
  if (obj == null) return -1;

  if (Object.hasOwn(obj, key)) {
    return 0;
  }

  const depth = depthOf(Object.getPrototypeOf(obj), key);

  return depth === -1 ? -1 : 1 + depth;
}
