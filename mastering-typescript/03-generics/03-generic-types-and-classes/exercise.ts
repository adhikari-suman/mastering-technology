/**
 * Part 03, Lesson 03 — Generic types and classes
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
 * Also: `erasableSyntaxOnly` is on, so there are no parameter properties here —
 * write the assignments out.
 */

/** A read-only container: a single `value` that cannot be written through. */
export type Box<T> = unknown; // TODO

/**
 * `push` declared as a METHOD. Method parameters are checked bivariantly, so
 * this interface is assignable in both directions across a subtype relation —
 * which is unsound, and deliberate.
 */
export interface Pushable<T> {
  // TODO: push(item: T): void — as a method
}

/**
 * The same operation declared as a PROPERTY holding a function. Under
 * `strictFunctionTypes` this one is checked contravariantly, and the unsound
 * assignment is rejected.
 */
export interface PushableProp<T> {
  // TODO: push: (item: T) => void — as a property
}

/** Rebuild a Box by running its value through `fn`. */
export function mapBox<A, B>(box: Box<A>, fn: (value: A) => B): Box<B> {
  throw new Error('mapBox: not implemented');
}

/**
 * A last-in, first-out stack.
 *
 *   push(item)   add to the top
 *   pop()        remove and return the top, or undefined when empty
 *   peek()       return the top without removing it, or undefined
 *   size         how many items (a getter, not a method)
 *   isEmpty()    size === 0
 *   toArray()    a COPY, bottom to top — mutating it must not affect the stack
 *
 * `push` must be a method, so that the variance test below sees a method.
 */
export class Stack<T> {
  // TODO
  push(item: T): void {
    throw new Error('Stack#push: not implemented');
  }

  pop(): T | undefined {
    throw new Error('Stack#pop: not implemented');
  }

  peek(): T | undefined {
    throw new Error('Stack#peek: not implemented');
  }

  get size(): number {
    throw new Error('Stack#size: not implemented');
  }

  isEmpty(): boolean {
    throw new Error('Stack#isEmpty: not implemented');
  }

  toArray(): T[] {
    throw new Error('Stack#toArray: not implemented');
  }
}
