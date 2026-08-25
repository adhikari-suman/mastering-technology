/**
 * Run each task (a function returning a promise) ONE AT A TIME, in order.
 * Resolve with the results in order.
 *
 * sequential([]) -> []
 */
export async function sequential(tasks) {
  let result = [];
  for (let task of tasks) {
    try {
      result.push(await task());
    } catch (err) {}
  }

  return result;
}

/**
 * Start every task at once, resolve with results in the ORIGINAL order.
 */
export async function concurrent(tasks) {
  return await Promise.all(tasks.map((task) => task()));
}

/**
 * Run `tasks` sequentially and resolve with { results, ms } where ms is the
 * elapsed milliseconds. Used to prove sequential is slower.
 */
export async function timedSequential(tasks) {
  let startTime = Date.now();
  let results = await sequential(tasks);
  let stopTime = Date.now();

  return { results, ms: stopTime - startTime };
}

/**
 * The same, run concurrently.
 */
export async function timedConcurrent(tasks) {
  let startTime = Date.now();
  let results = await concurrent(tasks);
  let stopTime = Date.now();

  return { results, ms: stopTime - startTime };
}

/**
 * Async map, strictly one item at a time, results in order.
 * fn is called as fn(item, index).
 */
export async function mapSeries(items, fn) {
  let result = new Array(items.length);

  for (let [idx, item] of items.entries()) {
    result[idx] = await fn(item, idx);
  }

  return result;
}

/**
 * Async map, all at once, results in order.
 */
export async function mapParallel(items, fn) {
  return Promise.all(items.map((item, idx) => fn(item, idx)));
}

/**
 * Call `fn` and never throw. Resolve with a tuple:
 *   [null, value]  on success
 *   [error, null]  on failure — from a rejection OR a synchronous throw
 *
 * await safeCall(async () => 1)              -> [null, 1]
 * await safeCall(() => { throw new Error() }) -> [Error, null]
 */
export async function safeCall(fn) {
  try {
    const value = await fn();

    return [null, value];
  } catch (err) {
    return [err, null];
  }
}

/**
 * Deliberately demonstrate the trap: use items.forEach with an async callback
 * that pushes into an array, and return that array IMMEDIATELY without
 * awaiting anything.
 *
 * The array comes back EMPTY, because forEach ignores the promises the
 * callback returns. The test asserts it is empty — this is the bug, made
 * visible on purpose.
 */
export function forEachIsBroken(items, fn) {
  let result = [];

  items.forEach(async (item, idx) => {
    await fn(item, idx);
  });

  return result;
}
