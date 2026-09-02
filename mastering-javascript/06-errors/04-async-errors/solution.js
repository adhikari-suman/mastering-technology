/**
 * Part 06, Lesson 04 — Errors in Async Code
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
 * Run an async fn and resolve with [error, value], never rejecting.
 * A synchronous throw must be caught too.
 */
export async function catchAsync(fn) {
  try {
    return [null, await fn()];
  } catch (error) {
    return [error, null];
  }
}

/**
 * Demonstrate the trap ON PURPOSE.
 *
 * Inside a try/catch, call an async function that rejects WITHOUT awaiting it,
 * and catch nothing. Return the string 'not caught' from the try block, and
 * 'caught' from the catch block.
 *
 * Because the rejection happens after the try exits, this returns 'not caught'.
 *
 * Attach a .catch to the floating promise so it does not crash the process —
 * that is deliberate, and the point is what the RETURN value is.
 */
export function missingAwait() {
  try {
    (async () => {
      throw new Error("I reject you");
    })().catch(() => {});

    return "not caught";
  } catch (err) {
    return "caught";
  }
}

/**
 * The same shape, with the await in place, so the catch actually fires.
 * Returns 'caught'.
 */
export async function withAwait() {
  try {
    await (async () => {
      throw new Error("I reject you");
    })();

    return "not caught";
  } catch (err) {
    return "caught";
  }
}

/**
 * Wait for every promise, then resolve with
 *   { successes: [values], failures: [reasons] }
 * Never rejects. Order within each array follows the input order.
 */
export async function settleAll(promises) {
  return Promise.allSettled(promises).then((settledResult) => {
    let response = { successes: [], failures: [] };

    for (let result of settledResult) {
      if (result.status === "fulfilled") {
        response.successes.push(result.value);
      } else {
        response.failures.push(result.reason);
      }
    }

    return response;
  });
}

/**
 * Resolve with EVERY rejection reason, not just the first — the thing
 * Promise.all throws away. Resolves with [] if none failed.
 */
export async function firstError(promises) {
  return Promise.allSettled(promises).then((settledResult) => {
    let response = { successes: [], errors: [] };

    for (let result of settledResult) {
      if (result.status === "fulfilled") {
        response.successes.push(result.value);
      } else {
        response.errors.push(result.reason);
      }
    }

    return response.errors;
  });
}

/**
 * Run async `fn`, then always run async `cleanup`.
 * Return fn's value, or let its error propagate.
 *
 * A cleanup that itself throws must NOT mask fn's error — fn's error wins.
 * If fn succeeded and cleanup throws, the cleanup error propagates.
 */
export async function withAsyncCleanup(fn, cleanup) {
  let errorToReturn = null;

  try {
    return await fn();
  } catch (err) {
    errorToReturn = err;
  } finally {
    try {
      await cleanup();
    } catch (err) {
      if (errorToReturn == null) errorToReturn = err;
    }

    if (errorToReturn != null) throw errorToReturn;
  }
}

/**
 * Make a fire-and-forget promise explicit: attach onError to its rejection so
 * it can never become an unhandled rejection, and return undefined
 * immediately without waiting.
 */
export function guardFloating(promise, onError) {
  Promise.resolve(promise).catch(onError);

  return undefined;
}
