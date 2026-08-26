/**
 * Part 05, Lesson 05 — JSON
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 */

/**
 * Parse without throwing.
 *   valid   -> [null, value]
 *   invalid -> [error, null]
 */
export function safeParse(text) {
  try {
    let result = JSON.parse(text);
    return [null, result];
  } catch (error) {
    return [error, null];
  }
}

/**
 * Stringify with object keys sorted, at every depth, so that two objects with
 * the same contents in a different order produce identical output.
 * Arrays keep their order.
 *
 * stringifyStable({ b: 1, a: 2 }) === stringifyStable({ a: 2, b: 1 })
 */
export function stringifyStable(value) {
  return JSON.stringify(deepCopyStable(value));
}

function deepCopyStable(obj) {
  if (obj == null || Array.isArray(obj) || typeof obj !== "object") return obj;

  let sortedObj = {};

  const sortedKeys = [...Object.keys(obj)].sort();

  for (let key of sortedKeys) {
    sortedObj[key] = deepCopyStable(obj[key]);
  }

  return sortedObj;
}

/**
 * Stringify while dropping every key in `keys`, at any depth.
 *
 * redact({ user: 'a', password: 'x' }, ['password']) -> '{"user":"a"}'
 */
export function redact(obj, keys) {
  return JSON.stringify(deepCopyRedact(obj, new Set(keys)));
}

function deepCopyRedact(obj, redactedKeys) {
  if (obj == null || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => deepCopyRedact(item, redactedKeys));
  }

  let newObj = {};

  for (let key of Object.keys(obj)) {
    if (!redactedKeys.has(key))
      newObj[key] = deepCopyRedact(obj[key], redactedKeys);
  }

  return newObj;
}

/**
 * Parse, converting any string that looks like an ISO 8601 timestamp into a
 * Date. Everything else is left alone.
 *
 * reviveDates('{"at":"2020-01-01T00:00:00.000Z"}').at instanceof Date -> true
 */
export function reviveDates(text) {
  const ISO =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

  const revivier = (key, value) => {
    return typeof value === "string" && ISO.test(value)
      ? new Date(value)
      : value;
  };

  return JSON.parse(text, revivier);
}

/**
 * Serialise a value to a string, surviving Map, Set and undefined — all of
 * which plain JSON loses. deserialise must restore them exactly.
 *
 * Design your own tagged encoding; the tests only check the round trip.
 */
export function serialise(obj) {
  const replacer = (key, value) => {
    if (value === undefined) {
      return "::UNDEF::";
    }

    if (value instanceof Set) {
      return {
        "::SET::": [...value],
      };
    }

    if (value instanceof Map) {
      return {
        "::MAP::": [...value],
      };
    }

    return value;
  };

  let text = JSON.stringify(obj, replacer);

  return text;
}

/**
 * The inverse of serialise.
 *
 * Careful: a JSON.parse REVIVER that returns undefined DELETES the key, so a
 * reviver alone can never restore an undefined value. Parse first, then walk
 * the result and assign explicitly — `out[key] = undefined` keeps the key.
 */
export function deserialise(text) {
  const reviver = (key, value) => {
    if (typeof value === "object") {
      if (value["::MAP::"] != null && typeof value["::MAP::"] === "object") {
        return new Map(value["::MAP::"]);
      }

      if (value["::SET::"] != null && typeof value["::SET::"] === "object") {
        return new Set(value["::SET::"]);
      }

      return value;
    }

    return value;
  };

  let obj = JSON.parse(text, reviver);
  deepRevive(obj);

  return obj;
}

function deepRevive(obj) {
  if (obj == null || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    obj.map((item) => (item === "::UNDEF::" ? undefined : item));
    return obj;
  }

  for (let key of Object.keys(obj)) {
    if (obj[key] === "::UNDEF::") {
      obj[key] = undefined;
    } else {
      obj[key] = deepRevive(obj[key]);
    }
  }

  return obj;
}

/**
 * Deep clone, preserving Map, Set, Date and circular references.
 * There is a built-in that does all of this.
 */
export function deepClone(obj) {
  // structuredClone is the built-in the docblock points at: it handles Map,
  // Set, Date and circular references natively, in the structured clone
  // algorithm the platform already uses for postMessage and IndexedDB.
  return structuredClone(obj);
}

/**
 * True if a JSON round trip would CHANGE the value — because it contains
 * functions, undefined, Map, Set, NaN, Infinity, or similar.
 *
 * losesData({ a: 1 })          -> false
 * losesData({ fn: () => {} })  -> true
 * losesData({ n: NaN })        -> true
 */
export function losesData(value) {
  const t = typeof value;

  if (
    t === "function" ||
    t === "undefined" ||
    t === "symbol" ||
    t === "bigint"
  )
    return true;

  if (t === "number") return !Number.isFinite(value);

  if (t !== "object" || value === null) return false; // string, boolean, null - all safe

  if (Array.isArray(value)) return value.some(losesData);

  if (Object.getPrototypeOf(value) !== Object.prototype) return true;

  return Object.values(value).some(losesData);
}
