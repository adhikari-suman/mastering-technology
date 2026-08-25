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
  return (() => {
    let value = initial;

    return {
      get: () => value,
      set: (x) => {
        value = x;
      },
    };
  })();
}

/**
 * Return a function that calls `fn` at most once. Every later call returns the
 * first result without invoking `fn` again. Arguments of the first call are
 * passed through.
 *
 * const init = once(() => Math.random());
 * init() === init()   -> true
 */
// (a,b )=> a + b
export function once(fn) {
  let value = null;
  let called = false;

  return (...args) => {
    if (!called) {
      called = true;
      value = fn(...args);
    }

    return value;
  };
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
  let cache = new Map();

  return (...args) => {
    const key = args[0];

    if (!cache.has(key)) {
      cache.set(key, fn(...args));
    }

    return cache.get(key);
  };
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
  let value = 0;

  return (x) => {
    value += x;
    return value;
  };
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
  let fns = [];

  for (let idx = 0; idx < 3; idx++) {
    fns.push(function () {
      return idx;
    });
  }

  return fns.map((fn) => fn());
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
  let totalBalance = balance;

  return {
    deposit: function (amount) {
      totalBalance += amount;
      return totalBalance;
    },
    withdraw: function (amount) {
      if (amount > totalBalance) {
        return null;
      }

      totalBalance -= amount;

      return totalBalance;
    },
    getBalance: () => totalBalance,
  };
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
  let limit = max;

  return (...args) => {
    if (limit-- > 0) {
      return fn(...args);
    }

    return undefined;
  };
}
