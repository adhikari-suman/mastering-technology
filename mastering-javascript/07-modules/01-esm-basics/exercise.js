/**
 * Part 07, Lesson 01 — ES Modules
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 *
 * The ./fixtures/ folder holds modules to import. Don't edit those either.
 */

/**
 * Import `count` and `increment` from './fixtures/counter.js'.
 *
 * readCount() returns the CURRENT value of the imported `count`.
 * bumpCount() calls increment().
 *
 * If imports were copies, readCount would always return the same number.
 * They are live bindings, so it changes.
 */
export function readCount() {
  // TODO
  throw new Error('readCount: not implemented');
}

export function bumpCount() {
  // TODO
  throw new Error('bumpCount: not implemented');
}

/**
 * Given a module namespace object, return its keys sorted alphabetically.
 *
 * namespaceKeys(await import('./fixtures/shapes.js')) -> ['area', 'circle', 'square']
 */
export function namespaceKeys(ns) {
  // TODO
  throw new Error('namespaceKeys: not implemented');
}

/**
 * The default export held in a namespace object, or undefined if there is none.
 * Remember: the default is a named export called 'default'.
 */
export function defaultOf(ns) {
  // TODO
  throw new Error('defaultOf: not implemented');
}

/**
 * Re-export `area` from './fixtures/shapes.js' under the name `reexported`.
 * Use export ... from syntax, or import then export.
 */
// TODO: export { area as reexported } from './fixtures/shapes.js';

/**
 * True if `value` is a module namespace object.
 * Hint: they carry Symbol.toStringTag === 'Module'.
 */
export function isModuleNamespace(value) {
  // TODO
  throw new Error('isModuleNamespace: not implemented');
}

/**
 * Export the value of `this` at the top level of this module.
 * In an ES module it is NOT globalThis.
 */
// TODO: export const moduleThis = ...;
