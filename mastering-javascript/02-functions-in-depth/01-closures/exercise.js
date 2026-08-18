/**
 * Part 02, Lesson 01 — Closures
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests. (Don't copy run commands out of
 * this header into your solution.js — they go stale; the README doesn't.)
 */

/**
 * Private state. Return an object with `get()` and `set(value)`.
 * The value must live in the closure — not as a property on the returned
 * object, where anything could reach it.
 *
 * const s = makeSecret(1);
 * s.get()   -> 1
 * s.set(9);
 * s.get()   -> 9
 * Object.values(s).includes(9)  -> false   (the value is not a property)
 */
export function makeSecret(initial) {
  // TODO
  throw new Error('makeSecret: not implemented');
}

/**
 * Return a function that calls `fn` at most once. Every later call returns the
 * first result without invoking `fn` again. Arguments of the first call are
 * passed through.
 *
 * const init = once(() => Math.random());
 * init() === init()   -> true
 */
export function once(fn) {
  // TODO: a flag and a stored result, both private
  throw new Error('once: not implemented');
}

/**
 * Cache `fn`'s results by its first argument, so a repeated argument never
 * runs `fn` again. Assume the argument is a string or a number.
 *
 * let calls = 0;
 * const slow = memoize((n) => { calls++; return n * 2; });
 * slow(2); slow(2);
 * calls -> 1
 */
export function memoize(fn) {
  // TODO
  throw new Error('memoize: not implemented');
}

/**
 * Return a function that adds its argument to a running total and returns the
 * new total. The total starts at 0 and is private.
 *
 * const add = makeAccumulator();
 * add(5)   -> 5
 * add(3)   -> 8
 */
export function makeAccumulator() {
  // TODO
  throw new Error('makeAccumulator: not implemented');
}

/**
 * Build three functions inside a loop, each returning its own loop index, then
 * call them all and return the results.
 *
 * captureLoopVar() -> [0, 1, 2]
 *
 * The point is the binding: get this wrong and you get [3, 3, 3].
 */
export function captureLoopVar() {
  // TODO
  throw new Error('captureLoopVar: not implemented');
}

/**
 * A bank account. Return { deposit, withdraw, getBalance }.
 * - deposit(amount)  adds and returns the new balance
 * - withdraw(amount) subtracts and returns the new balance, but refuses to
 *   overdraw: if amount > balance, leave the balance alone and return null
 * - getBalance()     returns the current balance
 *
 * The balance must not be reachable except through these three functions.
 */
export function createBank(balance) {
  // TODO
  throw new Error('createBank: not implemented');
}

/**
 * Return a function that calls `fn` at most `max` times. After that it stops
 * calling `fn` and returns undefined.
 *
 * const f = limit(() => 'ok', 2);
 * f() -> 'ok'
 * f() -> 'ok'
 * f() -> undefined
 */
export function limit(fn, max) {
  // TODO
  throw new Error('limit: not implemented');
}
