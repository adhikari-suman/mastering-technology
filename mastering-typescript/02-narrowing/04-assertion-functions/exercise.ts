/**
 * Part 02, Lesson 04 — Assertion functions
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `as`, no `any`, and no `!`. The whole point of this Lesson is the
 * honest replacement for that last one.
 *
 * CONVENTION: every stub below is annotated `void`, which compiles and narrows
 * nothing. Replacing that with the right `asserts` form is half the exercise;
 * the TYPES light stays red until you do.
 */

/** Thrown by every assertion here. */
export class AssertionError extends Error {
  override readonly name = 'AssertionError';
}

/**
 * Narrow any condition. Throws an `AssertionError` carrying `message` (or
 * 'Assertion failed' when none is given) if `condition` is falsy.
 *
 *   assert(typeof x === 'string');
 *   x.length;   // narrowed from here on
 *
 * Mind the return annotation — this is the bare `asserts` form, and it is not
 * `boolean`.
 */
export function assert(condition: unknown, message?: string): void {  // TODO: this annotation is wrong on purpose
  throw new Error('assert: not implemented');
}

/** Assert that `value` is a string; throws otherwise. */
export function assertIsString(value: unknown, name = 'value'): void {  // TODO: this annotation is wrong on purpose
  throw new Error('assertIsString: not implemented');
}

/**
 * Assert that `value` is a number. `NaN` is a number and passes — if you want
 * to exclude it, that is a different assertion.
 */
export function assertIsNumber(value: unknown, name = 'value'): void {  // TODO: this annotation is wrong on purpose
  throw new Error('assertIsNumber: not implemented');
}

/**
 * Generic: strip `null` and `undefined`, keeping whatever `T` was. The message
 * names the value, so a failure says which one was missing.
 *
 * Message format: `${name} is required`
 */
export function assertDefined<T>(
  value: T | null | undefined,
  name = 'value',
): void {  // TODO: this annotation is wrong on purpose
  throw new Error('assertDefined: not implemented');
}

/**
 * Parse a port out of an environment-shaped record, using the assertions above
 * rather than casts or `!`.
 *
 *   { PORT: '8080' } -> 8080
 *
 * Throws an AssertionError when PORT is absent, is not a string, or does not
 * parse to an integer in 1..65535. The messages are asserted by the tests:
 *
 *   absent            'PORT is required'
 *   not a string      'PORT must be a string'
 *   unparseable       'PORT must be an integer'
 *   out of range      'PORT must be between 1 and 65535'
 */
export function parsePort(env: Record<string, unknown>): number {
  throw new Error('parsePort: not implemented');
}
