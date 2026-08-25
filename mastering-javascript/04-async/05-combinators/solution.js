/**
 * Part 04, Lesson 05 — Combinators and Cancellation
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 *
 * RULE: implement the four combinators with `new Promise` and .then/.catch.
 * Don't delegate to Promise.all/allSettled/race/any.
 */

/**
 * Resolve with every value once ALL settle successfully, in input order.
 * Reject as soon as any one rejects.
 * all([]) resolves to [].
 */
export function all(promises) {
  return new Promise((resolve, reject) => {
    const results = new Array(promises.length);
    let remaining = promises.length;

    if (remaining === 0) return resolve(results);

    promises.forEach((promise, idx) => {
      Promise.resolve(promise).then((value) => {
        results[idx] = value;

        if (--remaining == 0) resolve(results);
      }, reject);
    });
  });
}

/**
 * Never rejects. Resolves once every promise has settled, with
 * { status: 'fulfilled', value } or { status: 'rejected', reason } per entry.
 */
export function allSettled(promises) {
  return new Promise((resolve, reject) => {
    const results = new Array(promises.length);
    let remaining = promises.length;

    if (remaining === 0) resolve(results);

    promises.forEach((promise, idx) => {
      Promise.resolve(promise)
        .then((value) => {
          results[idx] = {
            status: "fulfilled",
            value,
          };
        })
        .catch((err) => {
          results[idx] = {
            status: "rejected",
            reason: err,
          };
        })
        .finally(() => {
          if (--remaining == 0) resolve(results);
        });
    });
  });
}

/**
 * Settle exactly as the FIRST promise to settle does — value or rejection.
 * race([]) stays pending forever, which is correct.
 */
export function race(promises) {
  return new Promise((resolve, reject) => {
    let isResoved = false;

    promises.forEach((promise, idx) => {
      Promise.resolve(promise)
        .then((value) => {
          if (!isResoved) {
            isResoved = true;
            resolve(value);
          }
        })
        .catch((err) => {
          if (!isResoved) {
            isResoved = true;
            reject(err);
          }
        });
    });
  });
}

/**
 * Resolve with the first promise to FULFIL, ignoring rejections.
 * If every one rejects, reject with an AggregateError whose `errors` array
 * holds the reasons in input order.
 * any([]) rejects with an AggregateError immediately.
 */
export function any(promises) {
  return new Promise((resolve, reject) => {
    let errors = new Array(promises.length);
    let errorCount = 0;
    let isResolved = false;

    if (promises.length === 0) reject(new AggregateError(errors));

    promises.forEach((promise, idx) => {
      Promise.resolve(promise)
        .then((value) => {
          if (!isResolved && errorCount !== errors.length) {
            isResolved = true;
            resolve(value);
          }
        })
        .catch((err) => {
          if (!isResolved && errorCount !== errors.length) {
            errorCount++;
            errors[idx] = err;
          }
        })
        .finally(() => {
          if (!isResolved && errorCount === errors.length) {
            reject(new AggregateError(errors));
          }
        });
    });
  });
}

/**
 * Resolve after `ms`, unless `signal` aborts first — then reject with
 * signal.reason.
 *
 * Must also reject immediately if the signal is ALREADY aborted, and must
 * clearTimeout so the pending timer doesn't outlive the rejection.
 */
export function abortableWait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);

    const timerId = setTimeout(resolve, ms);

    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timerId);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

/**
 * Map over items with an async fn, at most `limit` running at any moment.
 * Results in input order. Reject on the first failure.
 *
 * mapLimit([1,2,3,4], 2, fn) never has 3 in flight at once.
 */
export async function mapLimit(items, limit, fn) {
  const result = new Array(items.length);
  let cursor = 0;

  async function worker() {
    if (cursor < items.length) {
      const idx = cursor++;
      result[idx] = await fn(items[idx], idx);
    }
  }

  for (let i = 0; i < items.length; i += limit) {
    const promises = [];
    for (let k = 0; k < limit; k++) {
      promises.push(worker());
    }

    await Promise.all(promises);
  }

  return result;
}
