/**
 * Part 07, Lesson 05 — Package Entry Points
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 *
 * You are implementing package resolution against a package.json-shaped
 * object. No filesystem is involved.
 */

/**
 * Resolve `subpath` against a package's exports.
 *
 * `pkg` is a package.json-shaped object. `subpath` is '.' or './something'.
 * `conditions` is an array like ['import', 'node'], most specific first.
 *
 * Rules:
 *  - No `exports` field: fall back to `main` for '.', and treat any other
 *    subpath as the literal relative path (the old, permissive behaviour).
 *  - `exports` as a string is shorthand for { '.': thatString }.
 *  - A matching entry may be a string, or an object of conditions.
 *  - For a conditions object, take the FIRST key that is either in
 *    `conditions` or is 'default'. Objects may nest.
 *  - A wildcard entry like './features/*' matches './features/auth' and
 *    substitutes into the target.
 *  - No match, or nothing resolvable: return null.
 *
 * resolveExport({ exports: { '.': './index.js' } }, '.')  -> './index.js'
 */
export function resolveExport(pkg, subpath, conditions = []) {
  // TODO
  throw new Error('resolveExport: not implemented');
}

/**
 * True if `subpath` resolves to something for a package WITH an exports field.
 * A package with no exports field exposes everything, so always true.
 */
export function isExported(pkg, subpath) {
  // TODO
  throw new Error('isExported: not implemented');
}

/**
 * The public subpaths a package declares, sorted alphabetically.
 * Wildcard entries are listed as written, e.g. './features/*'.
 * No exports field -> [].
 */
export function listPublicSubpaths(pkg) {
  // TODO
  throw new Error('listPublicSubpaths: not implemented');
}

/**
 * Resolve a '#'-prefixed internal specifier against the package `imports`
 * field, with the same condition rules. null if unresolvable.
 *
 * resolveInternal({ imports: { '#config': './src/config.js' } }, '#config')
 *   -> './src/config.js'
 */
export function resolveInternal(pkg, specifier, conditions = []) {
  // TODO
  throw new Error('resolveInternal: not implemented');
}

/**
 * Wildcard matching, used by the resolver.
 *
 * Return the target with '*' replaced by whatever the pattern's '*' matched,
 * or null if the subpath doesn't match.
 *
 * matchWildcard('./features/*', './dist/features/*.js', './features/auth')
 *   -> './dist/features/auth.js'
 * matchWildcard('./features/*', './dist/*.js', './other/auth')  -> null
 */
export function matchWildcard(pattern, target, subpath) {
  // TODO
  throw new Error('matchWildcard: not implemented');
}
