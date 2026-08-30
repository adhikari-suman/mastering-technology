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
export class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

/**
 * new NotFoundError('user', 42)
 *   .message  -> 'user 42 not found'
 *   .resource -> 'user'
 *   .id       -> 42
 *   .name     -> 'NotFoundError'
 *   .code     -> 'ERR_NOT_FOUND'       (realm-safe matching)
 */
export class NotFoundError extends Error {
  constructor(field, id) {
    super(`${field} ${id} not found`);
    this.name = "NotFoundError";
    this.resource = field;
    this.id = id;
    this.code = "ERR_NOT_FOUND";
  }
}

/**
 * new HttpError(404, 'Not Found')
 *   .status         -> 404
 *   .message        -> 'HTTP 404: Not Found'
 *   .name           -> 'HttpError'
 *   .isClientError  -> true for 4xx, false otherwise (a getter)
 *   .isServerError  -> true for 5xx
 */
export class HttpError extends Error {
  constructor(status, message) {
    super(`HTTP ${status}: ${message}`);
    this.name = "HttpError";
    this.status = status;
  }

  get isClientError() {
    return this.status >= 400 && this.status <= 499;
  }

  get isServerError() {
    return this.status >= 500 && this.status <= 599;
  }
}

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
  let obj = { ...err, name: err.name, message: err.message };

  return obj;
}

/**
 * Which built-in error type is this? Return one of:
 *   'TypeError' | 'RangeError' | 'SyntaxError' | 'ReferenceError' | 'Error'
 *
 * A custom subclass of Error that isn't one of those reports 'Error'.
 */
export function classify(err) {
  if (err instanceof TypeError) {
    return "TypeError";
  } else if (err instanceof RangeError) {
    return "RangeError";
  } else if (err instanceof SyntaxError) {
    return "SyntaxError";
  } else if (err instanceof ReferenceError) {
    return "ReferenceError";
  }

  return "Error";
}

/**
 * Run every function. If they all succeed, return their results as an array.
 * If any throw, throw an AggregateError whose `errors` holds the failures in
 * order — after running ALL of them, not stopping at the first.
 */
export function collectErrors(fns) {
  let errors = [];
  let results = [];

  for (let fn of fns) {
    try {
      const result = fn();
      results.push(result);
    } catch (err) {
      errors.push(err);
    }
  }

  if (errors.length === 0) {
    return results;
  } else throw new AggregateError(errors);
}
