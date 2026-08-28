/**
 * Part 02, Lesson 06 — The limits of narrowing
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `as`, no `any`, and no `!`. Every one of these is reachable by
 * narrowing alone — that is the exercise. Where the checker refuses, the fix is
 * to restructure the code, not to overrule it.
 */

/**
 * The entry at `index`, or `fallback` when it is missing or out of range.
 * `noUncheckedIndexedAccess` means the read is `string | undefined` — handle it
 * without asserting.
 */
export function pick(
  rows: readonly (string | undefined)[],
  index: number,
  fallback: string,
): string {
  throw new Error('pick: not implemented');
}

/**
 * Build a greeter that closes over a narrowed name.
 *
 *   makeGreeter('ada')() -> 'hello ada'
 *   makeGreeter(null)()  -> 'hello stranger'
 *
 * Narrow ONCE, outside the returned function, and let the closure capture the
 * narrowed value. If the checker complains inside the closure, you have hit the
 * assignment rule from the README — restructure rather than assert.
 */
export function makeGreeter(name: string | null): () => string {
  throw new Error('makeGreeter: not implemented');
}

/**
 * A nested, mostly-absent config: an optional `server`, itself carrying an
 * optional `host` and an optional `port`, both of the obvious types.
 */
export type Config = unknown; // TODO

/**
 * Describe the server:
 *   both present  -> 'host:port'      e.g. 'localhost:8080'
 *   host only     -> the host
 *   otherwise     -> 'unconfigured'
 */
export function describeServer(config: Config): string {
  throw new Error('describeServer: not implemented');
}

/**
 * Sum the non-null entries. Store the guard in a variable and use it — an
 * aliased condition, which narrows as long as nothing reassigns it.
 */
export function totalKnown(values: readonly (number | null)[]): number {
  throw new Error('totalKnown: not implemented');
}

/**
 * The value of the first key in `keys` that is present in `record` with a
 * defined value, or `undefined` if none is.
 */
export function firstPresent(
  record: Record<string, string | undefined>,
  keys: readonly string[],
): string | undefined {
  throw new Error('firstPresent: not implemented');
}
