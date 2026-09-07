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
import legacy from "./fixtures/legacy.cjs";

export function loadLegacy() {
  return legacy;
}

/**
 * Load './fixtures/legacy-single.cjs', whose module.exports IS a function,
 * and return that function.
 *
 * loadLegacyDefault()(5) -> 10
 */

import loadLegacyDefaultFn from "./fixtures/legacy-single.cjs";

export function loadLegacyDefault() {
  return loadLegacyDefaultFn;
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
  const l1 = loadLegacy();
  l1.increment();
  const l2 = loadLegacy();

  return { sameObject: l1 === l2, countFromSecond: l2.getCount() };
}

/**
 * The directory containing THIS module — the ESM replacement for __dirname.
 * An absolute path with no trailing slash.
 */
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

export function moduleDir() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  return __dirname;
}

/**
 * The absolute path of THIS module — the replacement for __filename.
 * Ends with 'solution.js'.
 */
export function moduleFile() {
  const __filename = fileURLToPath(import.meta.url);

  return __filename;
}

/**
 * Resolve a relative path against this module's directory, returning an
 * absolute path.
 *
 * resolveRelative('fixtures/legacy.cjs') -> '/abs/path/to/fixtures/legacy.cjs'
 */
export function resolveRelative(path) {
  const __dirname = moduleDir();

  return `${__dirname}/${path}`;
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
  const MODULE_TYPE = {
    ESM: "esm",
    CJS: "commonjs",
  };

  const PACKAGE_TYPE = {
    MODULE: "module",
    COMMONJS: "commonjs",
  };

  const splits = filename.split(".");
  const extension = splits[splits.length - 1];

  if (extension != "js") {
    if (extension === "mjs") return MODULE_TYPE.ESM;

    return MODULE_TYPE.CJS;
  }

  switch (packageType) {
    case PACKAGE_TYPE.MODULE:
      return MODULE_TYPE.ESM;
    case PACKAGE_TYPE.COMMONJS:
    default:
      return MODULE_TYPE.CJS;
  }
}
