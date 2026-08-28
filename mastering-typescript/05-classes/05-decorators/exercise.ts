/**
 * Part 05, Lesson 05 — Decorators
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`, and no `Function` as a type. Each decorator must preserve the
 * signature of what it decorates — that is the whole exercise.
 *
 * NOTE: no `@` syntax may appear in this file or in solution.ts. Node cannot
 * parse it on any released version, so a file containing one will not load.
 * `fixtures/decorated.ts` carries the syntax; tsc checks it, Node never sees it.
 */

/** Where `logged` records calls. Cleared by the tests between cases. */
export const CALLS: string[] = [];

/**
 * A method decorator that records every call as `${name}(${args.join(',')})`
 * into CALLS, then calls through and returns the result unchanged.
 *
 * The signature must preserve the receiver type, the argument tuple and the
 * return type. Three type parameters do that.
 */
export function logged(target: unknown, context: unknown): unknown {
  // TODO: type this properly, then implement
  throw new Error('logged: not implemented');
}

/**
 * A method decorator that binds the method to its instance, so extracting it
 * still works:
 *
 *   const f = obj.method;  f();   // `this` is still obj
 *
 * You cannot bind when the decorator runs — there is no instance yet. Register
 * the work with `context.addInitializer`, which runs per instance, and have it
 * define the bound function as an own property.
 *
 * Return the method unchanged; the initializer does the work.
 */
export function bound(target: unknown, context: unknown): unknown {
  // TODO
  throw new Error('bound: not implemented');
}

/**
 * A FIELD decorator factory. `clamped(min, max)` returns a decorator that
 * clamps the field's initial value into range.
 *
 *   @clamped(0, 10) volume = 99;   // becomes 10
 *
 * A field decorator receives `undefined` as its target and returns an
 * initialiser transformer — `(initial: number) => number` — not a value.
 */
export function clamped(min: number, max: number): unknown {
  // TODO
  throw new Error('clamped: not implemented');
}

/**
 * A class decorator that seals the constructor and its prototype, then returns
 * it unchanged. Must preserve the constructor's own type, so a decorated class
 * is still constructible with the same arguments.
 */
export function sealed(target: unknown, context: unknown): unknown {
  // TODO
  throw new Error('sealed: not implemented');
}
