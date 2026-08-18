/**
 * Part 07, Lesson 02 — CommonJS and Interop
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 *
 * ./fixtures/ holds two .cjs modules. Don't edit them.
 */

/**
 * Load './fixtures/legacy.cjs' and return its module.exports object.
 * Use createRequire from node:module — plain `require` does not exist here.
 *
 * loadLegacy().name -> 'legacy'
 */
export function loadLegacy() {
  // TODO
  throw new Error('loadLegacy: not implemented');
}

/**
 * Load './fixtures/legacy-single.cjs', whose module.exports IS a function,
 * and return that function.
 *
 * loadLegacyDefault()(5) -> 10
 */
export function loadLegacyDefault() {
  // TODO
  throw new Error('loadLegacyDefault: not implemented');
}

/**
 * Call loadLegacy() twice, increment through the first, and return
 *   { sameObject, countFromSecond }
 * where sameObject compares the two module.exports by identity, and
 * countFromSecond reads getCount() from the second.
 *
 * require caches, so both are the same object and the count is shared.
 * Increment exactly once.
 */
export function cjsCopiesValues() {
  // TODO
  throw new Error('cjsCopiesValues: not implemented');
}

/**
 * The directory containing THIS module — the ESM replacement for __dirname.
 * An absolute path with no trailing slash.
 */
export function moduleDir() {
  // TODO: import.meta.url, fileURLToPath, dirname
  throw new Error('moduleDir: not implemented');
}

/**
 * The absolute path of THIS module — the replacement for __filename.
 * Ends with 'solution.js'.
 */
export function moduleFile() {
  // TODO
  throw new Error('moduleFile: not implemented');
}

/**
 * Resolve a relative path against this module's directory, returning an
 * absolute path.
 *
 * resolveRelative('fixtures/legacy.cjs') -> '/abs/path/to/fixtures/legacy.cjs'
 */
export function resolveRelative(path) {
  // TODO
  throw new Error('resolveRelative: not implemented');
}

/**
 * Which module system a filename implies, given a package `type` field.
 *
 * moduleTypeOf('a.mjs')                 -> 'esm'
 * moduleTypeOf('a.cjs')                 -> 'commonjs'
 * moduleTypeOf('a.js', 'module')        -> 'esm'
 * moduleTypeOf('a.js', 'commonjs')      -> 'commonjs'
 * moduleTypeOf('a.js')                  -> 'commonjs'   (the default)
 */
export function moduleTypeOf(filename, packageType) {
  // TODO
  throw new Error('moduleTypeOf: not implemented');
}
