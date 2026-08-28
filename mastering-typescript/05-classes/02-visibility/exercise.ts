/**
 * Part 05, Lesson 02 — Visibility
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`, no parameter properties.
 */

/**
 * An account whose balance is genuinely private — invisible to `Object.keys`,
 * to `JSON.stringify`, and to any cast. Use JavaScript's `#` fields.
 *
 *   new Account(100)
 *   .deposit(n)     adds; a non-positive amount throws RangeError
 *   .withdraw(n)    subtracts; more than the balance throws RangeError
 *   .balance        a getter
 *   .toJSON()       returns { type: 'account' } — never the balance
 */
export class Account {
  // TODO
  constructor(initial: number) {
    throw new Error('Account: not implemented');
  }

  get balance(): number {
    throw new Error('Account#balance: not implemented');
  }

  deposit(amount: number): void {
    throw new Error('Account#deposit: not implemented');
  }

  withdraw(amount: number): void {
    throw new Error('Account#withdraw: not implemented');
  }

  toJSON(): { type: string } {
    throw new Error('Account#toJSON: not implemented');
  }
}

/**
 * The same thing built with TypeScript's `private` instead, so the tests can
 * demonstrate that it is a convention rather than a wall. Give it a `private
 * balanceValue` field and a `balance` getter. No toJSON.
 */
export class LeakyAccount {
  // TODO
  constructor(initial: number) {
    throw new Error('LeakyAccount: not implemented');
  }

  get balance(): number {
    throw new Error('LeakyAccount#balance: not implemented');
  }
}

/**
 * A brand check. `value` is an Account exactly when it carries Account's
 * private field — which is a question only code inside the class may ask.
 *
 * This must be a static method or a function declared inside the class body,
 * because `#field in value` is only legal there. Export it as a standalone
 * function that delegates to whatever you build.
 */
export function isAccount(value: unknown): value is Account {
  throw new Error('isAccount: not implemented');
}

/**
 * `protected` — visible to subclasses, invisible outside.
 *
 * Vehicle:  a protected `wheels` field, set from the constructor, and a public
 *           `describe()` returning `${this.constructor.name} with N wheels`.
 * Car:      extends Vehicle with 4 wheels, and a public `wheelCount()` that
 *           reads the protected field to prove a subclass can.
 */
export class Vehicle {
  // TODO
  constructor(wheels: number) {
    throw new Error('Vehicle: not implemented');
  }

  describe(): string {
    throw new Error('Vehicle#describe: not implemented');
  }
}

export class Car extends Vehicle {
  constructor() {
    super(4);
  }

  wheelCount(): number {
    throw new Error('Car#wheelCount: not implemented');
  }
}
