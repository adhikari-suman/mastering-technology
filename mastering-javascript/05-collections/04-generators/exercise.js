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
  // TODO
  throw new Error('range: not implemented');
}

/**
 * 0, 1, 2, ... forever. Safe because nothing runs until pulled.
 */
export function* naturals() {
  // TODO
  throw new Error('naturals: not implemented');
}

/**
 * A GENERATOR yielding at most the first `n` values of an iterable.
 * Lazy: taking 3 from an infinite source must not hang.
 */
export function* takeFrom(iterable, n) {
  // TODO
  throw new Error('takeFrom: not implemented');
}

/**
 * Lazy map. mapGen must not consume the whole source up front.
 */
export function* mapGen(iterable, fn) {
  // TODO
  throw new Error('mapGen: not implemented');
}

/**
 * Lazy filter.
 */
export function* filterGen(iterable, predicate) {
  // TODO
  throw new Error('filterGen: not implemented');
}

/**
 * Recursively flatten nested arrays, yielding leaves in order.
 * Use yield* for the recursion.
 *
 * [...flattenGen([1, [2, [3]]])] -> [1, 2, 3]
 */
export function* flattenGen(value) {
  // TODO
  throw new Error('flattenGen: not implemented');
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
  // TODO
  throw new Error('collect: not implemented');
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
  // TODO
  throw new Error('runner: not implemented');
}

/**
 * An ASYNC generator yielding successive pages.
 * `fetchPage(cursor)` resolves to { items, next } where `next` is the cursor
 * for the following page, or null when there are no more.
 * Yield each page's `items` array. Start with cursor undefined.
 */
export async function* pages(fetchPage) {
  // TODO
  throw new Error('pages: not implemented');
}
