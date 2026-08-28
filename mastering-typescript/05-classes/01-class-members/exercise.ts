/**
 * Part 05, Lesson 01 — Class members
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`, and no parameter properties — `erasableSyntaxOnly` rejects
 * them and Node cannot strip them. Write the field and the assignment out.
 */

/**
 * A counter that also tracks how many counters exist.
 *
 *   new Counter()        starts at 0
 *   new Counter(10)      starts at 10
 *   increment(by = 1)    adds, and returns the new value
 *   reset()              back to the starting value
 *   value                a getter
 *   Counter.created      how many have been constructed (a static)
 *   Counter.reset()      sets `created` back to 0 (a static method)
 *
 * `created` must start at 0 without an initialiser on the field — use a static
 * initialisation block.
 */
export class Counter {
  // TODO
  constructor(start = 0) {
    throw new Error('Counter: not implemented');
  }

  get value(): number {
    throw new Error('Counter#value: not implemented');
  }

  increment(by = 1): number {
    throw new Error('Counter#increment: not implemented');
  }

  reset(): void {
    throw new Error('Counter#reset: not implemented');
  }
}

/**
 * A config object exercising the three field forms:
 *
 *   host      readonly, required, set in the constructor
 *   port      readonly, with a default of 8080
 *   label     optional — genuinely may be absent
 *   loadedAt  a number that is NOT set in the constructor; `load()` sets it.
 *             The honest annotation admits it may not be there yet.
 *
 * `load()` records `Date.now()` into `loadedAt` and returns `this`.
 * `isLoaded()` says whether it has been.
 */
export class Config {
  // TODO
  constructor(host: string, port = 8080, label?: string) {
    throw new Error('Config: not implemented');
  }

  load(): this {
    throw new Error('Config#load: not implemented');
  }

  isLoaded(): boolean {
    throw new Error('Config#isLoaded: not implemented');
  }
}

/**
 * A temperature with a validating accessor.
 *
 *   new Temperature(20)     celsius = 20
 *   .celsius                get and set; setting below -273.15 throws RangeError
 *   .fahrenheit             a computed getter; setting it converts and validates
 *   .unit                   readonly, always 'C'
 */
export class Temperature {
  // TODO
  constructor(celsius: number) {
    throw new Error('Temperature: not implemented');
  }

  get celsius(): number {
    throw new Error('Temperature#celsius: not implemented');
  }

  set celsius(next: number) {
    throw new Error('Temperature#celsius=: not implemented');
  }

  get fahrenheit(): number {
    throw new Error('Temperature#fahrenheit: not implemented');
  }

  set fahrenheit(next: number) {
    throw new Error('Temperature#fahrenheit=: not implemented');
  }
}
