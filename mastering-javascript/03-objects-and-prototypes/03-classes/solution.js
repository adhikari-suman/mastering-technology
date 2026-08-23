/**
 * The class version of lesson 02's Dog.
 *   new Dog('Rex').name    -> 'Rex'
 *   new Dog('Rex').speak() -> 'Rex barks'
 * speak must still be shared between instances.
 */
export class Dog {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} barks`;
  }
}

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
export class Vault {
  #balance = 0;

  constructor(balance) {
    this.#balance = balance;
  }

  getBalance() {
    return this.#balance;
  }

  deposit(amt) {
    this.#balance += amt;
    return this.#balance;
  }

  withdraw(amt) {
    if (amt > this.#balance) return null;

    this.#balance -= amt;
    return this.getBalance();
  }
}

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
export class Temperature {
  constructor(tempInCelsius) {
    this.tempInCelsius = tempInCelsius;
  }

  get celsius() {
    return this.tempInCelsius;
  }

  set celsius(newVal) {
    this.tempInCelsius = newVal;
  }

  get fahrenheit() {
    return (this.tempInCelsius * 9) / 5 + 32;
  }

  set fahrenheit(newVal) {
    this.tempInCelsius = ((newVal - 32) * 5) / 9;
  }
}

/**
 * Counts how many instances have been created, in static state.
 *
 *   Registry.count   -> 0
 *   new Registry(); new Registry();
 *   Registry.count   -> 2
 *   Registry.reset(); Registry.count -> 0
 */
export class Registry {
  static count = 0;

  constructor() {
    Registry.count++;
  }

  static reset() {
    Registry.count = 0;
  }
}

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
export class Bound {
  constructor() {
    this.count = 0;
  }

  increment = () => {
    return ++this.count;
  };
}

/**
 * Is `name` an ENUMERABLE property of Cls.prototype?
 * Class methods are non-enumerable, so this is false for them.
 *
 * methodIsEnumerable(Dog, 'speak') -> false
 */
export function methodIsEnumerable(Cls, name) {
  const desc = Object.getOwnPropertyDescriptor(Cls.prototype, name);

  return desc != null && desc.enumerable;
}
