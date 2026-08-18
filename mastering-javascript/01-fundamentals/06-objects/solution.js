/**
 * Read a property whose name is only known at runtime.
 * Return undefined if it isn't there.
 *
 * getProperty({ a: 1 }, 'a') -> 1
 */
export function getProperty(obj, key) {
  return obj?.[key];
}

/**
 * fullName({ first: 'Ada', last: 'Lovelace' }) -> 'Ada Lovelace'
 * Use destructuring in the parameter list.
 */
export function fullName({ first: firstName, last: lastName }) {
  return `${firstName} ${lastName}`;
}

/**
 * Read a nested value from a dotted path. Return undefined if any link is
 * missing — it must never throw.
 *
 * deepGet({ a: { b: { c: 1 } } }, 'a.b.c') -> 1
 * deepGet({ a: {} }, 'a.b.c')              -> undefined
 */
export function deepGet(obj, path) {
  const keys = path.split(".");

  let current = obj;

  for (let key of keys) {
    current = current?.[key];

    if (current === undefined) {
      return undefined;
    }
  }

  return current;
}

/**
 * Return a NEW object with `key` set to `value`. The original is untouched.
 *
 * withUpdated({ a: 1 }, 'b', 2) -> { a: 1, b: 2 }
 * withUpdated({ a: 1 }, 'a', 9) -> { a: 9 }
 */
export function withUpdated(obj, key, value) {
  return { ...obj, [key]: value };
}

/**
 * Return a NEW object without `key`. The original is untouched.
 *
 * omit({ a: 1, b: 2 }, 'b') -> { a: 1 }
 */
export function omit(obj, key) {
  const { [key]: first, ...safe } = obj;

  return safe;
}

/**
 * Invert an object: values become keys, keys become values.
 *
 * invert({ a: '1', b: '2' }) -> { '1': 'a', '2': 'b' }
 */
export function invert(obj) {
  return Object.fromEntries(
    Object.entries(obj).map((entry) => entry.reverse()),
  );
}

/**
 * Keep only the entries whose VALUE passes the predicate.
 *
 * filterValues({ a: 1, b: 5 }, (n) => n > 3) -> { b: 5 }
 */
export function filterValues(obj, predicate) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, val]) => predicate(val)),
  );
}

/**
 * Merge two objects into a new one. Keys in `b` win.
 * Shallow is fine.
 */
export function mergeObjects(a, b) {
  return { ...a, ...b };
}

/**
 * Build a rectangle object with width, height, and an `area()` method that
 * uses `this`. Use method shorthand — not an arrow function.
 *
 * makeRect(3, 4).area() -> 12
 */
export function makeRect(width, height) {
  return {
    width,
    height,
    area: function () {
      return this.width * this.height;
    },
  };
}

/**
 * Deep-copy an object so that mutating the copy — at ANY depth — cannot
 * affect the original.
 */
export function deepCopy(obj) {
  // base case: primitive | null | undefined
  if (obj == null || typeof obj !== "object") {
    return obj;
  }

  // arrays are objects too so must be handled first
  if (Array.isArray(obj)) {
    const result = [];
    for (let item of obj) {
      result.push(deepCopy(item));
    }
    return result;
  }

  // Plain object
  return Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [key, deepCopy(val)]),
  );
}
