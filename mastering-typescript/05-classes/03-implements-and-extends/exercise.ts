/**
 * Part 05, Lesson 03 — implements versus extends
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`, no parameter properties. `noImplicitOverride` is on, so every
 * override must say `override`.
 */

/** Anything that can describe itself. */
export interface Describable {
  describe(): string;
}

/**
 * The abstract base.
 *
 *   abstract area(): number      no body here
 *   abstract name: string        a readonly field every subclass must supply
 *   describe(): string           `${name} with area N`, rounded to 2 decimals
 *   scaleBy(factor)              abstract; returns a NEW Shape of the same kind
 *
 * `describe` calls `area` without knowing how it works — the reason this is a
 * class and not an interface. Declare that it implements `Describable`.
 */
export abstract class Shape {
  // TODO
}

/**
 * A square. `new Square(3)` has area 9 and name 'square'.
 * `scaleBy(2)` gives a Square of side 6.
 */
export class Square extends Shape {
  // TODO
  constructor(side: number) {
    super();
    throw new Error('Square: not implemented');
  }
}

/**
 * A circle. `new Circle(1)` has area pi and name 'circle'.
 * `scaleBy(2)` gives a Circle of radius 2.
 */
export class Circle extends Shape {
  // TODO
  constructor(radius: number) {
    super();
    throw new Error('Circle: not implemented');
  }
}

/** The combined area. An empty list is 0. */
export function totalArea(shapes: readonly Shape[]): number {
  throw new Error('totalArea: not implemented');
}

/**
 * A construct signature: something you can call `new` on to get a `T`, taking
 * exactly one number.
 */
export type ShapeConstructor<T extends Shape> = unknown; // TODO

/**
 * A registry of shape constructors.
 *
 *   register(name, ctor)   store it
 *   create(name, size)     construct one, or undefined if the name is unknown
 *   names()                the registered names, in insertion order
 *
 * `register` must reject anything that isn't constructible with a single
 * number — including the abstract `Shape` itself.
 */
export class Registry {
  // TODO
  register(name: string, ctor: ShapeConstructor<Shape>): void {
    throw new Error('Registry#register: not implemented');
  }

  create(name: string, size: number): Shape | undefined {
    throw new Error('Registry#create: not implemented');
  }

  names(): string[] {
    throw new Error('Registry#names: not implemented');
  }
}
