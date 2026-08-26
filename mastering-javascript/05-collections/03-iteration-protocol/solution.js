/**
 * Part 05, Lesson 03 — The Iteration Protocol
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 *
 * RULE: no generator functions in this lesson — write [Symbol.iterator] and
 * next() by hand. Generators are lesson 04.
 */

/**
 * A RE-ITERABLE range object. `step` defaults to 1, `to` is exclusive.
 *
 *   [...makeRange(0, 3)]      -> [0, 1, 2]
 *   [...makeRange(0, 6, 2)]   -> [0, 2, 4]
 *   [...makeRange(3, 0)]      -> []
 *
 * Iterating the same range twice must give the same values both times.
 */
export function makeRange(from, to, step = 1) {
  return {
    [Symbol.iterator]() {
      let curr = from;

      return {
        next: function () {
          if (curr >= to)
            return {
              value: undefined,
              done: true,
            };

          const value = curr;
          curr += step;
          return { value, done: false };
        },
      };
    },
  };
}

/**
 * Return the raw iterator for an iterable.
 * toIterator([1,2]).next() -> { value: 1, done: false }
 */
export function toIterator(iterable) {
  return iterable[Symbol.iterator]();
}

/**
 * The first `n` values of an iterable, as an array.
 * Must work on an INFINITE iterable — pull only what you need.
 */
export function take(iterable, n) {
  let result = [];

  const iterator = iterable[Symbol.iterator]();

  while (n > 0) {
    const item = iterator.next();

    if (item.done === false) {
      result.push(item.value);
    }

    n--;
  }

  return result;
}

/**
 * Pair values from two iterables, stopping when the shorter runs out.
 *
 * zip([1, 2, 3], 'ab') -> [[1, 'a'], [2, 'b']]
 */
export function zip(a, b) {
  const iteratorA = a[Symbol.iterator]();
  const iteratorB = b[Symbol.iterator]();

  let isFinished = false;
  let result = [];

  while (!isFinished) {
    const itemA = iteratorA.next();
    const itemB = iteratorB.next();

    if (!itemA.done && !itemB.done) result.push([itemA.value, itemB.value]);
    else isFinished = true;
  }

  return result;
}

/**
 * [index, value] pairs.
 * enumerate('ab') -> [[0, 'a'], [1, 'b']]
 */
export function enumerate(iterable) {
  const iterator = iterable[Symbol.iterator]();
  let idx = 0;
  const result = [];

  for (let item = iterator.next(); !item.done; item = iterator.next(), idx++) {
    result.push([idx, item.value]);
  }

  return result;
}

/**
 * True if `value` implements the iterable protocol.
 * Strings, arrays, Maps and Sets are iterable. Plain objects, numbers,
 * null and undefined are not.
 */
export function isIterable(value) {
  return value != null && typeof value[Symbol.iterator] === "function";
}

/**
 * An object that is BOTH an iterator (has next()) and iterable
 * ([Symbol.iterator] returning itself), counting up from 0 forever.
 *
 *   const c = counter();
 *   c.next().value  -> 0
 *   take(c, 2)      -> [1, 2]      (continues where it left off)
 */
export function counter() {
  let count = 0;

  return {
    [Symbol.iterator]() {
      return this;
    },

    next() {
      return {
        value: count++,
        done: false,
      };
    },
  };
}
