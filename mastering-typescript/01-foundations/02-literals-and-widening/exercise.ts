/**
 * Part 01, Lesson 02 — Literals and widening
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * Type stubs are `unknown` and function stubs `throw`, so this compiles as it
 * stands. Every stub is independent.
 */

/**
 * The three roles. As written, this infers `string[]` — the literals are lost.
 * Keep them.
 */
export const ROLES = ['admin', 'editor', 'viewer']; // TODO

/** The union of the three roles, DERIVED from `ROLES`. Don't retype them. */
export type Role = unknown; // TODO

/** What a role may do. This one is written out by hand. */
export type Permission = unknown; // TODO: 'read' | 'write' | 'delete'

/**
 * Which permissions each role has. Two requirements that pull against each
 * other, and one keyword that satisfies both:
 *
 *   - checked — every `Role` must appear, and only `Permission`s may be listed
 *   - exact   — `PERMISSIONS.viewer` must stay `readonly ['read']`, not string[]
 *
 * An annotation gives you the first and destroys the second.
 */
export const PERMISSIONS = {
  admin: ['read', 'write', 'delete'],
  editor: ['read', 'write'],
  viewer: ['read'],
}; // TODO

/** The fallback role. Typed as `Role` — not as the one literal it happens to be. */
export const DEFAULT_ROLE = 'viewer'; // TODO

/**
 * Return the argument unchanged, keeping its literal type instead of widening.
 *
 *   identity('a')        -> 'a'                 (not string)
 *   identity(['a', 'b']) -> readonly ['a', 'b'] (not string[])
 *
 * One modifier on the type parameter does both.
 */
export function identity<T>(value: T): T {
  throw new Error('identity: not implemented');
}

/** Whether `role` holds `permission`. */
export function can(role: Role, permission: Permission): boolean {
  throw new Error('can: not implemented');
}

/** Whether an arbitrary string is one of the roles. Check against `ROLES`. */
export function isRole(value: string): boolean {
  throw new Error('isRole: not implemented');
}

/* -------------------------------------------------------------------------
 * Given, for contrast. These two differ only in the keyword, and the tests
 * assert that they end up as different types. Predict both before you run.
 * ---------------------------------------------------------------------- */

export let widened = 'admin';
export const narrow = 'admin';
