/**
 * Part 08, Lesson 02 — Reflect
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
 * Define a property, returning true on success and false on failure instead of
 * throwing the way Object.defineProperty does.
 */
export function safeDefine(obj, key, descriptor) {
  // TODO
  throw new Error('safeDefine: not implemented');
}

/**
 * EVERY own key — strings and symbols, enumerable and not — in one call.
 */
export function allKeys(obj) {
  // TODO
  throw new Error('allKeys: not implemented');
}

/**
 * A proxy that calls log(prop) on every string-keyed read, then forwards
 * through Reflect.get WITH the receiver, so getters run against the proxy and
 * their internal reads are intercepted too.
 */
export function forwardingProxy(target, log) {
  // TODO
  throw new Error('forwardingProxy: not implemented');
}

/**
 * The same, but deliberately WRONG: forward with `target[prop]` instead of
 * Reflect.get with the receiver.
 *
 * Written on purpose so the test can show what breaks — reads made inside a
 * getter are not intercepted.
 */
export function brokenProxy(target, log) {
  // TODO
  throw new Error('brokenProxy: not implemented');
}

/**
 * Demonstrate the difference. `target` must have a getter that reads another
 * property of itself.
 *
 * Return { forwarded, broken } — the arrays of property names each proxy
 * logged when its getter property was read once.
 *
 * The forwarding version sees the nested read; the broken one does not.
 */
export function receiverMatters(target) {
  // TODO
  throw new Error('receiverMatters: not implemented');
}

/**
 * Construct an instance via Reflect rather than the `new` operator.
 */
export function construct(Ctor, args) {
  // TODO
  throw new Error('construct: not implemented');
}

/**
 * Return an object mapping each Proxy trap name to whether Reflect has a
 * method of the same name:
 *   { get: true, set: true, has: true, ... }
 *
 * Check these seven: get, set, has, deleteProperty, ownKeys, apply, construct.
 * Compute it — don't hardcode the answers.
 */
export function describeOperations() {
  // TODO
  throw new Error('describeOperations: not implemented');
}
