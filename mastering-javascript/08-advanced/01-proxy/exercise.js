/**
 * Part 08, Lesson 01 — Proxy
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
 * Reading a missing property returns `fallback` instead of undefined.
 * Existing properties, including falsy ones, are unaffected.
 *
 * withDefault({ a: 1 }, 0).a -> 1
 * withDefault({ a: 1 }, 0).z -> 0
 */
export function withDefault(target, fallback) {
  // TODO
  throw new Error('withDefault: not implemented');
}

/**
 * Reads work; writes and deletes throw a TypeError.
 *
 * readOnly({ a: 1 }).a       -> 1
 * readOnly({ a: 1 }).a = 2   -> TypeError
 */
export function readOnly(target) {
  // TODO: a set trap returning false throws in strict mode — but throw
  // explicitly so the message is useful
  throw new Error('readOnly: not implemented');
}

/**
 * `validators` maps property names to predicates. Assigning a value that fails
 * its predicate throws a TypeError. Properties with no validator are allowed.
 *
 * const user = validated({}, { age: (v) => typeof v === 'number' });
 * user.age = 30;      // fine
 * user.age = 'old';   // TypeError
 */
export function validated(target, validators) {
  // TODO: remember that a set trap must return true on success
  throw new Error('validated: not implemented');
}

/**
 * Negative indices count from the end, Python-style. Everything else — length,
 * methods, iteration, normal indices — must keep working.
 *
 * negativeIndex([1, 2, 3])[-1] -> 3
 * negativeIndex([1, 2, 3])[0]  -> 1
 * negativeIndex([1, 2, 3]).length -> 3
 */
export function negativeIndex(array) {
  // TODO: property keys arrive as STRINGS
  throw new Error('negativeIndex: not implemented');
}

/**
 * Call onGet(prop) for every property read, then return the real value.
 * Symbol keys must not be reported — they are internal machinery.
 */
export function observed(target, onGet) {
  // TODO
  throw new Error('observed: not implemented');
}

/**
 * Return { proxy, counts } where counts is a live object tallying operations:
 *   { get, set, has, deleteProperty }
 * All four start at 0 and increment as those operations happen.
 * The underlying behaviour must be unchanged.
 */
export function countingProxy(target) {
  // TODO
  throw new Error('countingProxy: not implemented');
}
