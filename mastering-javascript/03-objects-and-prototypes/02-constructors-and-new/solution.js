/**
 * Part 03, Lesson 02 — Constructors and `new`
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
 * A constructor function (not a class).
 *   new Dog('Rex').name    -> 'Rex'
 *   new Dog('Rex').speak() -> 'Rex barks'
 *
 * `speak` must live on Dog.prototype so every instance shares ONE function.
 */
export function Dog(name) {
  this.name = name;
}

Dog.prototype.speak = function () {
  return `${this.name} barks`;
};

/**
 * Implement `new` by hand. Do not use the `new` keyword.
 *
 * Create an object whose prototype is Fn.prototype, call Fn with that object
 * as `this` and the given args, and return the object — unless Fn returned an
 * object itself, in which case return that.
 *
 * construct(Dog, 'Rex').speak() -> 'Rex barks'
 */
export function construct(Fn, ...args) {
  const obj = Object.create(Fn.prototype);
  const result = Fn.apply(obj, args);
  return isObject(result) ? result : obj;
}

function isObject(v) {
  return v !== null && (typeof v === "object" || typeof v === "function");
}

/**
 * Implement `instanceof` by hand. Do not use the `instanceof` operator.
 * Walk obj's prototype chain looking for Fn.prototype.
 *
 * isInstanceOf(new Dog('a'), Dog)    -> true
 * isInstanceOf(new Dog('a'), Object) -> true
 * isInstanceOf({}, Dog)              -> false
 */
export function isInstanceOf(obj, Fn) {
  if (obj == null) {
    return false;
  }

  return (
    Object.getPrototypeOf(obj) === Fn.prototype ||
    isInstanceOf(Object.getPrototypeOf(obj), Fn)
  );
}

/**
 * True if `a` and `b` reach the SAME function object for `name` — i.e. the
 * method lives on a shared prototype rather than being copied per instance.
 *
 * sharesMethod(new Dog('a'), new Dog('b'), 'speak') -> true
 */
export function sharesMethod(a, b, name) {
  const fn = a[name];

  return typeof fn === "function" && fn === b[name];
}

/**
 * Return a constructor that IGNORES the object `new` builds and returns its
 * own object instead: { count: 0, increment() }.
 *
 * const C = makeCounterCtor();
 * const c = new C();
 * c.increment() -> 1
 *
 * This proves step 4 of what `new` does: an explicitly returned object wins.
 */
export function makeCounterCtor() {
  function C() {
    return {
      count: 0,
      increment: function () {
        this.count++;
        return this.count;
      },
    };
  }

  return C;
}

/**
 * The constructor an object claims, via its prototype chain.
 *
 * constructorOf(new Dog('a')) -> Dog
 * constructorOf({})           -> Object
 * constructorOf([])           -> Array
 */
export function constructorOf(obj) {
  if (obj == null) return null;

  return obj.constructor;
}
