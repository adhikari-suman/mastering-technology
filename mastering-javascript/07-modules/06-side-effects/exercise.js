/**
 * Part 07, Lesson 06 — Side Effects and Tree Shaking
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 *
 * ./fixtures/ holds pure and impure modules. Don't edit them, and do NOT
 * import them statically — every load must be dynamic, so the tests can
 * observe when evaluation happens.
 */

/**
 * Dynamically import './fixtures/pure.js' and return its `add` function.
 * Loading it must have no observable effect.
 */
export async function loadPure() {
  // TODO
  throw new Error('loadPure: not implemented');
}

/**
 * Dynamically import './fixtures/impure.js' and return its `value`.
 * Loading it appends to globalThis.__sideEffectLog — that IS the side effect.
 */
export async function loadImpure() {
  // TODO
  throw new Error('loadImpure: not implemented');
}

/**
 * The current contents of globalThis.__sideEffectLog, or [] if nothing has
 * been recorded yet.
 */
export function sideEffectLog() {
  // TODO
  throw new Error('sideEffectLog: not implemented');
}

/**
 * Dynamically import './fixtures/order-b.js' (which imports order-a.js) and
 * return globalThis.__orderLog.
 *
 * Dependencies evaluate first, so the answer is ['a', 'b'].
 */
export async function evaluationOrder() {
  // TODO
  throw new Error('evaluationOrder: not implemented');
}

/**
 * Call fn(...args) and report whether it was observably pure — meaning it
 * added no new own enumerable properties to globalThis.
 *
 * Return { pure, result }.
 *
 * isPure((a, b) => a + b, [1, 2])                    -> { pure: true, result: 3 }
 * isPure(() => { globalThis.__x = 1; return 1; }, []) -> { pure: false, result: 1 }
 *
 * Clean up any property you detect, so the check doesn't leak.
 */
export function isPure(fn, args) {
  // TODO: snapshot globalThis keys before and after
  throw new Error('isPure: not implemented');
}

/**
 * Can a bundler drop this module when nothing imports its bindings?
 *
 * `module` is { hasTopLevelSideEffects, isImportedForEffectOnly, exports }.
 * Droppable only when it has no top-level side effects, is not imported purely
 * for effect, and actually has exports.
 */
export function shouldShake(module) {
  // TODO
  throw new Error('shouldShake: not implemented');
}

/**
 * Interpret a package.json `sideEffects` field for one file path.
 * Return true if the file must be KEPT (has side effects).
 *
 *  - field absent          -> true  (assume the worst)
 *  - false                 -> false (nothing has side effects)
 *  - true                  -> true
 *  - an array of patterns  -> true only if the file matches one.
 *    Support a leading '*' wildcard, e.g. '*.css' matches 'src/a.css'.
 */
export function parseSideEffects(pkg, file) {
  // TODO
  throw new Error('parseSideEffects: not implemented');
}
