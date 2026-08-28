/**
 * Part 08, Lesson 01 — Variance
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`, no `as`.
 */

/** Produces a `T` and never consumes one. Annotate its variance explicitly. */
export interface Producer<T> {
  // TODO: get(): T — and mark T's variance on the parameter
  get(): unknown;
}

/**
 * Consumes a `T` and never produces one. The consuming member must be a
 * PROPERTY, not a method, so that it is checked contravariantly.
 */
export interface Consumer<T> {
  // TODO: set as a property, and mark T's variance
  set: unknown;
}

/** Both reads and writes, so neither direction is safe. */
export interface Invariant<T> {
  // TODO: value: T, marked
}

/** The same consuming operation as a METHOD — bivariant, and unsound. */
export interface WithMethod<T> {
  // TODO: handle(value: T): void
}

/** ...and as a PROPERTY — contravariant, and checked. */
export interface WithProperty<T> {
  // TODO: handle: (value: T) => void
}

/** The four possibilities. */
export type Variance = 'covariant' | 'contravariant' | 'invariant' | 'bivariant';

/**
 * Where a type parameter appears inside a type.
 *
 *   output    a return type, or a readonly property
 *   input     a function parameter, declared as a property
 *   method    a function parameter, declared as a method
 */
export type Position = 'output' | 'input' | 'method';

/**
 * Work out a parameter's variance from every position it appears in.
 *
 *   []                     -> 'covariant'   (a parameter used nowhere is safe
 *                                            to widen, so this is the identity)
 *   ['output']             -> 'covariant'
 *   ['input']              -> 'contravariant'
 *   ['method']             -> 'bivariant'
 *   ['output', 'input']    -> 'invariant'
 *   ['output', 'method']   -> 'covariant'   (a method constrains nothing)
 *   ['input', 'method']    -> 'contravariant'
 */
export function varianceOf(positions: readonly Position[]): Variance {
  throw new Error('varianceOf: not implemented');
}

/**
 * Map the INPUT of a consumer. Note the direction: to turn a `Consumer<B>` into
 * a `Consumer<A>` you supply a function from A to B, not B to A.
 *
 *   const printNumber: Consumer<number> = ...
 *   const printLength = contramap(printNumber, (s: string) => s.length);
 *   printLength.set('hello');   // prints 5
 */
export function contramap<A, B>(consumer: Consumer<B>, fn: (value: A) => B): Consumer<A> {
  throw new Error('contramap: not implemented');
}

/**
 * The covariant twin, for contrast: map the OUTPUT of a producer, with the
 * function pointing the way you would expect.
 */
export function mapProducer<A, B>(producer: Producer<A>, fn: (value: A) => B): Producer<B> {
  throw new Error('mapProducer: not implemented');
}
