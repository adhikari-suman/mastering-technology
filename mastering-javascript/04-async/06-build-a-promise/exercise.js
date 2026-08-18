/**
 * Part 04, Lesson 06 — Build a Promise
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 *
 * RULE: no native Promise anywhere. No async/await either — that creates
 * native promises. Use queueMicrotask for the asynchrony.
 */

/**
 * A promise implementation.
 *
 *   new MyPromise((resolve, reject) => { ... })
 *
 * Requirements:
 *  - the executor runs SYNCHRONOUSLY, immediately
 *  - an executor that throws rejects the promise
 *  - settling twice is ignored; the first outcome wins
 *  - .then(onFulfilled, onRejected) returns a NEW MyPromise
 *  - handlers ALWAYS run asynchronously, via queueMicrotask
 *  - a handler returning a thenable adopts it
 *  - a missing handler passes the value or reason through
 *  - .catch(fn) is .then(undefined, fn)
 *  - .finally(fn) runs on both paths and passes through
 */
// TODO: export class MyPromise { ... }

/**
 * Statics on MyPromise (attach them to the class):
 *
 *   MyPromise.resolve(value)     already-fulfilled (adopts a thenable)
 *   MyPromise.reject(reason)     already-rejected
 *   MyPromise.all(items)         all values, or the first rejection
 *   MyPromise.allSettled(items)  never rejects
 *   MyPromise.race(items)        first to settle
 *
 * All of them return a MyPromise, not a native one.
 */

/**
 * An externally-settleable promise.
 *
 * const d = deferred();
 * d.resolve(5);
 * d.promise.then(v => ...)   // v === 5
 */
export function deferred() {
  // TODO
  throw new Error('deferred: not implemented');
}
