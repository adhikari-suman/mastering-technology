/**
 * Part 06, Lesson 01 — throw, catch, finally
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
 * Run `fn` and report the outcome without ever throwing.
 *   success -> [null, value]
 *   failure -> [error, null]
 *
 * A non-Error throw must be normalised into an Error.
 */
export function attempt(fn) {
  let result;
  try {
    const value = fn();
    result = [null, value];
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    result = [error, null];
  } finally {
    return result;
  }
}

/**
 * Turn anything that might have been thrown into a real Error.
 * An existing Error is returned unchanged. Everything else is wrapped, with
 * the message being String(value).
 *
 * normaliseError('boom').message -> 'boom'
 */
export function normaliseError(value) {
  return value instanceof Error ? value : new Error(String(value));
}

/**
 * Run `fn` and ALWAYS run `cleanup` afterwards, whether fn returns or throws.
 * Return fn's value, or let its error propagate — cleanup must not change
 * either.
 */
export function withCleanup(fn, cleanup) {
  try {
    const result = fn();
    return result;
  } catch (err) {
    throw err;
  } finally {
    cleanup();
  }
}

/**
 * Deliberately demonstrate the trap: throw inside `try`, and `return
 * 'swallowed'` from `finally`. The error must vanish and the string come back.
 *
 * swallowsError() -> 'swallowed'   (with no error escaping)
 *
 * This is the bug, written on purpose so you recognise it in the wild.
 */
export function swallowsError() {
  try {
    throw new Error("This will be swallowed");
  } catch (err) {
  } finally {
    return "swallowed";
  }
}

/**
 * Run `fn`. If it throws, throw a NEW Error with `message`, keeping the
 * original as `cause`.
 *
 * rethrowWithContext(() => { throw new Error('inner'); }, 'outer')
 *   throws Error('outer') whose .cause.message is 'inner'
 */
export function rethrowWithContext(fn, message) {
  try {
    const result = fn();
    return result;
  } catch (error) {
    throw new Error(message, { cause: error });
  }
}

/**
 * Every error in the cause chain, outermost first.
 *
 * causeChain(new Error('a', { cause: new Error('b') }))
 *   -> [Error('a'), Error('b')]
 *
 * Must not loop forever if a cause chain is circular.
 */
export function causeChain(error) {
  let seen = new WeakSet();
  let result = [];

  let curr = error;

  while (curr != null) {
    if (!seen.has(curr)) {
      result.push(curr);
      seen.add(curr);
      curr = curr?.cause;
    } else {
      break;
    }
  }

  return result;
}

/**
 * True if `value` looks like an Error — even one from another realm, where
 * `instanceof Error` returns false.
 *
 * Duck-type it: a string `message` and a string `name`.
 */
export function isErrorLike(value) {
  return (
    value instanceof Error ||
    (typeof value === "object" &&
      typeof value?.message === "string" &&
      typeof value?.name === "string")
  );
}
