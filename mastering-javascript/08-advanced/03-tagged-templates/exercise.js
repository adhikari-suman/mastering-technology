/**
 * Part 08, Lesson 03 — Tagged Templates
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 *
 * Every tag receives (strings, ...values), where strings.length is always
 * values.length + 1.
 */

/**
 * Reproduce exactly what an untagged template literal would have produced.
 *
 * identity`a${1}b` -> 'a1b'
 */
export function identity(strings, ...values) {
  // TODO
  throw new Error('identity: not implemented');
}

/**
 * Uppercase the interpolated VALUES only; leave the literal text alone.
 *
 * upper`hello ${'world'}` -> 'hello WORLD'
 */
export function upper(strings, ...values) {
  // TODO
  throw new Error('upper: not implemented');
}

/**
 * HTML-escape the interpolated values, never the literal text.
 * Escape & < > " ' as &amp; &lt; &gt; &quot; &#39; — ampersand first.
 *
 * escapeHtml`<p>${'<script>'}</p>` -> '<p>&lt;script&gt;</p>'
 */
export function escapeHtml(strings, ...values) {
  // TODO
  throw new Error('escapeHtml: not implemented');
}

/**
 * Build a parameterised query instead of splicing values in.
 * Return { text, values } where text uses $1, $2, ... placeholders.
 *
 * sql`SELECT * FROM t WHERE id = ${5}`
 *   -> { text: 'SELECT * FROM t WHERE id = $1', values: [5] }
 */
export function sql(strings, ...values) {
  // TODO
  throw new Error('sql: not implemented');
}

/**
 * Collapse all runs of whitespace (including newlines) into single spaces, and
 * trim the ends. Applied to the FINAL assembled string.
 */
export function oneLine(strings, ...values) {
  // TODO
  throw new Error('oneLine: not implemented');
}

/**
 * Reimplement String.raw: use strings.raw so escapes stay uninterpreted.
 *
 * raw`a\nb` -> 'a\\nb'   (four characters: a, backslash, n, b)
 */
export function raw(strings, ...values) {
  // TODO
  throw new Error('raw: not implemented');
}

/**
 * Expose the raw call shape, for inspection:
 *   { strings: [...], values: [...], rawStrings: [...] }
 *
 * `strings` must be a plain array copy, not the frozen original.
 */
export function partsOf(strings, ...values) {
  // TODO
  throw new Error('partsOf: not implemented');
}
