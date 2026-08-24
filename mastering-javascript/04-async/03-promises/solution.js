/**
 * A promise resolving with undefined after `ms` milliseconds.
 */
export function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined);
    }, ms);
  });
}

/**
 * A promise resolving with `value` after `ms` milliseconds.
 */
export function resolveAfter(ms, value) {
  return new Promise((resolve, _) => {
    setTimeout(() => {
      resolve(value);
    }, ms);
  });
}

/**
 * A promise rejecting with `error` after `ms` milliseconds.
 */
export function rejectAfter(ms, error) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(error);
    }, ms);
  });
}

/**
 * Thread `value` through each function in order. A function may return a plain
 * value or a promise; either way the next one receives the resolved value.
 * Resolve with the final result. Any rejection propagates.
 *
 * chain(2, n => n + 1, async n => n * 10) -> 30
 * chain(2) -> 2
 */
export function chain(value, ...fns) {
  return fns.reduce((promise, fn) => promise.then(fn), Promise.resolve(value));
}

/**
 * Call `fn` (which returns a promise). If it rejects, try again, up to
 * `attempts` total calls. Resolve with the first success; if every attempt
 * fails, reject with the LAST error.
 *
 * attempts of 1 means no retry at all.
 */
export function retry(fn, attempts) {
  return fn().catch((err) => {
    if (attempts <= 1) throw err;
    return retry(fn, attempts - 1);
  });
}

/**
 * Resolve with the promise's value if it settles within `ms`.
 * Otherwise reject with an Error whose message is exactly 'timeout'.
 *
 * A rejection from the original promise must propagate unchanged.
 */
export function withTimeout(promise, ms) {
  let startTime = Date.now();

  return promise.then((data) => {
    let stopTime = Date.now();

    if (stopTime - startTime > ms) return Promise.reject(new Error("timeout"));
    else return Promise.resolve(data);
  });
}

/**
 * Never rejects. Resolves with:
 *   { status: 'fulfilled', value }   or   { status: 'rejected', reason }
 *
 * This is one element of Promise.allSettled, which you build in lesson 05.
 */
export function settle(promise) {
  return new Promise((resolve, _) => {
    return promise
      .then((value) => {
        resolve({
          status: "fulfilled",
          value,
        });
      })
      .catch((err) => {
        resolve({
          status: "rejected",
          reason: err,
        });
      });
  });
}

/**
 * Run `fn` for its side effect with the resolved value, then pass the value
 * through unchanged — Part 02's tap, for promises.
 *
 * resolveAfter(1, 5).then(tapPromise(console.log)) still resolves to 5
 */
export function tapPromise(fn) {
  return (value) => {
    return Promise.resolve(value)
      .then(fn)
      .then(() => value);
  };
}
