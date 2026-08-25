/**
 * Part 02, Lesson 06 — Composition
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
 * Returns its argument, unchanged.
 * identity(5) -> 5
 */
export function identity(x) {
  return x;
}

/**
 * Compose left to right: the first function runs first.
 *
 * pipe(f, g, h)(x) -> h(g(f(x)))
 * pipe()(x)        -> x          (no functions means no transformation)
 *
 * pipe(s => s.toUpperCase(), s => `${s}!`)('hi') -> 'HI!'
 */
export function pipe(...fns) {
  return (x) => fns.reduce((acc, fn) => fn(acc), x);
}

/**
 * Compose right to left: the LAST function runs first. The mathematical order.
 *
 * compose(f, g, h)(x) -> f(g(h(x)))
 * compose()(x)        -> x
 *
 * compose(s => `${s}!`, s => s.toUpperCase())('hi') -> 'HI!'
 */
export function compose(...fns) {
  const ordered = [...fns].reverse();

  return (x) => ordered.reduce((acc, fn) => fn(acc), x);
}

/**
 * Run `fn` for its side effect, then return the original value untouched.
 * Whatever `fn` returns is thrown away.
 *
 * const seen = [];
 * pipe(tap(v => seen.push(v)), n => n * 2)(5) -> 10, and seen is [5]
 */
export function tap(fn) {
  return (x) => {
    fn(x);

    return x;
  };
}

/**
 * Apply every function to the same input and collect the results in order.
 *
 * juxt(n => n + 1, n => n * 2)(5) -> [6, 10]
 * juxt()(5)                       -> []
 */
export function juxt(...fns) {
  return (x) => {
    if (fns.length === 0) return [];

    return fns.reduce((acc, fn) => [...acc, fn(x)], []);
  };
}

/**
 * Return a predicate that is the logical opposite of the one given.
 * Arguments are passed through.
 *
 * const isEven = n => n % 2 === 0;
 * complement(isEven)(3) -> true
 */
export function complement(predicate) {
  return (...args) => !predicate(...args);
}
