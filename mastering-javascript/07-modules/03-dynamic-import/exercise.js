/**
 * Part 07, Lesson 03 — Dynamic import()
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 *
 * ./fixtures/ holds modules to load. Don't edit them.
 * IMPORTANT: do not statically import anything from ./fixtures/ — the whole
 * point is that they load on demand.
 */

/**
 * Dynamically import './fixtures/heavy.js' and return its DEFAULT export
 * (a function).
 *
 * (await loadHeavy())(2) -> 200
 */
export async function loadHeavy() {
  // TODO
  throw new Error('loadHeavy: not implemented');
}

/**
 * How many times './fixtures/heavy.js' has been evaluated.
 * The fixture increments globalThis.__heavyLoadCount when its body runs.
 * Return 0 if it has never been loaded.
 */
export function heavyLoadCount() {
  // TODO
  throw new Error('heavyLoadCount: not implemented');
}

/**
 * Load './fixtures/<locale>.js' with a COMPUTED specifier and return its
 * default export.
 *
 * (await loadLocale('fr')).greeting -> 'Bonjour'
 */
export async function loadLocale(locale) {
  // TODO
  throw new Error('loadLocale: not implemented');
}

/**
 * Import a specifier, resolving to null instead of rejecting when it fails —
 * whether the module is missing OR its body throws.
 */
export async function tryImport(specifier) {
  // TODO
  throw new Error('tryImport: not implemented');
}

/**
 * Import several specifiers in parallel, resolving to an array of namespace
 * objects in the SAME order as the input.
 */
export async function importAll(specifiers) {
  // TODO
  throw new Error('importAll: not implemented');
}

/**
 * Return a function that, when first called, imports `specifier` and resolves
 * to its `name` export — then reuses that on every later call WITHOUT starting
 * a second import.
 *
 * const getWork = lazy('./fixtures/heavy.js', 'default');
 * (await getWork())(1) -> 100
 */
export function lazy(specifier, name) {
  // TODO: cache the promise, not the resolved value
  throw new Error('lazy: not implemented');
}
