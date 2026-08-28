/**
 * Part 03, Lesson 04 — Inference sites
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `as` in a SIGNATURE, and no `any` anywhere. Inside a body, two
 * situations resist it honestly — seeding a `Record` accumulator, and reading
 * past `noUncheckedIndexedAccess`. Use `as` there if you must, note where, and
 * Part 08 Lesson 04 will ask whether you still would.
 */

/** A tiny state container. */
export type Store<T> = {
  get(): T;
  set(next: T): void;
};

/**
 * Build a store, inferring the state type from the initial value.
 *
 *   createStore(0)     -> Store<number>
 *   createStore('a')   -> Store<string>   (widened, as an unconstrained T is)
 */
export function createStore<T>(initial: T): Store<T> {
  throw new Error('createStore: not implemented');
}

/**
 * `value` when defined, `fallback` otherwise.
 *
 * The fallback must be CHECKED against T rather than contribute to deciding it:
 *
 *   withFallback(aString, 42)   must be an error
 *
 * As written it isn't, because `fallback` offers its own candidate. One utility
 * type on one parameter fixes that.
 */
export function withFallback<T>(value: T | undefined, fallback: T): T {
  // TODO: stop `fallback` from being an inference site
  throw new Error('withFallback: not implemented');
}

/**
 * `Object.fromEntries`, typed.
 *
 *   fromEntries([['a', 1], ['b', 2]])  ->  Record<'a' | 'b', number>
 *
 * Later entries win over earlier ones with the same key.
 */
export function fromEntries<K extends PropertyKey, V>(
  entries: readonly (readonly [K, V])[],
): unknown {
  // TODO: the return annotation is wrong
  throw new Error('fromEntries: not implemented');
}

/**
 * Fold a list. The accumulator type comes from `initial`, so a callback that
 * returns something else is an error at the callback rather than a surprise
 * at the call site.
 */
export function reduce<T, A>(
  items: readonly T[],
  fn: (acc: A, item: T, index: number) => A,
  initial: A,
): A {
  throw new Error('reduce: not implemented');
}

/**
 * The first item passing `predicate`, or `undefined`.
 *
 * Callers must not have to annotate the predicate's parameter — that is
 * contextual typing doing its job, and it only works if `T` is decided by the
 * array rather than by the callback.
 */
export function firstMatching<T>(
  items: readonly T[],
  predicate: (item: T, index: number) => boolean,
): T | undefined {
  throw new Error('firstMatching: not implemented');
}
