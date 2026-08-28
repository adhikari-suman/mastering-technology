/**
 * Part 04, Lesson 04 — Mapped types
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`, and none of these may use the built-in Partial, Required,
 * Readonly, Pick, Record or Omit. Rebuilding them is the exercise.
 */

/** Every property optional. Must stay homomorphic — an array in, an array out. */
export type MyPartial<T> = unknown; // TODO

/** Every property required, with `undefined` stripped from its type. */
export type MyRequired<T> = unknown; // TODO

/** Every property read-only. */
export type MyReadonly<T> = unknown; // TODO

/** Every property writable — `readonly` removed. */
export type Mutable<T> = unknown; // TODO

/**
 * Only the named keys.
 *
 *   MyPick<{ a: 1; b: 2 }, 'a'>  ->  { a: 1 }
 *
 * Constrain K to the keys that exist.
 */
export type MyPick<T, K> = unknown; // TODO

/**
 * A record from a key set to one value type.
 *
 *   MyRecord<'a' | 'b', number>  ->  { a: number; b: number }
 *
 * Constrain K to things that can index an object.
 */
export type MyRecord<K, V> = unknown; // TODO

/**
 * A getter per property, renamed.
 *
 *   Getters<{ name: string; age: number }>
 *     ->  { getName: () => string; getAge: () => number }
 *
 * Needs key remapping with `as`, and `Capitalize`. Keys can be symbols, so
 * intersect with `string` before capitalising.
 */
export type Getters<T> = unknown; // TODO

/**
 * Keep only the properties assignable to `V`; drop the rest.
 *
 *   PickByType<{ a: string; b: number; c: string }, string>  ->  { a: string; c: string }
 *
 * Remap the unwanted keys to `never`.
 */
export type PickByType<T, V> = unknown; // TODO

/**
 * The runtime twin of key remapping: a new object with every key transformed
 * and every value carried over unchanged.
 *
 *   mapKeys({ a: 1 }, k => k.toUpperCase())  ->  { A: 1 }
 *
 * Later keys win if two map to the same name. Non-mutating.
 */
export function mapKeys<V>(
  obj: Record<string, V>,
  fn: (key: string) => string,
): Record<string, V> {
  throw new Error('mapKeys: not implemented');
}
