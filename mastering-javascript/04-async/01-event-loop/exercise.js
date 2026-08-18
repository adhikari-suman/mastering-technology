/**
 * Part 04, Lesson 01 — The Event Loop
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
 * PART 1 — Predict the output order of each snippet, as an array of strings.
 * Answer from your head BEFORE running anything.
 */
export const ORDER_PREDICTIONS = {
  //   console.log('1');
  //   setTimeout(() => console.log('2'), 0);
  //   Promise.resolve().then(() => console.log('3'));
  //   console.log('4');
  basic: 'TODO', // e.g. ['1', '4', '3', '2']

  //   async function f() { console.log('a'); await null; console.log('b'); }
  //   f();
  //   console.log('c');
  awaitSplit: 'TODO',

  //   setTimeout(() => console.log('t1'), 0);
  //   Promise.resolve().then(() => { console.log('p1'); return Promise.resolve(); })
  //                    .then(() => console.log('p2'));
  //   setTimeout(() => console.log('t2'), 0);
  //
  //   Careful: returning a promise from .then costs extra microtask ticks
  //   before the next .then runs. Do those ticks let a timer in?
  chained: 'TODO',

  //   Promise.resolve().then(() => {
  //     console.log('outer');
  //     Promise.resolve().then(() => console.log('inner'));
  //   });
  //   setTimeout(() => console.log('timer'), 0);
  nested: 'TODO',
};

/**
 * PART 2 — Implement.
 */

/**
 * Return a promise resolving to the order things actually ran, using exactly
 * this schedule:
 *   - push 'sync' immediately
 *   - schedule 'macro' with setTimeout(..., 0)
 *   - schedule 'micro' with a resolved promise's .then
 *   - push 'sync-end' immediately
 * Resolve once all of them have run.
 *
 * recordOrder() -> ['sync', 'sync-end', 'micro', 'macro']
 */
export function recordOrder() {
  // TODO
  throw new Error('recordOrder: not implemented');
}

/**
 * A promise that resolves on the MICROTASK queue.
 * Anything awaiting it runs before any pending setTimeout.
 */
export function nextMicrotask() {
  // TODO
  throw new Error('nextMicrotask: not implemented');
}

/**
 * A promise that resolves on the MACROTASK queue.
 * Anything awaiting it runs after all pending microtasks.
 */
export function nextMacrotask() {
  // TODO
  throw new Error('nextMacrotask: not implemented');
}

/**
 * Run `fn` only after every currently-pending microtask has run, and return a
 * promise for its result.
 *
 * Queue three microtasks, then call runAfterDrain — fn runs fourth.
 */
export function runAfterDrain(fn) {
  // TODO: a macrotask is scheduled after the microtask queue drains
  throw new Error('runAfterDrain: not implemented');
}

/**
 * Queue `n` microtasks that each push their index into an array, plus one
 * macrotask that stops the recording. Resolve with the array.
 *
 * Every microtask must appear before the macrotask stops it, proving the whole
 * queue drains in a single pass.
 *
 * isStarved(3) -> [0, 1, 2]
 */
export function isStarved(n) {
  // TODO
  throw new Error('isStarved: not implemented');
}
