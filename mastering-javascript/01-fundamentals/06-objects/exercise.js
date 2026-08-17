/**
 * Lesson 06 — Objects
 *
 * No function here may mutate its arguments.
 * Run: node --test --watch .
 */

/**
 * Read a property whose name is only known at runtime.
 * Return undefined if it isn't there.
 *
 * getProperty({ a: 1 }, 'a') -> 1
 */
export function getProperty(obj, key) {
  // TODO: dot notation cannot do this
  throw new Error('getProperty: not implemented');
}

/**
 * fullName({ first: 'Ada', last: 'Lovelace' }) -> 'Ada Lovelace'
 * Use destructuring in the parameter list.
 */
export function fullName(person) {
  // TODO
  throw new Error('fullName: not implemented');
}

/**
 * Read a nested value from a dotted path. Return undefined if any link is
 * missing — it must never throw.
 *
 * deepGet({ a: { b: { c: 1 } } }, 'a.b.c') -> 1
 * deepGet({ a: {} }, 'a.b.c')              -> undefined
 */
export function deepGet(obj, path) {
  // TODO: split the path, then walk it
  throw new Error('deepGet: not implemented');
}

/**
 * Return a NEW object with `key` set to `value`. The original is untouched.
 *
 * withUpdated({ a: 1 }, 'b', 2) -> { a: 1, b: 2 }
 * withUpdated({ a: 1 }, 'a', 9) -> { a: 9 }
 */
export function withUpdated(obj, key, value) {
  // TODO
  throw new Error('withUpdated: not implemented');
}

/**
 * Return a NEW object without `key`. The original is untouched.
 *
 * omit({ a: 1, b: 2 }, 'b') -> { a: 1 }
 */
export function omit(obj, key) {
  // TODO: rest destructuring can do this in one line, but any approach works
  throw new Error('omit: not implemented');
}

/**
 * Invert an object: values become keys, keys become values.
 *
 * invert({ a: '1', b: '2' }) -> { '1': 'a', '2': 'b' }
 */
export function invert(obj) {
  // TODO: entries -> map -> fromEntries
  throw new Error('invert: not implemented');
}

/**
 * Keep only the entries whose VALUE passes the predicate.
 *
 * filterValues({ a: 1, b: 5 }, (n) => n > 3) -> { b: 5 }
 */
export function filterValues(obj, predicate) {
  // TODO
  throw new Error('filterValues: not implemented');
}

/**
 * Merge two objects into a new one. Keys in `b` win.
 * Shallow is fine.
 */
export function mergeObjects(a, b) {
  // TODO
  throw new Error('mergeObjects: not implemented');
}

/**
 * Build a rectangle object with width, height, and an `area()` method that
 * uses `this`. Use method shorthand — not an arrow function.
 *
 * makeRect(3, 4).area() -> 12
 */
export function makeRect(width, height) {
  // TODO
  throw new Error('makeRect: not implemented');
}

/**
 * Deep-copy an object so that mutating the copy — at ANY depth — cannot
 * affect the original.
 */
export function deepCopy(obj) {
  // TODO: there is a built-in for this
  throw new Error('deepCopy: not implemented');
}
