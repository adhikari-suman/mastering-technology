/**
 * Lesson 02 — Operators and Coercion
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
 * PART 1 — Predict, then verify.
 *
 * Replace every 'TODO' with what you believe the expression evaluates to.
 * Do this from your head, BEFORE running the tests or the REPL. Getting one
 * wrong is the most useful thing that can happen in this lesson.
 */
export const PREDICTIONS = {
  'null == undefined': 'TODO',
  'null === undefined': 'TODO',
  'null == 0': 'TODO',
  'null >= 0': 'TODO',
  '0 == "0"': 'TODO',
  '0 == ""': 'TODO',
  '"" == "0"': 'TODO',
  'NaN == NaN': 'TODO',
  '[] == false': 'TODO',
  'typeof NaN': 'TODO',
  '1 + "2"': 'TODO',
  '"3" - 1': 'TODO',
  '"3" * "4"': 'TODO',
  '[] + {}': 'TODO',
  'Boolean([])': 'TODO',
  'Boolean("false")': 'TODO',
};

/**
 * PART 2 — Implement.
 */

/**
 * Return true if the value is truthy. Do not write a list of comparisons —
 * let the language convert it for you.
 */
export function isTruthy(value) {
  // TODO
  throw new Error('isTruthy: not implemented');
}

/**
 * Return `value`, unless it is null or undefined — then return `fallback`.
 * A legitimate 0, "", or false must survive.
 *
 * defaultTo(0, 100)    -> 0
 * defaultTo(null, 100) -> 100
 */
export function defaultTo(value, fallback) {
  // TODO: which operator preserves 0 and ""?
  throw new Error('defaultTo: not implemented');
}

/**
 * Return `value`, unless it is falsy in any way — then return `fallback`.
 * The deliberate contrast with defaultTo above.
 *
 * orDefault(0, 100)    -> 100
 * orDefault('hi', 'x') -> 'hi'
 */
export function orDefault(value, fallback) {
  // TODO
  throw new Error('orDefault: not implemented');
}

/**
 * Add two values that may have arrived as strings (from a form, a URL, a CSV).
 * Return null if either one isn't numeric.
 *
 * addNumeric('10', 5)   -> 15   (not '105')
 * addNumeric('10', 'x') -> null
 */
export function addNumeric(a, b) {
  // TODO
  throw new Error('addNumeric: not implemented');
}

/**
 * A comparator, the shape Array.prototype.sort expects.
 * Return a negative number if a sorts before b, positive if after, 0 if equal.
 */
export function compare(a, b) {
  // TODO
  throw new Error('compare: not implemented');
}

/**
 * Test for "null or undefined" and nothing else.
 * This is the one place `==` earns its keep — but `===` twice is fine too.
 */
export function isNullish(value) {
  // TODO
  throw new Error('isNullish: not implemented');
}
