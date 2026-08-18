/**
 * Part 02, Lesson 05 — Currying and Partial Application
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
 * Curry `fn`, using its declared arity (fn.length) to decide when it has
 * enough arguments. Accept them one at a time or several at a time.
 *
 * const add = (a, b, c) => a + b + c;
 * curry(add)(1)(2)(3)  -> 6
 * curry(add)(1, 2)(3)  -> 6
 * curry(add)(1, 2, 3)  -> 6
 */
export function curry(fn) {
  // TODO: collect arguments until args.length >= fn.length
  throw new Error('curry: not implemented');
}

/**
 * The same, but you state the arity — for functions whose `length` lies
 * (defaults, rest parameters).
 *
 * curryN(2, (...args) => args.length)(1)(2) -> 2
 */
export function curryN(n, fn) {
  // TODO
  throw new Error('curryN: not implemented');
}

/**
 * Fix the leading arguments. The returned function takes the rest.
 *
 * const greet = (greeting, name) => `${greeting}, ${name}`;
 * partial(greet, 'Hi')('Ada') -> 'Hi, Ada'
 */
export function partial(fn, ...preset) {
  // TODO
  throw new Error('partial: not implemented');
}

/**
 * Fix the TRAILING arguments. Later arguments go in front of the preset ones.
 *
 * const greet = (greeting, name) => `${greeting}, ${name}`;
 * partialRight(greet, 'Ada')('Hi') -> 'Hi, Ada'
 */
export function partialRight(fn, ...preset) {
  // TODO
  throw new Error('partialRight: not implemented');
}

/**
 * Return a function that passes exactly one argument through, whatever it is
 * called with. This is the fix for ['1','2','3'].map(parseInt).
 *
 * unary(parseInt)('2', 1) -> 2   (the stray second argument is dropped)
 */
export function unary(fn) {
  // TODO
  throw new Error('unary: not implemented');
}

/**
 * Swap the first two arguments. Any further arguments keep their order.
 *
 * const divide = (a, b) => a / b;
 * flip(divide)(2, 10) -> 5
 */
export function flip(fn) {
  // TODO
  throw new Error('flip: not implemented');
}
