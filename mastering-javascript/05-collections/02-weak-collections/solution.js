/**
 * Part 05, Lesson 02 — WeakMap and WeakSet
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 */

import { type } from "node:os";

/**
 * Return { set, get, has, remove } backed by a WeakMap, giving any object
 * private associated data without touching the object itself.
 *
 * const store = makePrivateStore();
 * store.set(obj, { secret: 1 });
 * store.get(obj)  -> { secret: 1 }
 * Object.keys(obj) is unaffected.
 */
export function makePrivateStore() {
  const privateStore = new WeakMap();

  class Store {
    constructor() {}

    set(obj, value) {
      privateStore.set(obj, value);
    }

    get(obj) {
      return privateStore.get(obj);
    }

    has(obj) {
      return privateStore.has(obj);
    }

    remove(obj) {
      return privateStore.delete(obj);
    }
  }

  return new Store();
}

/**
 * A class keeping ALL its state in a module-level WeakMap rather than on the
 * instance — the pre-#private pattern.
 *
 *   const t = new Tagged('a');
 *   t.getTag()          -> 'a'
 *   t.setTag('b');
 *   t.getTag()          -> 'b'
 *   Object.keys(t)      -> []          nothing on the instance
 *   JSON.stringify(t)   -> '{}'
 */
const privates = new WeakMap();

export class Tagged {
  constructor(tag) {
    privates.set(this, tag);
  }

  getTag() {
    return privates.get(this);
  }

  setTag(tag) {
    privates.set(this, tag);
  }
}

/**
 * Memoize a single-object-argument function using a WeakMap, so cached
 * entries don't keep their keys alive.
 *
 * Non-object arguments should just call through without caching.
 */
export function weakMemoize(fn) {
  const cache = new WeakMap();
  return (args) => {
    if (typeof args !== "object") return fn(args);

    if (!cache.has(args)) {
      let result = fn(args);
      cache.set(args, result);
    }

    return cache.get(args);
  };
}

/**
 * Return a function that calls `fn(node)` the first time it sees each object,
 * and returns undefined without calling fn for anything already seen.
 * Use a WeakSet.
 *
 * const visit = visitOnce(n => n.value);
 * visit(a) -> a.value
 * visit(a) -> undefined
 */
export function visitOnce(fn) {
  let seen = new WeakSet();

  return (node) => {
    if (!seen.has(node)) {
      seen.add(node);

      return fn(node);
    }

    return undefined;
  };
}

/**
 * True if `value` is legal as a WeakMap key: objects (including arrays and
 * functions) and symbols, but not null and not primitives.
 */
export function canBeWeakKey(value) {
  return (
    value != null &&
    (typeof value === "object" ||
      typeof value === "function" ||
      typeof value === "symbol")
  );
}

/**
 * Count the distinct objects reachable from `obj`, including obj itself.
 * Must terminate on cycles. Use a WeakSet to track what you've seen.
 *
 * const a = { b: { } }; a.self = a;
 * deepCountUnique(a) -> 2
 */
export function deepCountUnique(obj) {
  const counter = { unique: 0 };
  let cache = new WeakSet();

  deepCountUniqueRecursive(obj, cache, counter);

  return counter.unique;
}

function deepCountUniqueRecursive(obj, cache, counter) {
  if (obj == null || typeof obj !== "object") return;

  if (cache.has(obj)) return;

  cache.add(obj);
  counter.unique++;

  for (let key of Object.keys(obj)) {
    deepCountUniqueRecursive(obj[key], cache, counter);
  }
}
