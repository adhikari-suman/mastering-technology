/**
 * Part 06, Lesson 03 — Returning Errors Instead of Throwing
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 *
 * A Result is { ok: true, value } or { ok: false, error }.
 */

/**
 * ok(5) -> { ok: true, value: 5 }
 */
export function ok(value) {
  return { ok: true, value };
}

/**
 * err('boom') -> { ok: false, error: 'boom' }
 */
export function err(error) {
  return { ok: false, error };
}

/**
 * Guards.
 */
export function isOk(result) {
  return result.ok;
}

export function isErr(result) {
  return !result.ok;
}

/**
 * Apply `fn` to a success value, returning a new Result. A failure passes
 * through untouched and `fn` is never called.
 *
 * mapResult(ok(2), n => n * 2) -> ok(4)
 * mapResult(err('e'), fn)      -> err('e')
 */
export function mapResult(result, fn) {
  return isOk(result) ? ok(fn(result.value)) : result;
}

/**
 * Like mapResult, but `fn` itself RETURNS a Result — so the result is not
 * double-wrapped. This is how you sequence fallible steps.
 *
 * chainResult(ok(2), n => ok(n * 2))    -> ok(4)
 * chainResult(ok(2), n => err('bad'))   -> err('bad')
 * chainResult(err('e'), fn)             -> err('e')
 */
export function chainResult(result, fn) {
  if (isOk(result)) {
    const nextResult = fn(result.value);

    return nextResult;
  } else {
    return result;
  }
}

/**
 * The value on success, `fallback` on failure.
 */
export function unwrapOr(result, fallback) {
  return isOk(result) ? result.value : fallback;
}

/**
 * Turn a function that THROWS into one that returns a Result.
 * The thrown value becomes the error.
 *
 * fromThrowing(JSON.parse)('{oops}')  -> { ok: false, error: SyntaxError }
 */
export function fromThrowing(fn) {
  return (...args) => {
    try {
      const result = fn(...args);

      return ok(result);
    } catch (e) {
      return err(e);
    }
  };
}

/**
 * The reverse: a Result-returning function becomes one that throws on failure.
 * Used at the boundary where Results meet code that expects exceptions.
 * A non-Error error must be normalised into an Error before throwing.
 */
export function toThrowing(fn) {
  return (...args) => {
    const result = fn(...args);

    if (isOk(result)) {
      return result.value;
    } else {
      const error =
        result.error instanceof Error
          ? result.error
          : new Error(String(result.error));

      throw error;
    }
  };
}

/**
 * Combine an array of Results.
 *   all successes -> ok([values])
 *   any failure   -> the FIRST failing Result, unchanged
 *
 * all([]) -> ok([])
 */
export function all(results) {
  let response = [];

  for (let result of results) {
    if (isOk(result)) {
      response.push(result.value);
    } else {
      return result;
    }
  }

  return ok(response);
}
