/**
 * Part 06, Lesson 01 — tsconfig
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`. `STRICT_FLAGS` and `EXTRA_STRICT_FLAGS` must keep their
 * literal types — the other types here are derived from them.
 */

/**
 * The eight flags `strict: true` turns on, in this order:
 *
 *   noImplicitAny, strictNullChecks, strictFunctionTypes, strictBindCallApply,
 *   strictPropertyInitialization, noImplicitThis, useUnknownInCatchVariables,
 *   alwaysStrict
 */
export const STRICT_FLAGS = []; // TODO

/**
 * The flags `strict` leaves off, in this order:
 *
 *   noUncheckedIndexedAccess, exactOptionalPropertyTypes, noImplicitOverride,
 *   noImplicitReturns, noFallthroughCasesInSwitch,
 *   noPropertyAccessFromIndexSignature
 */
export const EXTRA_STRICT_FLAGS = []; // TODO

/** One of the eight. */
export type StrictFlag = unknown; // TODO — derive it

/** One of the extras. */
export type ExtraFlag = unknown; // TODO — derive it

/** Any flag this Lesson knows about. */
export type Flag = unknown; // TODO

/**
 * A tsconfig's compilerOptions, as far as this Lesson cares: an optional
 * `strict`, plus an optional boolean for every `Flag`.
 */
export type Config = unknown; // TODO

/** Every flag, resolved to on or off. */
export type ResolvedFlags = unknown; // TODO — a Record from Flag to boolean

/**
 * Work out what is actually on.
 *
 *   - every flag starts off
 *   - `strict: true` turns on all eight of STRICT_FLAGS
 *   - an explicit flag always wins, in either direction
 *
 * So `{ strict: true, strictNullChecks: false }` has seven of the eight on.
 */
export function resolveFlags(config: Config): ResolvedFlags {
  throw new Error('resolveFlags: not implemented');
}

/**
 * True when `a` has every flag `b` has, and at least one more. Equal configs
 * are NOT stricter than each other.
 */
export function isStricterThan(a: Config, b: Config): boolean {
  throw new Error('isStricterThan: not implemented');
}

/**
 * A one-line summary: the count of enabled flags, then the disabled ones.
 *
 *   describeConfig({ strict: true })
 *     -> '8 of 14 flags enabled; off: noUncheckedIndexedAccess, ' +
 *        'exactOptionalPropertyTypes, noImplicitOverride, noImplicitReturns, ' +
 *        'noFallthroughCasesInSwitch, noPropertyAccessFromIndexSignature'
 *
 * Disabled flags are listed in the order STRICT_FLAGS then EXTRA_STRICT_FLAGS.
 * The `; off:` clause is present whenever anything is off — including when
 * everything is — and absent only when every flag is on.
 */
export function describeConfig(config: Config): string {
  throw new Error('describeConfig: not implemented');
}
