/**
 * Part 06, Lesson 02 — Error Types
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
 * new ValidationError('email', 'must be an email')
 *   .message -> 'must be an email'
 *   .field   -> 'email'
 *   .name    -> 'ValidationError'      (set it — it does not happen for free)
 *   instanceof Error -> true
 */
// TODO: export class ValidationError extends Error { ... }

/**
 * new NotFoundError('user', 42)
 *   .message  -> 'user 42 not found'
 *   .resource -> 'user'
 *   .id       -> 42
 *   .name     -> 'NotFoundError'
 *   .code     -> 'ERR_NOT_FOUND'       (realm-safe matching)
 */
// TODO: export class NotFoundError extends Error { ... }

/**
 * new HttpError(404, 'Not Found')
 *   .status         -> 404
 *   .message        -> 'HTTP 404: Not Found'
 *   .name           -> 'HttpError'
 *   .isClientError  -> true for 4xx, false otherwise (a getter)
 *   .isServerError  -> true for 5xx
 */
// TODO: export class HttpError extends Error { ... }

/**
 * Turn an error into a plain JSON-safe object:
 *   { name, message, ...any own enumerable custom fields }
 *
 * `stack` is excluded. Remember that message and name are NOT own enumerable
 * properties, so a spread alone loses them.
 *
 * serialiseError(new ValidationError('email', 'bad'))
 *   -> { name: 'ValidationError', message: 'bad', field: 'email' }
 */
export function serialiseError(err) {
  // TODO
  throw new Error('serialiseError: not implemented');
}

/**
 * Which built-in error type is this? Return one of:
 *   'TypeError' | 'RangeError' | 'SyntaxError' | 'ReferenceError' | 'Error'
 *
 * A custom subclass of Error that isn't one of those reports 'Error'.
 */
export function classify(err) {
  // TODO
  throw new Error('classify: not implemented');
}

/**
 * Run every function. If they all succeed, return their results as an array.
 * If any throw, throw an AggregateError whose `errors` holds the failures in
 * order — after running ALL of them, not stopping at the first.
 */
export function collectErrors(fns) {
  // TODO
  throw new Error('collectErrors: not implemented');
}
