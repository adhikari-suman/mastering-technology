/**
 * Part 05, Lesson 02 — WeakMap and WeakSet
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
 * Return { set, get, has, remove } backed by a WeakMap, giving any object
 * private associated data without touching the object itself.
 *
 * const store = makePrivateStore();
 * store.set(obj, { secret: 1 });
 * store.get(obj)  -> { secret: 1 }
 * Object.keys(obj) is unaffected.
 */
export function makePrivateStore() {
  // TODO
  throw new Error('makePrivateStore: not implemented');
}

/**
 * A class keeping ALL its state in a module-level WeakMap rather than on the
 * instance — the pre-#private pattern.
 *
 *   const t = new Tagged('a');
 *   t.getTag()          -> 'a'
 *   t.setTag('b');
 *   t.getTag()          -> 'b'
 *   Object.keys(t)      -> []          nothing on the instance
 *   JSON.stringify(t)   -> '{}'
 */
// TODO: export class Tagged { ... }   (plus a module-level WeakMap)

/**
 * Memoize a single-object-argument function using a WeakMap, so cached
 * entries don't keep their keys alive.
 *
 * Non-object arguments should just call through without caching.
 */
export function weakMemoize(fn) {
  // TODO
  throw new Error('weakMemoize: not implemented');
}

/**
 * Return a function that calls `fn(node)` the first time it sees each object,
 * and returns undefined without calling fn for anything already seen.
 * Use a WeakSet.
 *
 * const visit = visitOnce(n => n.value);
 * visit(a) -> a.value
 * visit(a) -> undefined
 */
export function visitOnce(fn) {
  // TODO
  throw new Error('visitOnce: not implemented');
}

/**
 * True if `value` is legal as a WeakMap key: objects (including arrays and
 * functions) and symbols, but not null and not primitives.
 */
export function canBeWeakKey(value) {
  // TODO
  throw new Error('canBeWeakKey: not implemented');
}

/**
 * Count the distinct objects reachable from `obj`, including obj itself.
 * Must terminate on cycles. Use a WeakSet to track what you've seen.
 *
 * const a = { b: { } }; a.self = a;
 * deepCountUnique(a) -> 2
 */
export function deepCountUnique(obj) {
  // TODO
  throw new Error('deepCountUnique: not implemented');
}
