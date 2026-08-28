/**
 * Part 05, Lesson 06 — Mixins
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no parameter properties, and DO NOT annotate a mixin's return type —
 * the inferred anonymous class is the thing that composes, and writing the type
 * by hand loses it.
 *
 * The no-`any` rule is suspended for `Ctor` alone, because the compiler refuses
 * anything else: "A mixin class must have a constructor with a single rest
 * parameter of type 'any[]'" (TS2545). Confine it to that one alias.
 */

/**
 * The constructor constraint: something `new`-able producing a `T`.
 *
 * The parameter list must be exactly `...args: any[]`. Try `never[]` and the
 * compiler tells you so by name. This is the only `any` allowed in the file.
 */
export type Ctor<T = object> = unknown; // TODO

/** The base everything is built on. Has a `name`, set from the constructor. */
export class Entity {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

/**
 * Adds:
 *   createdAt   a number, set to Date.now() when the instance is built
 *   age(now)    now - createdAt
 *
 * Return the class expression directly. No return annotation.
 */
export function Timestamped<T extends Ctor>(Base: T) {
  // TODO
  throw new Error('Timestamped: not implemented');
}

/**
 * Adds:
 *   toJSON()    a plain object of the instance's OWN enumerable properties
 */
export function Serialisable<T extends Ctor>(Base: T) {
  // TODO
  throw new Error('Serialisable: not implemented');
}

/**
 * Adds:
 *   static count       how many instances of THIS mixed class exist
 *   static resetCount()
 *
 * Each application of the mixin gets its own counter, because each produces a
 * distinct class. This one needs an explicit constructor, which must forward
 * `super(...args)` — so give the class expression a NAME and refer to that
 * inside, rather than trying to reach the anonymous class through `this`.
 */
export function Countable<T extends Ctor>(Base: T) {
  // TODO
  throw new Error('Countable: not implemented');
}

/**
 * All three, composed over Entity. Order: Countable outermost, then
 * Serialisable, then Timestamped closest to Entity.
 *
 * `User` forwards its `name` up through every layer to Entity. It adds an
 * `email` field set via `withEmail`, which returns `this` so it chains
 * (Lesson 04).
 */
export class User extends Entity {
  // TODO: extend the composed mixins instead of Entity directly
  email = '';

  constructor(name: string) {
    super(name);
  }

  withEmail(email: string): this {
    throw new Error('User#withEmail: not implemented');
  }
}
