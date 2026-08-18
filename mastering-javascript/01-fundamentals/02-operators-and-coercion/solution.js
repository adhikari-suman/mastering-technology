/**
 * PART 1 — Predict, then verify.
 *
 * Replace every 'TODO' with what you believe the expression evaluates to.
 * Do this from your head, BEFORE running the tests or the REPL. Getting one
 * wrong is the most useful thing that can happen in this lesson.
 */
export const PREDICTIONS = {
  "null == undefined": true,
  "null === undefined": false,
  "null == 0": false,
  "null >= 0": true,
  '0 == "0"': true, // 0 == "0" => 0 == 0 => true
  '0 == ""': true, // 0 == "" => 0 == 0 => true
  '"" == "0"': false, // string vs string false
  "NaN == NaN": false, // NaN vs NaN false
  "[] == false": true, // [] == false => [] == 0 => "" == 0 => 0 == 0
  "typeof NaN": "number", // number
  '1 + "2"': "12", // 1 + "2"
  '"3" - 1': 2,
  '"3" * "4"': 12,
  "[] + {}": "[object Object]",
  "Boolean([])": true,
  'Boolean("false")': true,
};

/**
 * PART 2 — Implement.
 */

/**
 * Return true if the value is truthy. Do not write a list of comparisons —
 * let the language convert it for you.
 */
export function isTruthy(value) {
  return !!value;
}

/**
 * Return `value`, unless it is null or undefined — then return `fallback`.
 * A legitimate 0, "", or false must survive.
 *
 * defaultTo(0, 100)    -> 0
 * defaultTo(null, 100) -> 100
 */
export function defaultTo(value, fallback) {
  return value ?? fallback;
}

/**
 * Return `value`, unless it is falsy in any way — then return `fallback`.
 * The deliberate contrast with defaultTo above.
 *
 * orDefault(0, 100)    -> 100
 * orDefault('hi', 'x') -> 'hi'
 */
export function orDefault(value, fallback) {
  return value || fallback;
}

/**
 * Add two values that may have arrived as strings (from a form, a URL, a CSV).
 * Return null if either one isn't numeric.
 *
 * addNumeric('10', 5)   -> 15   (not '105')
 * addNumeric('10', 'x') -> null
 */
export function addNumeric(a, b) {
  a = Number(a);
  b = Number(b);

  if (Number.isNaN(a) || Number.isNaN(b)) {
    return null;
  }

  return a + b;
}

/**
 * A comparator, the shape Array.prototype.sort expects.
 * Return a negative number if a sorts before b, positive if after, 0 if equal.
 */
export function compare(a, b) {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  }

  return 0;
}

/**
 * Test for "null or undefined" and nothing else.
 * This is the one place `==` earns its keep — but `===` twice is fine too.
 */
export function isNullish(value) {
  return value == null; // for == null and undefined are same thing.
}
