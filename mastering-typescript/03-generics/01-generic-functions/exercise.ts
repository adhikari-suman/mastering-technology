/**
 * Part 03, Lesson 01 — Generic functions
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `as` in a SIGNATURE, and no `any` anywhere. Inside a body, two
 * situations resist it honestly — seeding a `Record` accumulator, and reading
 * past `noUncheckedIndexedAccess`. Use `as` there if you must, note where, and
 * Part 08 Lesson 04 will ask whether you still would.
 *
 * Several stubs have deliberately weak signatures: the annotations are as much
 * of the exercise as the bodies.
 */

/** Whatever goes in comes out, with its type intact. */
export function identity<T>(value: T): T {
  throw new Error('identity: not implemented');
}

/** Two values in, a tuple out, in that order. */
export function pair<A, B>(a: A, b: B): unknown {
  // TODO: the return annotation is wrong
  throw new Error('pair: not implemented');
}

/** A pair, reversed — in the value and in the type. */
export function swap<A, B>(p: [A, B]): unknown {
  // TODO: the return annotation is wrong
  throw new Error('swap: not implemented');
}

/**
 * Read one property. The key must be one this object actually has, and the
 * result must be that property's type — not a union of all of them.
 *
 * Both of those come from the same constraint, which is missing.
 */
export function pluck<T, K>(obj: T, key: K): unknown {
  // TODO: constrain K, and fix the return annotation
  throw new Error('pluck: not implemented');
}

/**
 * Read several properties into a new object.
 *
 *   pickMany({ a: 1, b: 'x', c: true }, ['a', 'b'])  ->  { a: 1, b: 'x' }
 *
 * The result type must mention only the keys that were asked for.
 */
export function pickMany<T, K>(obj: T, keys: readonly K[]): unknown {
  // TODO
  throw new Error('pickMany: not implemented');
}

/**
 * Transform every value, keeping every key.
 *
 *   mapValues({ a: 1, b: 2 }, n => String(n))  ->  { a: '1', b: '2' }
 */
export function mapValues<K extends string, A, B>(
  obj: Record<K, A>,
  fn: (value: A, key: K) => B,
): unknown {
  // TODO: the return annotation is wrong
  throw new Error('mapValues: not implemented');
}

/**
 * Run a side effect on a value and return the value itself, untouched and with
 * its type undisturbed. The thing that makes this useful in a pipeline is
 * exactly the thing a non-generic signature would destroy.
 */
export function tap<T>(value: T, fn: (value: T) => void): T {
  throw new Error('tap: not implemented');
}
