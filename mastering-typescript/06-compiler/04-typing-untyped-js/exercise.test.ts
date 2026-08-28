import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { createCache, CacheError } from './solution.ts';
import type { Cache, CacheStats } from './solution.ts';
import type legacyCache from './fixtures/legacy-cache.cjs';

/* ------------------------------------------------------------------ types */

type _Stats = Expect<
  Equal<CacheStats, { hits: number; misses: number; size: number; max: number }>
>;
type _Cache = Expect<
  Equal<
    Cache<string>,
    {
      get(key: string): string | undefined;
      set(key: string, value: string): void;
      del(key: string): boolean;
      stats(): CacheStats;
    }
  >
>;

// The library's own declaration really is that useless — this is what you are
// starting from, and why the facade exists.
type _Library = Expect<Equal<typeof legacyCache.create, (options?: unknown) => unknown>>;

function _typeOnly(cache: Cache<number>) {
  const got = cache.get('a');
  type _Got = Expect<Equal<typeof got, number | undefined>>;

  // @ts-expect-error - the facade is typed in its value, unlike the library
  cache.set('a', 'not a number');

  // @ts-expect-error - set returns nothing useful, so it returns nothing
  const returned: boolean = cache.set('a', 1);
}

/* ---------------------------------------------------------------- runtime */

test('createCache: set and get', () => {
  const cache = createCache<string>();
  assert.equal(cache.get('a'), undefined, 'absent reads as undefined, not null');
  cache.set('a', 'one');
  assert.equal(cache.get('a'), 'one');
});

test('createCache: the library returns null; the facade must not', () => {
  const cache = createCache<string>();
  assert.equal(cache.get('missing'), undefined);
  assert.notEqual(cache.get('missing'), null);
});

test('createCache: del', () => {
  const cache = createCache<string>();
  cache.set('a', 'one');
  assert.equal(cache.del('a'), true);
  assert.equal(cache.del('a'), false, 'already gone');
  assert.equal(cache.get('a'), undefined);
});

test('createCache: stats', () => {
  const cache = createCache<string>(50);
  cache.set('a', 'one');
  cache.get('a');
  cache.get('b');
  const stats = cache.stats();
  assert.equal(stats.hits, 1);
  assert.equal(stats.misses, 1);
  assert.equal(stats.size, 1);
  assert.equal(stats.max, 50);
});

test('createCache: max defaults to the library default', () => {
  assert.equal(createCache<string>().stats().max, 100);
});

test('createCache: eviction is the library behaviour, unchanged', () => {
  const cache = createCache<number>(2);
  cache.set('a', 1);
  cache.set('b', 2);
  cache.set('c', 3);
  assert.equal(cache.stats().size, 2);
  assert.equal(cache.get('a'), undefined, 'the oldest went');
  assert.equal(cache.get('c'), 3);
});

test('createCache: storing a falsy value still reads back', () => {
  const cache = createCache<number>();
  cache.set('zero', 0);
  assert.equal(cache.get('zero'), 0);
  assert.equal(cache.stats().size, 1);
});

test('CacheError exists and is an Error', () => {
  const err = new CacheError('x');
  assert.ok(err instanceof Error);
  assert.equal(err.name, 'CacheError');
});
