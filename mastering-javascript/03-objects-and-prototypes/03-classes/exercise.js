/**
 * Part 03, Lesson 03 — Classes
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
 * The class version of lesson 02's Dog.
 *   new Dog('Rex').name    -> 'Rex'
 *   new Dog('Rex').speak() -> 'Rex barks'
 * speak must still be shared between instances.
 */
// TODO: export class Dog { ... }

/**
 * A vault with a genuinely private balance, using a #private field.
 *
 *   const v = new Vault(100);
 *   v.getBalance()   -> 100
 *   v.deposit(50)    -> 150
 *   v.withdraw(500)  -> null   (refused, balance unchanged)
 *
 * Object.keys(v) must be empty, and JSON.stringify(v) must be '{}' — a
 * #private field is invisible to both.
 */
// TODO: export class Vault { ... }

/**
 * Stores celsius, and exposes fahrenheit through a getter AND a setter.
 *
 *   const t = new Temperature(100);
 *   t.celsius      -> 100
 *   t.fahrenheit   -> 212
 *   t.fahrenheit = 32;
 *   t.celsius      -> 0
 *
 * f = c * 9/5 + 32
 */
// TODO: export class Temperature { ... }

/**
 * Counts how many instances have been created, in static state.
 *
 *   Registry.count   -> 0
 *   new Registry(); new Registry();
 *   Registry.count   -> 2
 *   Registry.reset(); Registry.count -> 0
 */
// TODO: export class Registry { ... }

/**
 * Has an `increment()` that still works after being pulled off the instance:
 *
 *   const b = new Bound();
 *   const fn = b.increment;
 *   fn(); fn();
 *   b.count -> 2
 *
 * Use an arrow-valued class field.
 */
// TODO: export class Bound { ... }

/**
 * Is `name` an ENUMERABLE property of Cls.prototype?
 * Class methods are non-enumerable, so this is false for them.
 *
 * methodIsEnumerable(Dog, 'speak') -> false
 */
export function methodIsEnumerable(Cls, name) {
  // TODO: Object.getOwnPropertyDescriptor
  throw new Error('methodIsEnumerable: not implemented');
}
