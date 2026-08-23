/**
 * The own property descriptor for `key`, or null if it isn't an own property.
 * (The built-in returns undefined; normalise that to null.)
 */
export function describe(obj, key) {
  if (!Object.hasOwn(obj, key)) {
    return null;
  }

  return Object.getOwnPropertyDescriptor(obj, key);
}

/**
 * Define a constant: readable and visible to Object.keys, but not writable,
 * not configurable, and not deletable. Return obj.
 *
 * In strict mode, assigning to it throws.
 */
export function defineConstant(obj, key, value) {
  Object.defineProperty(obj, key, {
    value,
    enumerable: true,
  });

  return obj;
}

/**
 * Define a property that behaves normally for reading and writing, but never
 * appears in Object.keys, for...in, spread or JSON.stringify. Return obj.
 */
export function defineHidden(obj, key, value) {
  Object.defineProperty(obj, key, {
    value,
    writable: true,
    configurable: true,
  });

  return obj;
}

/**
 * Define an enumerable getter-only property backed by `getter`, which is
 * called with obj as `this`. Return obj.
 *
 * defineComputed(user, 'full', function () { return `${this.first} ${this.last}`; })
 */
export function defineComputed(obj, key, getter) {
  Object.defineProperty(obj, key, {
    get() {
      return getter.call(obj);
    },
    enumerable: true,
  });

  return obj;
}

/**
 * Own ENUMERABLE keys only.
 */
export function enumerableKeys(obj) {
  let result = [];

  for (let key in obj) {
    result.push(key);
  }

  return result;
}

/**
 * ALL own keys, enumerable or not.
 */
export function allOwnKeys(obj) {
  let result = [];
  for (let key of Object.getOwnPropertyNames(obj)) {
    result.push(key);
  }

  return result;
}

/**
 * Freeze an object and every plain object or array reachable from it.
 * Return the object. Must not loop forever on a circular reference.
 */
export function deepFreeze(obj) {
  let seen = new WeakSet();

  return deepFreezeRecursive(obj, seen);
}

function deepFreezeRecursive(obj, seen) {
  if (obj == null || typeof obj !== "object" || seen.has(obj)) {
    return obj;
  }

  seen.add(obj);

  for (let item of Object.getOwnPropertyNames(obj)) {
    deepFreezeRecursive(obj[item], seen);
  }

  return Object.freeze(obj);
}

/**
 * True if obj and everything reachable from it is frozen.
 */
export function isDeeplyFrozen(obj) {
  return isDeeplyFrozenRecursive(obj, new WeakSet());
}

function isDeeplyFrozenRecursive(obj, seen) {
  if (obj == null || typeof obj !== "object" || seen.has(obj)) return true;

  seen.add(obj);

  if (!Object.isFrozen(obj)) return false;

  for (let key of Object.getOwnPropertyNames(obj)) {
    if (!isDeeplyFrozenRecursive(obj[key], seen)) return false;
  }
  return true;
}
