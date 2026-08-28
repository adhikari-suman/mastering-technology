/**
 * Part 07, Lesson 02 — Parse, don't validate
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`. `as` is permitted only where a mapped type cannot be built
 * without it — note each one; there should be very few.
 *
 * NOTE ON THE STUBS: the combinators below RETURN a throwing parser rather than
 * throwing themselves. Schemas get built at module scope, so a factory that
 * threw would stop the test file loading at all, and you would see one error
 * instead of a list of failures.
 */

/** Thrown when parsing fails. `path` says where. */
export class ParseError extends Error {
  override readonly name = 'ParseError';
  readonly path: string;

  constructor(path: string, message: string) {
    super(path === '' ? message : `${path}: ${message}`);
    this.path = path;
  }
}

/**
 * A parser: takes an unknown and a path, returns a `T`, or throws a ParseError.
 *
 * The `path` is how a nested failure names itself. The root passes ''.
 */
export type Parser<T> = unknown; // TODO

/** What a parser produces. */
export type Infer<P> = unknown; // TODO

/**
 * The leaves. Each throws `expected <kind>` at the given path.
 *
 *   string(1, 'a.b')  ->  throws ParseError with message 'a.b: expected string'
 */
export const string: Parser<string> = () => {
  throw new Error('string: not implemented');
};

export const number: Parser<number> = () => {
  throw new Error('number: not implemented');
};

export const boolean: Parser<boolean> = () => {
  throw new Error('boolean: not implemented');
};

/**
 * Marks a parser optional. `optional(string)` accepts `undefined` and produces
 * `T | undefined`; `object` uses the marker to make the KEY optional too.
 *
 * The marker has to be visible at the type level, so give the returned parser a
 * distinguishing property rather than relying on a runtime flag alone.
 */
export type OptionalParser<T> = unknown; // TODO

export function optional<T>(inner: Parser<T>): OptionalParser<T> {
  // TODO: replace this with the real thing
  return (() => {
    throw new Error('optional: not implemented');
  }) as OptionalParser<T>;
}

/**
 * An array of `inner`. Each element's path is `${path}.${index}`.
 * A non-array throws `expected array`.
 */
export function array<T>(inner: Parser<T>): Parser<T[]> {
  // TODO
  return () => {
    throw new Error('array: not implemented');
  };
}

/** Any schema: a record of parsers. */
export type Shape = Record<string, Parser<unknown> | OptionalParser<unknown>>;

/**
 * Flatten an intersection of object types into one object type, keeping every
 * modifier. A homomorphic mapped type does it, and it is the difference between
 * a tooltip you can read and one you can't.
 *
 *   Simplify<{ a: string } & { b?: number }>  ->  { a: string; b?: number }
 */
export type Simplify<T> = unknown; // TODO

/**
 * What an object schema produces: every key mapped to what its parser makes,
 * with the keys whose parser was `optional` made optional — and the whole thing
 * flattened, so it is one object type rather than an intersection.
 *
 *   ObjectOf<{ a: Parser<string>; b: OptionalParser<number> }>
 *     ->  { a: string; b?: number }
 *
 * Build it as a required half intersected with an optional half, then Simplify.
 * Note that the optional half must Exclude `undefined` from its value type, or
 * `exactOptionalPropertyTypes` will not let the key be genuinely absent.
 */
export type ObjectOf<S extends Shape> = unknown; // TODO

/**
 * An object matching `shape`. Each property's path is `${path}.${key}` at
 * depth, or just `key` at the root. Unknown properties are dropped.
 * A non-object (including an array or null) throws `expected object`.
 */
export function object<S extends Shape>(shape: S): Parser<ObjectOf<S>> {
  // TODO
  return () => {
    throw new Error('object: not implemented');
  };
}

/** Run a parser at the root. */
export function parse<T>(parser: Parser<T>, value: unknown): T {
  throw new Error('parse: not implemented');
}
