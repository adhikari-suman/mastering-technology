/**
 * Part 01, Lesson 06 — any, unknown, never, void
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: the word `any` may not appear in your solution. Every stub here can be
 * written without it, and finding the version that can is the exercise.
 */

/**
 * `JSON.parse`, typed honestly. It returns `any` from the standard library,
 * which is a lie the rest of your program then believes. Return the truth.
 */
export function parseJson(text: string): unknown {
  throw new Error('parseJson: not implemented');
}

/**
 * Describe any value in one word, by narrowing rather than asserting:
 *
 *   null        -> 'null'
 *   an array    -> 'array'
 *   an object   -> 'object'
 *   a string    -> 'string'
 *   a number    -> 'number'
 *   a boolean   -> 'boolean'
 *   anything else -> 'other'
 */
export function describeValue(value: unknown): string {
  throw new Error('describeValue: not implemented');
}

/**
 * Always throws, with `message`. The return annotation is the exercise: get it
 * right and the checker knows that control flow stops at a call to this.
 */
export function fail(message: string): never {
  throw new Error('fail: not implemented');
}

/**
 * The exhaustiveness tool. You'll use it in every Part from here on.
 *
 * Called from a branch that should be unreachable. The parameter type is what
 * makes it work: if every case of a union really has been handled, whatever is
 * left is `never` and the call compiles. Miss one and it won't.
 *
 * At runtime it throws, including the unexpected value in the message.
 */
export function assertNever(value: never): never {
  throw new Error('assertNever: not implemented');
}

/**
 * Call every callback in order. The parameter type says the return values are
 * not to be used — which is what lets a caller pass `() => arr.push(x)`.
 */
export function runAll(fns: readonly (() => void)[]): void {
  throw new Error('runAll: not implemented');
}

/**
 * Pull a message out of whatever was thrown. `catch` gives you `unknown` under
 * `strict`, and almost anything can be thrown:
 *
 *   an Error       -> its .message
 *   a string       -> itself
 *   anything else  -> 'unknown error'
 */
export function errorMessage(thrown: unknown): string {
  throw new Error('errorMessage: not implemented');
}
