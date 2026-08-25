/**
 * Part 04, Lesson 06 — Build a Promise
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 *
 * RULE: no native Promise anywhere. No async/await either — that creates
 * native promises. Use queueMicrotask for the asynchrony.
 */

/**
 * REVISIT THIS ONE.
 *
 * Worked out solo: the constructor's closure-captured resolve/reject, the
 * #settle once-guard, and the #handlers park-and-drain — the actual machine.
 *
 * Handed over rather than derived: then's task/queueMicrotask structure,
 * thenable adoption in resolve, catch, finally, and deferred. Redo these from
 * the docblock without looking:
 *
 *   - then      : why the resolve/reject inside its executor belong to the NEW
 *                 promise, and why queueMicrotask sits inside the task rather
 *                 than around the park-or-run decision
 *   - resolve   : duck-typing a thenable on .then, then.call(value, ...) so the
 *                 property is read once, and recursing for a thenable of a
 *                 thenable
 *   - catch     : is exactly then(undefined, fn) — nothing of its own
 *   - finally   : return the value / rethrow the reason, so its own return
 *                 value is discarded
 *   - deferred  : only works because the executor runs synchronously
 */

/**
 * A promise implementation.
 *
 *   new MyPromise((resolve, reject) => { ... })
 *
 * Requirements:
 *  - the executor runs SYNCHRONOUSLY, immediately
 *  - an executor that throws rejects the promise
 *  - settling twice is ignored; the first outcome wins
 *  - .then(onFulfilled, onRejected) returns a NEW MyPromise
 *  - handlers ALWAYS run asynchronously, via queueMicrotask
 *  - a handler returning a thenable adopts it
 *  - a missing handler passes the value or reason through
 *  - .catch(fn) is .then(undefined, fn)
 *  - .finally(fn) runs on both paths and passes through
 */

const PromiseState = Object.freeze({
  PENDING: "pending",
  FULFILLED: "fulfilled",
  REJECTED: "rejected",
});

export class MyPromise {
  #state = PromiseState.PENDING;
  #value = undefined;
  #handlers = [];

  constructor(fn) {
    this.#state = PromiseState.PENDING;

    const resolve = (value) => {
      if (value && (typeof value === "object" || typeof value === "function")) {
        const then = value.then;
        if (typeof then === "function") {
          then.call(value, resolve, reject); // adopt: wait for it, recurse
          return;
        }
      }

      this.#settle(PromiseState.FULFILLED, value);
    };
    const reject = (reason) => this.#settle(PromiseState.REJECTED, reason);

    try {
      fn(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  #settle(state, value) {
    if (this.#state !== PromiseState.PENDING) return;
    this.#state = state;
    this.#value = value;
    this.#handlers.forEach((task) => task());
    this.#handlers = [];
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const task = () => {
        queueMicrotask(() => {
          const settled = this.#state === PromiseState.FULFILLED;
          const handler = settled ? onFulfilled : onRejected;

          if (typeof handler !== "function") {
            // no handler for this path - pass the value straight through
            settled ? resolve(this.#value) : reject(this.#value);
            return;
          }

          try {
            resolve(handler(this.#value)); // handler's return becomes the new promise's value
          } catch (err) {
            reject(err); // a throwing handler rejects the new promise
          }
        });
      };

      if (this.#state === PromiseState.PENDING) this.#handlers.push(task);
      else task();
    });
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  finally(onFinally) {
    return this.then(
      (value) => {
        onFinally();
        return value;
      },
      (reason) => {
        onFinally();
        throw reason;
      },
    );
  }

  static resolve(value) {
    return new MyPromise((res) => res(value));
  }

  static reject(reason) {
    return new MyPromise((_, rej) => rej(reason));
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      let results = new Array(promises.length);
      let remaining = promises.length;
      let errorFound = false;

      if (remaining === 0) resolve(results);

      promises.forEach((promise, idx) => {
        MyPromise.resolve(promise).then((value) => {
          if (--remaining === 0) resolve(results);

          results[idx] = value;
        }, reject);
      });
    });
  }

  static allSettled(promises) {
    return new MyPromise((resolve, reject) => {
      let results = new Array(promises.length);
      let remaining = promises.length;
      let errorFound = false;

      if (remaining === 0) resolve(results);

      promises.forEach((promise, idx) => {
        MyPromise.resolve(promise)
          .then((value) => {
            resolve(results);

            results[idx] = {
              status: "fulfilled",
              value,
            };
          })
          .catch((reason) => {
            results[idx] = {
              status: "rejected",
              reason,
            };
          })
          .finally(() => {
            if (--remaining == 0) resolve(results);
          });
      });
    });
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      let isFinished = false;

      promises.forEach((promise, idx) => {
        MyPromise.resolve(promise)
          .then((value) => {
            if (!isFinished) {
              isFinished = true;
              resolve(value);
            }
          })
          .catch((reason) => {
            if (!isFinished) {
              isFinished = true;
              reject(reason);
            }
          });
      });
    });
  }
}

/**
 * Statics on MyPromise (attach them to the class):
 *
 *   MyPromise.resolve(value)     already-fulfilled (adopts a thenable)
 *   MyPromise.reject(reason)     already-rejected
 *   MyPromise.all(items)         all values, or the first rejection
 *   MyPromise.allSettled(items)  never rejects
 *   MyPromise.race(items)        first to settle
 *
 * All of them return a MyPromise, not a native one.
 */

/**
 * An externally-settleable promise.
 *
 * const d = deferred();
 * d.resolve(5);
 * d.promise.then(v => ...)   // v === 5
 */
export function deferred() {
  let resolve;
  let reject;

  const promise = new MyPromise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}
