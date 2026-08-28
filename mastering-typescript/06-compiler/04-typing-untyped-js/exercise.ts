/**
 * Part 06, Lesson 04 — Typing untyped JavaScript
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`. The import below is typed `unknown` on purpose — narrowing it
 * is the exercise, and an `any` skips exactly the part worth doing.
 *
 * Do NOT edit the fixtures. The point is describing code you do not own.
 */
import legacyCache from './fixtures/legacy-cache.cjs';

/** What `stats()` returns. */
export type CacheStats = unknown; // TODO — hits, misses, size, max: all numbers

/**
 * The cache, honestly typed — and better than the library's own shape:
 *
 *   get(key)        V | undefined   (the library returns null; convert it)
 *   set(key, value) void            (the library returns true; drop it)
 *   del(key)        boolean         whether something was removed
 *   stats()         CacheStats
 */
export type Cache<V> = unknown; // TODO

/** Thrown when the library does not match what this facade claims about it. */
export class CacheError extends Error {
  override readonly name = 'CacheError';
}

/**
 * The facade.
 *
 * Build the underlying cache with `legacyCache.create({ max })`, check at
 * runtime that what came back really has the four methods — throwing a
 * CacheError naming the first missing one if not — and return an object
 * matching `Cache<V>`.
 *
 * Message format: `legacy-cache is missing ${name}`
 *
 * `max` defaults to 100, matching the library.
 */
export function createCache<V>(max = 100): Cache<V> {
  throw new Error('createCache: not implemented');
}
