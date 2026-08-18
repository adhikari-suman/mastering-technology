/**
 * Part 07, Lesson 04 — Circular Imports
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 *
 * ./fixtures/a.js and ./fixtures/b.js import each other. Read them — they are
 * the subject of this lesson. Don't edit them.
 *
 * Import everything from './fixtures/entry.js', NOT from a.js or b.js directly.
 * entry.js pins the evaluation order, so the cycle behaves identically however
 * you write your solution. Importing a.js and b.js yourself in the other order
 * would flip which module sees the temporal dead zone.
 */

/**
 * PART 1 — Predict. Answer from your head, then read the fixtures.
 *
 * Use 'works' or 'TDZ' for each.
 */
export const CYCLE_PREDICTIONS = {
  // a.js reads b's `bValue` at the top level of its own body.
  // a is the entry point, so b finished evaluating first.
  'a reads bValue during its own evaluation': 'TODO',

  // b.js reads a's `aValue` at the top level of its own body.
  // b runs while a is still in progress.
  'b reads aValue during its own evaluation': 'TODO',

  // Both modules call each other's exported functions AFTER everything loaded.
  'either module calls the other after evaluation': 'TODO',
};

/**
 * PART 2 — Implement. Import from './fixtures/entry.js'.
 */

/**
 * Call `callA` from a.js, which calls into b.js.
 * callAcrossCycle() -> 'a -> b'
 */
export function callAcrossCycle() {
  // TODO
  throw new Error('callAcrossCycle: not implemented');
}

/**
 * Read both values LATE, through the functions the fixtures export for it.
 * valuesAtCallTime() -> { a: 'a', b: 'b' }
 *
 * Both are re-exported by entry.js.
 */
export function valuesAtCallTime() {
  // TODO
  throw new Error('valuesAtCallTime: not implemented');
}

/**
 * Report what each module saw DURING evaluation, using the two constants the
 * fixtures captured:
 *
 *   { aSawB, bSawA }
 *
 * aSawB comes from bValueSeenDuringEvaluation.
 * bSawA comes from aValueSeenDuringEvaluation.
 *
 * One of them is a real value and the other is the string 'TDZ'. That
 * asymmetry IS the lesson.
 */
export function evaluationOrderEffects() {
  // TODO
  throw new Error('evaluationOrderEffects: not implemented');
}

/**
 * Break a cycle by deferring: return a function that dynamically imports
 * './fixtures/b.js' when CALLED and resolves to its bValue, rather than
 * importing it at the top of this module.
 *
 * await breakCycle()() -> 'b'
 */
export function breakCycle() {
  // TODO
  throw new Error('breakCycle: not implemented');
}
