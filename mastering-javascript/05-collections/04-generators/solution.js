/**
 * Part 05, Lesson 04 — Generators
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
 * Lesson 03's range, as a generator. `to` exclusive, step defaults to 1.
 * [...range(0, 3)] -> [0, 1, 2]
 */
export function* range(from, to, step = 1) {
  for (let curr = from; curr < to; curr += step) {
    yield curr;
  }
}

/**
 * 0, 1, 2, ... forever. Safe because nothing runs until pulled.
 */
export function* naturals() {
  let curr = 0;
  while (true) {
    yield curr++;
  }
}

/**
 * A GENERATOR yielding at most the first `n` values of an iterable.
 * Lazy: taking 3 from an infinite source must not hang.
 */
export function* takeFrom(iterable, n) {
  if (n <= 0) return;

  let count = 0;
  for (let item of iterable) {
    yield item;
    if (++count === n) return;
  }
}

/**
 * Lazy map. mapGen must not consume the whole source up front.
 */
export function* mapGen(iterable, fn) {
  for (let item of iterable) {
    yield fn(item);
  }
}

/**
 * Lazy filter.
 */
export function* filterGen(iterable, predicate) {
  for (let item of iterable) {
    if (predicate(item)) {
      yield item;
    }
  }
}

/**
 * Recursively flatten nested arrays, yielding leaves in order.
 * Use yield* for the recursion.
 *
 * [...flattenGen([1, [2, [3]]])] -> [1, 2, 3]
 */
export function* flattenGen(value) {
  if (!Array.isArray(value)) {
    yield value;
    return;
  }

  for (let item of value) {
    yield* flattenGen(item);
  }
}

/**
 * Drive a generator to completion manually, returning
 *   { values, returned }
 * where `values` are the yielded values and `returned` is the generator's
 * return value — the one for...of throws away.
 *
 * collect(function* () { yield 1; return 'done'; }())
 *   -> { values: [1], returned: 'done' }
 */
export function collect(gen) {
  let returned = null;
  const values = [];

  const g = gen;

  let item;

  for (item = g.next(); !item.done; item = g.next()) {
    values.push(item.value);
  }

  returned = item.value;

  return { values, returned };
}

/**
 * Drive a generator that yields PROMISES, feeding each resolved value back in
 * via next(value). Resolve with the generator's return value. A rejection must
 * be thrown INTO the generator so its try/catch can handle it.
 *
 * This is async/await in miniature.
 *
 * await runner(function* () {
 *   const a = yield Promise.resolve(1);
 *   const b = yield Promise.resolve(2);
 *   return a + b;
 * })   -> 3
 */
export function runner(genFn) {
  const gen = genFn();

  return new Promise((resolve, reject) => {
    function step(method, arg) {
      let item;

      try {
        item = gen[method](arg);
      } catch (err) {
        return reject(err);
      }

      if (item.done) return resolve(item.value);

      Promise.resolve(item.value).then(
        (value) => step("next", value),
        (err) => step("throw", err),
      );
    }

    step("next", undefined);
  });
}

/**
 * An ASYNC generator yielding successive pages.
 * `fetchPage(cursor)` resolves to { items, next } where `next` is the cursor
 * for the following page, or null when there are no more.
 * Yield each page's `items` array. Start with cursor undefined.
 */
export async function* pages(fetchPage) {
  let cursor = undefined;
  while (cursor !== null) {
    const page = await fetchPage(cursor);
    yield page.items;
    cursor = page.next;
  }
}
