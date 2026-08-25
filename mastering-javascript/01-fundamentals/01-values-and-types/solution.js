/**
 * Lesson 01 — Values and Types
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
 * Like `typeof`, but honest.
 * Returns 'null' for null and 'array' for arrays; otherwise the normal typeof.
 *
 * typeOf(null)  -> 'null'
 * typeOf([1,2]) -> 'array'
 * typeOf('hi')  -> 'string'
 */
export function typeOf(value) {
  if (Array.isArray(value)) {
    return "array";
  } else if (value === null) {
    return "null";
  } else {
    return typeof value;
  }
}

/**
 * Convert a value to a number. If the conversion fails, return null instead of
 * letting NaN escape into the rest of the program.
 *
 * toNumber('42')    -> 42
 * toNumber('42abc') -> null
 * toNumber(true)    -> 1
 */
export function toNumber(value) {
  const converted = Number(value);

  return Number.isNaN(converted) ? null : converted;
}

/**
 * True only when the value IS the NaN value. No coercion.
 *
 * isReallyNaN(NaN)     -> true
 * isReallyNaN('hello') -> false   (the old global isNaN would say true)
 */
export function isReallyNaN(value) {
  return Number.isNaN(value);
}

/**
 * Classify a number.
 *
 * 'not a number' — the argument isn't of type number, or it is NaN
 * 'infinite'     — Infinity or -Infinity
 * 'integer'      — a whole number
 * 'float'        — anything else
 */
export function describeNumber(n) {
  const converted = Number(n);

  if (typeof n !== "number" || Number.isNaN(converted)) {
    return "not a number";
  } else if (Math.abs(converted) === Infinity) {
    return "infinite";
  } else if (Number.isInteger(converted)) {
    return "integer";
  }

  return "float";
}

/**
 * Build a sentence with a template literal (backticks), not with + concatenation.
 *
 * formatIntro('Ada', 36) -> 'Ada is 36 years old.'
 */
export function formatIntro(name, age) {
  return `${name} is ${age} years old.`;
}

/**
 * Compare two floating-point numbers safely.
 * True when a and b differ by less than `epsilon`.
 *
 * almostEqual(0.1 + 0.2, 0.3) -> true
 * almostEqual(0.1, 0.2)       -> false
 */
export function almostEqual(a, b, epsilon = 1e-9) {
  const difference = a - b;

  return Math.abs(difference) < epsilon;
}
