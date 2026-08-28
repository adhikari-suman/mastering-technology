/**
 * Part 02, Lesson 01 — Control-flow analysis
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `as`, and no `any`. Every stub here is reachable by narrowing, and
 * an assertion that skips the narrowing is the one thing that teaches nothing.
 */

/**
 * Name the kind of a value:
 *   'string' | 'number' | 'boolean' | 'nullish' | 'other'
 * `null` and `undefined` both count as 'nullish'.
 */
export function classify(value: unknown): string {
  throw new Error('classify: not implemented');
}

/**
 * Describe an input, keeping the falsy-but-real values:
 *   'text:abc'   for a string     ('' gives 'text:')
 *   'number:0'   for a number     (0 is a number, not nothing)
 *   'nothing'    for null
 */
export function describeInput(value: string | number | null): string {
  throw new Error('describeInput: not implemented');
}

/**
 * The first entry that is a string of length > 0, or `undefined` if there
 * isn't one. Note the element type — every read needs two things ruled out.
 */
export function firstNonEmpty(values: readonly (string | null | undefined)[]): string | undefined {
  throw new Error('firstNonEmpty: not implemented');
}

/**
 * The length of `value` when it is a string or an array, and `-1` otherwise.
 * Both branches need narrowing; only one of them has a built-in guard.
 */
export function readLength(value: unknown): number {
  throw new Error('readLength: not implemented');
}

/**
 * Read `key` off `value` when `value` is a non-null object that has it, and
 * return `undefined` otherwise. Three things must be true before the read is
 * legal, and `typeof value === 'object'` is only the first.
 */
export function getIn(value: unknown, key: string): unknown {
  throw new Error('getIn: not implemented');
}

/**
 * Turn a thrown-shaped value into a message:
 *   an Error  -> its .message
 *   a string  -> itself
 *   a number  -> its decimal form
 */
export function toMessage(value: Error | string | number): string {
  throw new Error('toMessage: not implemented');
}
