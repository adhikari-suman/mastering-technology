/**
 * Base class.
 *   new Animal('Rex').name    -> 'Rex'
 *   new Animal('Rex').speak() -> 'Rex makes a sound'
 */
export class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} makes a sound`;
  }
}

/**
 * Extends Animal.
 *   const d = new Dog('Rex', 'lab');
 *   d.name   -> 'Rex'    (set by super)
 *   d.breed  -> 'lab'
 *   d.speak() -> 'Rex makes a sound, specifically a bark'
 *
 * speak() must call super.speak() rather than rebuilding the string.
 */
export class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }

  speak() {
    return `${super.speak()}, specifically a bark`;
  }
}

/**
 * The pre-class inheritance pattern, applied to two constructor functions.
 * After calling it:
 *   - Child.prototype inherits from Parent.prototype
 *   - Child.prototype.constructor is Child again, not Parent
 *
 * Calling Parent's constructor is the caller's job, not yours.
 */
export function legacyInherit(Child, Parent) {
  Child.prototype = Object.create(Parent.prototype); // extends
  Object.defineProperty(Child.prototype, "constructor", {
    value: Child,
    writable: true,
    configurable: true,
  });
}

/**
 * Copy every own enumerable property of each source onto `target`, and return
 * target. Used to mix behaviour into a prototype.
 *
 * mixin(Bird.prototype, canFly, canSwim)
 */
export function mixin(target, ...sources) {
  Object.assign(target, ...sources);

  return target;
}

/**
 * A Bird that extends Animal AND mixes in a `fly()` method returning
 * `<name> flies`.
 *
 *   const b = new Bird('Tweety');
 *   b.speak() -> 'Tweety makes a sound'   (inherited, not overridden)
 *   b.fly()   -> 'Tweety flies'           (mixed in)
 */
export class Bird extends Animal {
  constructor(name) {
    super(name);
  }
}

const canFly = {
  fly() {
    return `${this.name} flies`;
  },
};

Object.assign(Bird.prototype, canFly);

/**
 * The chain of classes above `Cls`, not including Cls itself, stopping before
 * the Function.prototype end of the line.
 *
 * ancestryOf(Dog)    -> [Animal]
 * ancestryOf(Animal) -> []
 */
export function ancestryOf(Cls) {
  let result = [];
  let curr = Object.getPrototypeOf(Cls);

  while (curr != null && curr !== Function.prototype) {
    result.push(curr);

    curr = Object.getPrototypeOf(curr);
  }

  return result;
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
  if (Cls == null) return false;

  if (!Object.hasOwn(Cls.prototype, name)) {
    return false;
  }

  let curr = Object.getPrototypeOf(Cls);

  while (curr != null && curr !== Function.prototype) {
    if (Object.hasOwn(curr.prototype, name)) {
      return true;
    }

    curr = Object.getPrototypeOf(curr);
  }

  return false;
}
