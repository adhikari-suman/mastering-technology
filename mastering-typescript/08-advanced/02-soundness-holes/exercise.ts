/**
 * Part 08, Lesson 02 — Soundness holes
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`, and — for the two demonstrations especially — no `as` and no
 * `!`. The point is that these programs are unsound with NO unsafe feature
 * anywhere in them. Reaching for an assertion would prove nothing.
 */

/** The holes catalogued in the README. */
export type Hole =
  | 'array-covariance'
  | 'method-bivariance'
  | 'any'
  | 'type-assertion'
  | 'type-predicate'
  | 'property-narrowing'
  | 'unchecked-index'
  | 'field-initialisation-order'
  | 'ambient-declaration';

/** All of them, in the order above. */
export const HOLES = []; // TODO

/**
 * One line about each, exactly:
 *
 *   array-covariance            'Dog[] is an Animal[], so a Cat can be pushed in'
 *   method-bivariance           'method parameters are checked in both directions'
 *   any                         'assignable both ways, and it spreads'
 *   type-assertion              'as and ! are unchecked by construction'
 *   type-predicate              'the body is not checked against the claim'
 *   property-narrowing          'a narrowing survives a call that could undo it'
 *   unchecked-index             'xs[i] is T unless noUncheckedIndexedAccess is on'
 *   field-initialisation-order  'a base constructor can read an uninitialised subclass field'
 *   ambient-declaration         'a .d.ts is a promise nothing verifies'
 *
 * An unknown hole throws a TypeError.
 */
export function describeHole(hole: Hole): string {
  throw new Error('describeHole: not implemented');
}

/** The things that can close a hole. */
export type Remedy =
  | 'noUncheckedIndexedAccess'
  | 'readonly-parameters'
  | 'callbacks-as-properties'
  | 'no-overridable-calls-in-constructors'
  | 'discipline';

/**
 * Which remedy closes which hole:
 *
 *   array-covariance            readonly-parameters
 *   method-bivariance           callbacks-as-properties
 *   unchecked-index             noUncheckedIndexedAccess
 *   field-initialisation-order  no-overridable-calls-in-constructors
 *   everything else             discipline
 */
export function isClosedBy(hole: Hole): Remedy {
  throw new Error('isClosedBy: not implemented');
}

export type Animal = { legs: number };
export type Dog = Animal & { bark(): string };
export type Cat = Animal & { meow(): string };

/**
 * Put a Cat into an array typed `Dog[]`, using nothing but assignment.
 *
 * Build a `Dog[]`, widen it to `Animal[]` (which TypeScript allows), push a Cat
 * through the wider view, and return the ORIGINAL array — which now contains
 * something that is not a Dog, while still being typed `Dog[]`.
 */
export function demonstrateArrayCovariance(): Dog[] {
  throw new Error('demonstrateArrayCovariance: not implemented');
}

/**
 * Read a field typed `string` while it holds `undefined`.
 *
 * Build a base class whose constructor calls an overridable method, and a
 * subclass that overrides it and reads one of its OWN fields. Base constructors
 * finish before subclass field initialisers run, so the field is not there yet.
 *
 * Return what the method saw the first time: the value of that field during
 * construction. Its declared type is `string`; the value will not be one.
 */
export function demonstrateFieldOrder(): string {
  throw new Error('demonstrateFieldOrder: not implemented');
}

/**
 * The remedy for hole 1, as a signature: a `readonly` parameter cannot be
 * written through, so a caller's array is safe from this function.
 */
export function safeSum(values: readonly number[]): number {
  throw new Error('safeSum: not implemented');
}
