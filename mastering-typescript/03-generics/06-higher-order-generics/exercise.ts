/**
 * Part 03, Lesson 06 — Higher-order generics
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

/**
 * Call `fn` the first time and return its result. Every later call returns that
 * same result without calling `fn` again.
 *
 * The wrapper must have the SAME signature as what it wrapped — parameter
 * count, types and order all preserved.
 */
export function once<Args extends unknown[], R>(
  fn: (...args: Args) => R,
): (...args: Args) => R {
  throw new Error('once: not implemented');
}

/**
 * Cache results per argument list, keyed by `JSON.stringify(args)`. Same key,
 * same cached result; `fn` runs once per distinct key.
 */
export function memoize<Args extends unknown[], R>(
  fn: (...args: Args) => R,
): (...args: Args) => R {
  throw new Error('memoize: not implemented');
}

/**
 * Curry a two-argument function.
 *
 *   curry2((a: number, b: string) => a + b)(1)('x')  ->  '1x'
 */
export function curry2<A, B, R>(fn: (a: A, b: B) => R): unknown {
  // TODO: the return annotation is wrong
  throw new Error('curry2: not implemented');
}

/**
 * Bind leading arguments, leaving the rest.
 *
 *   const f = (a: number, b: string, c: boolean) => `${a}${b}${c}`;
 *   partial(f, 1)          ->  (b: string, c: boolean) => string
 *   partial(f, 1, 'x')     ->  (c: boolean) => string
 *
 * The split between bound and remaining is decided by how many arguments were
 * passed. Variadic tuple types express that; nothing else does.
 */
export function partial<Bound extends unknown[], Rest extends unknown[], R>(
  fn: (...args: [...Bound, ...Rest]) => R,
  ...bound: Bound
): (...rest: Rest) => R {
  throw new Error('partial: not implemented');
}

/**
 * Left-to-right composition, for two or three steps.
 *
 *   pipe(f, g)(x)     ===  g(f(x))
 *   pipe(f, g, h)(x)  ===  h(g(f(x)))
 *
 * One signature cannot express "each output feeds the next input" for a
 * variable number of steps, so write it as OVERLOADS: two declarations without
 * bodies, then one implementation signature that both are compatible with.
 */
export function pipe<A, B, C>(ab: (a: A) => B, bc: (b: B) => C): (a: A) => C;
// TODO: add the three-step overload here, then the implementation
export function pipe<A, B, C>(ab: (a: A) => B, bc: (b: B) => C): (a: A) => C {
  throw new Error('pipe: not implemented');
}
