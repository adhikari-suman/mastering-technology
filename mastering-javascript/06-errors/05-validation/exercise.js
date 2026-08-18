/**
 * Part 06, Lesson 05 — Validation and Boundaries
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 *
 * A rule is a function (value) => string | null, returning an error message
 * or null when the value is acceptable.
 */

/**
 * Fails on undefined, null and ''. Message: 'is required'.
 */
export function required(value) {
  // TODO
  throw new Error('required: not implemented');
}

/**
 * Fails unless typeof value is 'string'. Message: 'must be a string'.
 */
export function isString(value) {
  // TODO
  throw new Error('isString: not implemented');
}

/**
 * Fails unless it is a number and not NaN. Message: 'must be a number'.
 */
export function isNumber(value) {
  // TODO
  throw new Error('isNumber: not implemented');
}

/**
 * A RULE FACTORY: minLength(3) returns a rule failing with
 * 'must be at least 3 characters'.
 */
export function minLength(n) {
  // TODO
  throw new Error('minLength: not implemented');
}

/**
 * A rule factory: matches(/@/, 'must contain @') returns a rule using that
 * message.
 */
export function matches(pattern, message) {
  // TODO
  throw new Error('matches: not implemented');
}

/**
 * Run a schema — { field: [rule, rule] } — against an input object.
 * Collect EVERY failure, not just the first, and not just the first per field.
 *
 * Success -> { ok: true, value: input }
 * Failure -> { ok: false, errors: [{ field, message }, ...] }
 *
 * Errors are ordered by field (schema order), then by rule order.
 */
export function validate(input, schema) {
  // TODO
  throw new Error('validate: not implemented');
}

/**
 * Parse untrusted input into a known-good, NORMALISED user, or report errors.
 *
 * Success -> { ok: true, value: { email, age, tags } } where
 *   email: trimmed and lowercased string
 *   age:   a number, defaulting to 0 when missing or unparseable
 *   tags:  an array, defaulting to []
 *
 * Failure -> { ok: false, errors: [{ field, message }] }
 *   email is required and must contain '@' ('must contain @')
 *
 * The returned object must be a NEW object, not the input.
 */
export function parseUser(input) {
  // TODO
  throw new Error('parseUser: not implemented');
}

/**
 * Parse an environment-style object of strings into typed config:
 *   PORT      -> port: number, default 3000
 *   DEBUG     -> debug: boolean, true only for the exact string 'true'
 *   HOST      -> host: string, default 'localhost'
 *
 * A PORT that isn't a valid number is an error:
 *   { ok: false, errors: [{ field: 'PORT', message: 'must be a number' }] }
 */
export function parseConfig(env) {
  // TODO
  throw new Error('parseConfig: not implemented');
}

/**
 * Build a boundary. Returns a function that:
 *   - runs `parse` on its input
 *   - on failure returns { ok: false, errors }
 *   - on success calls handler(parsedValue) and returns { ok: true, value }
 *
 * The handler must NEVER see raw input — only the parsed value.
 */
export function atBoundary(parse, handler) {
  // TODO
  throw new Error('atBoundary: not implemented');
}
