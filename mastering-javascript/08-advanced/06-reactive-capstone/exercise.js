/**
 * Part 08, Lesson 06 — Capstone: A Reactive Store
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 *
 * Suggested internals:
 *   const targetMap = new WeakMap();   // target -> Map<key, Set<effect>>
 *   let activeEffect = null;           // who is running right now
 *   const effectStack = [];            // for nested effects
 *
 * For `computed`, the trick is that a dependency change must NOT recompute
 * immediately — it should only mark the value stale, so the work happens on
 * the next read. Give a runner an optional `scheduler` that runs instead of
 * the runner itself, and have `computed` use one that just sets a dirty flag.
 * A computed also needs its own subscriber set, so effects that read `.value`
 * re-run when it goes stale.
 */

/**
 * Wrap `obj` in a proxy that tracks reads and triggers on writes.
 *
 *  - get: record that the active effect depends on this key, then return the
 *    value via Reflect with the receiver
 *  - set: write, and if the value actually CHANGED (Object.is), re-run every
 *    effect that read this key
 *  - deleteProperty: same triggering
 *
 * Reading with no active effect must track nothing.
 */
export function reactive(obj) {
  // TODO
  throw new Error('reactive: not implemented');
}

/**
 * Run `fn` immediately, tracking every reactive property it reads, and re-run
 * it whenever one of those changes.
 *
 * Returns a `runner` function that re-runs the effect manually and returns
 * fn's value. The runner is also what `stop` takes.
 *
 * Requirements:
 *  - dependencies are re-collected on EVERY run, so a branch that stops
 *    reading a property stops depending on it
 *  - nested effects must not clobber the outer one
 *  - if fn throws, the active effect must still be restored
 */
export function effect(fn) {
  // TODO
  throw new Error('effect: not implemented');
}

/**
 * A derived value. `computed(fn)` returns an object with a `.value` getter
 * that recomputes when anything it depends on has changed since the last read.
 *
 * const double = computed(() => state.count * 2);
 * double.value   -> recomputed only when state.count changed
 */
export function computed(fn) {
  // TODO
  throw new Error('computed: not implemented');
}

/**
 * Stop an effect: remove it from every dependency set so it never re-runs.
 * Takes the runner returned by effect().
 */
export function stop(runner) {
  // TODO
  throw new Error('stop: not implemented');
}

/**
 * Run `fn`, deferring effect re-runs until it finishes, so that several writes
 * cause each affected effect to run at most ONCE.
 *
 * Returns fn's value. Must still flush if fn throws.
 */
export function batch(fn) {
  // TODO
  throw new Error('batch: not implemented');
}

/**
 * How many effects currently depend on obj[key]. 0 if none.
 * For inspecting the dependency graph in tests.
 */
export function dependencyCount(obj, key) {
  // TODO
  throw new Error('dependencyCount: not implemented');
}
