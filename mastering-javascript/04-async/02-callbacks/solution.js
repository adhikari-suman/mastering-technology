/**
 * Part 04, Lesson 02 — Callbacks
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 *
 * Every callback here is error-first: cb(err, value), err === null on success.
 */

/**
 * Call `cb(null, value)` after `ms` milliseconds.
 * If `value` is an Error, call cb(value) instead — a way to simulate failure.
 *
 * delay(1, 'x', (err, v) => ...)   // v === 'x'
 */
export function delay(ms, value, cb) {
  setTimeout(() => {
    if (value instanceof Error) {
      cb(value);
      return;
    }

    cb(null, value);
  }, ms);
}

/**
 * Turn an error-first callback function into one returning a promise.
 *
 * const wait = promisify(delay);
 * await wait(1, 'x')  -> 'x'
 * A callback error must reject the promise.
 */
export function promisify(fn) {
  return (...args) =>
    new Promise((resolve, reject) => {
      fn(...args, (err, data) => {
        if (err instanceof Error) {
          reject(err);
          return;
        }

        resolve(data);
      });
    });
}

/**
 * The reverse: turn a promise-returning function into an error-first callback
 * function. The callback is appended to the arguments.
 *
 * const cbStyle = callbackify(async (n) => n * 2);
 * cbStyle(5, (err, v) => ...)   // v === 10
 */
export function callbackify(fn) {
  return (...args) => {
    const cb = args.pop();

    fn(...args)
      .then((v) => cb(null, v))
      .catch((err) => cb(err));
  };
}

/**
 * Run `tasks` — an array of functions each taking a single callback — ONE AT A
 * TIME, in order. Call `cb(null, results)` with the values in order.
 * On the first error, call cb(err) immediately and run nothing further.
 *
 * series([], cb) -> cb(null, [])
 */
export function series(tasks, cb) {
  let results = [];
  let i = 0;

  function next() {
    if (i === tasks.length) return cb(null, results);

    tasks[i++]((err, data) => {
      if (err) return cb(err);
      results.push(data);
      next();
    });
  }

  next();
}

/**
 * Run all `tasks` at once. Call cb(null, results) with results in the ORIGINAL
 * order, whatever order they finished in.
 * On the first error, call cb(err) — and cb must still only fire once.
 */
export function parallel(tasks, cb) {
  const result = new Array(tasks.length);
  let remaining = tasks.length;
  let finished = false;

  // No task will ever call back, so nothing would bring remaining to zero.
  if (remaining === 0) return cb(null, result);

  for (let [idx, task] of tasks.entries()) {
    task((err, data) => {
      // A second error, or a result arriving after we already reported.
      if (finished) return;

      if (err) {
        finished = true;
        return cb(err);
      }

      // Index rather than push: original order, whatever order they finish in.
      result[idx] = data;
      remaining -= 1;

      // Whoever drives the counter to zero is by definition the last to finish.
      if (remaining === 0) {
        finished = true;
        cb(null, result);
      }
    });
  }
}

/**
 * Wrap a function so it can only ever be called once. Later calls do nothing
 * and return undefined. Used to make a callback safe against double-calling.
 */
export function once(fn) {
  let count = 0;

  return (...args) => {
    if (count === 0) {
      count++;
      return fn(...args);
    }

    return undefined;
  };
}

/**
 * Wrap `fn` so it NEVER runs synchronously, even though it could.
 * The returned function schedules fn on the microtask queue.
 *
 * This is the fix for Zalgo: consistent asynchrony.
 */
export function deferred(fn) {
  return (...args) =>
    Promise.resolve().then(() => {
      fn(...args);
    });
}
