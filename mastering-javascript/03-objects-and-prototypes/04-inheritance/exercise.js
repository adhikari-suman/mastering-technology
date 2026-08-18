/**
 * Part 03, Lesson 04 — Inheritance
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 */

/**
 * Base class.
 *   new Animal('Rex').name    -> 'Rex'
 *   new Animal('Rex').speak() -> 'Rex makes a sound'
 */
// TODO: export class Animal { ... }

/**
 * Extends Animal.
 *   const d = new Dog('Rex', 'lab');
 *   d.name   -> 'Rex'    (set by super)
 *   d.breed  -> 'lab'
 *   d.speak() -> 'Rex makes a sound, specifically a bark'
 *
 * speak() must call super.speak() rather than rebuilding the string.
 */
// TODO: export class Dog extends Animal { ... }

/**
 * The pre-class inheritance pattern, applied to two constructor functions.
 * After calling it:
 *   - Child.prototype inherits from Parent.prototype
 *   - Child.prototype.constructor is Child again, not Parent
 *
 * Calling Parent's constructor is the caller's job, not yours.
 */
export function legacyInherit(Child, Parent) {
  // TODO
  throw new Error('legacyInherit: not implemented');
}

/**
 * Copy every own enumerable property of each source onto `target`, and return
 * target. Used to mix behaviour into a prototype.
 *
 * mixin(Bird.prototype, canFly, canSwim)
 */
export function mixin(target, ...sources) {
  // TODO
  throw new Error('mixin: not implemented');
}

/**
 * A Bird that extends Animal AND mixes in a `fly()` method returning
 * `<name> flies`.
 *
 *   const b = new Bird('Tweety');
 *   b.speak() -> 'Tweety makes a sound'   (inherited, not overridden)
 *   b.fly()   -> 'Tweety flies'           (mixed in)
 */
// TODO: export class Bird extends Animal { }  + a mixin applied to its prototype

/**
 * The chain of classes above `Cls`, not including Cls itself, stopping before
 * the Function.prototype end of the line.
 *
 * ancestryOf(Dog)    -> [Animal]
 * ancestryOf(Animal) -> []
 */
export function ancestryOf(Cls) {
  // TODO: Object.getPrototypeOf on the CLASS walks the static chain
  throw new Error('ancestryOf: not implemented');
}

/**
 * True if `Cls` defines `name` on its own prototype AND something above it
 * also defines `name` — i.e. it genuinely overrides.
 *
 * overrides(Dog, 'speak')  -> true
 * overrides(Bird, 'speak') -> false   (inherited, never redefined)
 * overrides(Dog, 'nope')   -> false
 */
export function overrides(Cls, name) {
  // TODO
  throw new Error('overrides: not implemented');
}
