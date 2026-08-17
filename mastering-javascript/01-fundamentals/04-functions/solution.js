/**
 * Lesson 04 — Functions
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * Run `node --test --watch` from inside this folder.
 */

/**
 * Write this as a function DECLARATION.
 * square(4) -> 16
 */
// TODO: export function square(n) { ... }

/**
 * Write this as a function EXPRESSION assigned to a const.
 * cube(3) -> 27
 */
// TODO: export const cube = function (n) { ... };

/**
 * Write this as an ARROW function with an implicit return (no braces).
 * double(5) -> 10
 */
// TODO: export const double = (n) => ...;

/**
 * Default parameter. `greeting` defaults to 'Hello'.
 *
 * makeGreeting('Ada')          -> 'Hello, Ada!'
 * makeGreeting('Ada', 'Howdy') -> 'Howdy, Ada!'
 */
export function makeGreeting(name, greeting) {
  // TODO: give greeting a default in the parameter list, not in the body
  throw new Error('makeGreeting: not implemented');
}

/**
 * Rest parameters. Sum any number of arguments.
 *
 * sumAll(1, 2, 3) -> 6
 * sumAll()        -> 0
 */
export function sumAll() {
  // TODO
  throw new Error('sumAll: not implemented');
}

/**
 * Higher-order: apply `fn` to `value` twice.
 *
 * applyTwice(n => n + 3, 1) -> 7
 */
export function applyTwice(fn, value) {
  // TODO
  throw new Error('applyTwice: not implemented');
}

/**
 * Return a NEW function that adds `amount` to whatever it is given.
 *
 * const add5 = makeAdder(5);
 * add5(10) -> 15
 */
export function makeAdder(amount) {
  // TODO
  throw new Error('makeAdder: not implemented');
}

/**
 * Return a counter function. Each call returns the next number, starting at 1.
 * Two separate counters must not interfere with each other.
 *
 * const next = makeCounter();
 * next() -> 1
 * next() -> 2
 */
export function makeCounter() {
  // TODO
  throw new Error('makeCounter: not implemented');
}

/**
 * Arrow function with an implicit return of an OBJECT literal.
 * Remember the parentheses.
 *
 * makePoint(1, 2) -> { x: 1, y: 2 }
 */
// TODO: export const makePoint = (x, y) => ...;
