/**
 * Write this as a function DECLARATION.
 * square(4) -> 16
 */
export function square(n) {
  return n * n;
}

/**
 * Write this as a function EXPRESSION assigned to a const.
 * cube(3) -> 27
 */
export const cube = function (n) {
  return n * n * n;
};

/**
 * Write this as an ARROW function with an implicit return (no braces).
 * double(5) -> 10
 */
export const double = (n) => n * 2;

/**
 * Default parameter. `greeting` defaults to 'Hello'.
 *
 * makeGreeting('Ada')          -> 'Hello, Ada!'
 * makeGreeting('Ada', 'Howdy') -> 'Howdy, Ada!'
 */
export function makeGreeting(name, greeting = "Hello") {
  return `${greeting}, ${name}!`;
}

/**
 * Rest parameters. Sum any number of arguments.
 *
 * sumAll(1, 2, 3) -> 6
 * sumAll()        -> 0
 */
export function sumAll(...numbers) {
  let total = 0;
  for (let num of numbers) {
    total += num;
  }

  return total;
}

/**
 * Higher-order: apply `fn` to `value` twice.
 *
 * applyTwice(n => n + 3, 1) -> 7
 */
export function applyTwice(fn, value) {
  return fn(fn(value));
}

/**
 * Return a NEW function that adds `amount` to whatever it is given.
 *
 * const add5 = makeAdder(5);
 * add5(10) -> 15
 */
export function makeAdder(amount) {
  return (n) => n + amount;
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
  let count = 1;

  return function () {
    return count++;
  };
}

/**
 * Arrow function with an implicit return of an OBJECT literal.
 * Remember the parentheses.
 *
 * makePoint(1, 2) -> { x: 1, y: 2 }
 */
export const makePoint = (x, y) => ({ x, y });
