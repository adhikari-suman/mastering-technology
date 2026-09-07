/**
 * Part 06, Lesson 06 — Retry, Backoff and Resource Cleanup
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
 * True for errors worth retrying: err.code is one of 'ETIMEDOUT',
 * 'ECONNRESET', 'ECONNREFUSED', or err.status is 429 or >= 500.
 * Everything else is false — including a plain Error with no code.
 */
export function isTransient(err) {
  return (
    err?.code === "ETIMEDOUT" ||
    err?.code === "ECONNRESET" ||
    err?.code === "ECONNREFUSED" ||
    err?.status === 429 ||
    err?.status >= 500
  );
}

/**
 * The delay before a given attempt, doubling each time.
 * attempt is 0-based: exponentialDelay(0, 100) -> 100, (1, 100) -> 200,
 * (2, 100) -> 400.
 */
export function exponentialDelay(attempt, base) {
  return base * 2 ** attempt;
}

/**
 * Retry an async fn.
 *
 * options: {
 *   attempts = 3,          total calls, not extra ones
 *   base = 10,             base delay in ms between attempts
 *   shouldRetry = () => true,   predicate on the error
 *   onRetry,               optional (error, attempt) callback before waiting
 * }
 *
 * Resolve with the first success. If shouldRetry says no, reject immediately
 * without further attempts. If attempts run out, reject with the last error.
 * Wait exponentialDelay(attemptIndex, base) between attempts.
 */
export function retryWithBackoff(fn, options = {}) {
  const optionsWithDefaults = {
    base: options?.base ?? 10,
    attempts: options?.attempts ?? 3,
    currentAttempts: 0,
    shouldRetry: options?.shouldRetry ?? (() => true),
    onRetry: options?.onRetry,
  };

  return retryWithBackoffDefaults(fn, optionsWithDefaults);
}

function retryWithBackoffDefaults(fn, options) {
  return Promise.resolve(fn()).catch((err) => {
    if (
      (typeof options?.shouldRetry === "function" &&
        !options?.shouldRetry(err)) ||
      options?.currentAttempts + 1 >= options?.attempts
    ) {
      return Promise.reject(err);
    }

    if (typeof options?.onRetry === "function")
      options?.onRetry(err, options?.currentAttempts);

    return new Promise((resolve) => {
      const delayInMs = exponentialDelay(
        options?.currentAttempts,
        options?.base,
      );

      setTimeout(() => {
        resolve(
          retryWithBackoffDefaults(fn, {
            ...options,
            currentAttempts: options?.currentAttempts + 1,
          }),
        );
      }, delayInMs);
    });
  });
}

/**
 * Wrap an async fn in a circuit breaker.
 *
 * options: { threshold = 3, cooldown = 50 }
 *
 * Returns a function with a `.state` getter reporting
 * 'closed' | 'open' | 'half-open'.
 *
 *  - closed: calls fn. Consecutive failures are counted; a success resets it.
 *  - after `threshold` consecutive failures it OPENS: calls reject immediately
 *    with an Error whose message is 'circuit open', without calling fn.
 *  - after `cooldown` ms it becomes HALF-OPEN: the next call is let through.
 *    Success closes it and resets the count; failure re-opens it.
 */
export function circuitBreaker(fn, options = {}) {
  const optionsWithDefaults = {
    threshold: options?.threshold ?? 3,
    cooldown: options?.cooldown ?? 50,
  };

  return circuitBreakerWithDefaults(fn, optionsWithDefaults);
}

function circuitBreakerWithDefaults(fn, options) {
  const STATES = {
    OPEN: "open",
    CLOSED: "closed",
    HALF_OPEN: "half-open",
  };

  let _state = STATES.CLOSED,
    _attempts = 0,
    _timerId = null;

  const setState = (stateType) => {
    switch (stateType) {
      case STATES.OPEN:
        _state = STATES.OPEN;
        _attempts = 0;
        _timerId = setTimeout(() => {
          setState(STATES.HALF_OPEN);
        }, options.cooldown);
        break;

      case STATES.CLOSED:
        _state = STATES.CLOSED;
        _attempts = 0;
        clearTimeout(_timerId);
        _timerId = null;
        break;
      case STATES.HALF_OPEN:
        _state = STATES.HALF_OPEN;
        _attempts = 0;
        clearTimeout(_timerId);
        _timerId = null;
        break;
      default:
        break;
    }
  };

  const myFn = async (...args) => {
    if (_state === STATES.OPEN) {
      return Promise.reject(new Error("circuit open"));
    }

    return Promise.resolve(fn(...args))
      .then((value) => {
        setState(STATES.CLOSED);

        return value;
      })
      .catch((err) => {
        if (_state === STATES.HALF_OPEN) {
          setState(STATES.OPEN);
        } else if (++_attempts >= options.threshold) {
          setState(STATES.OPEN);
        }

        return Promise.reject(err);
      });
  };

  Object.defineProperty(myFn, "state", {
    get: () => _state,
  });

  return myFn;
}

/**
 * Acquire a resource, use it, and ALWAYS release it.
 *
 * `acquire()` resolves to a resource with a `release()` method.
 * Return use(resource)'s value, or let its error propagate — but release
 * either way, and never let a release error mask the original.
 */
export async function withResource(acquire, use) {
  const resource = await acquire();

  try {
    return await use(resource);
  } finally {
    try {
      await resource.release();
    } catch {}
  }
}

/**
 * The same for several resources, acquired in order and released in REVERSE
 * order. use() receives an array of the resources.
 *
 * If one acquire fails, everything already acquired must still be released.
 * If one release fails, the remaining releases must still be attempted.
 */
export async function withResources(acquirers, use) {
  const resources = [];

  try {
    for (const acquire of acquirers) {
      resources.push(await acquire());
    }

    return await use(resources);
  } finally {
    for (let i = resources.length - 1; i >= 0; i--) {
      try {
        await resources[i].release();
      } catch {}
    }
  }
}
