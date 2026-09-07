/**
 * Part 06, Lesson 05 — Validation and Boundaries
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 *
 * A rule is a function (value) => string | null, returning an error message
 * or null when the value is acceptable.
 */

/**
 * Fails on undefined, null and ''. Message: 'is required'.
 */
export function required(value) {
  if (value != null && value !== "") return null;

  return "is required";
}

/**
 * Fails unless typeof value is 'string'. Message: 'must be a string'.
 */
export function isString(value) {
  if (typeof value === "string" || value instanceof String) return null;

  return "must be a string";
}

/**
 * Fails unless it is a number and not NaN. Message: 'must be a number'.
 */
export function isNumber(value) {
  if (
    !Number.isNaN(value) &&
    (typeof value === "number" || value instanceof Number)
  )
    return null;

  return "must be a number";
}

/**
 * A RULE FACTORY: minLength(3) returns a rule failing with
 * 'must be at least 3 characters'.
 */
export function minLength(n) {
  return (value) =>
    value?.length >= n ? null : `must be at least ${n} characters`;
}

/**
 * A rule factory: matches(/@/, 'must contain @') returns a rule using that
 * message.
 */
export function matches(pattern, message) {
  return (value) =>
    typeof value === "string" && pattern.test(value) ? null : message;
}

/**
 * Run a schema — { field: [rule, rule] } — against an input object.
 * Collect EVERY failure, not just the first, and not just the first per field.
 *
 * Success -> { ok: true, value: input }
 * Failure -> { ok: false, errors: [{ field, message }, ...] }
 *
 * Errors are ordered by field (schema order), then by rule order.
 */
export function validate(input, schema) {
  let errors = [];
  for (let field in schema) {
    for (let rule of schema[field]) {
      const message = rule(input[field]);
      if (message !== null) {
        errors.push({ field, message });
      }
    }
  }

  return errors.length === 0
    ? { ok: true, value: input }
    : { ok: false, errors };
}

/**
 * Parse untrusted input into a known-good, NORMALISED user, or report errors.
 *
 * Success -> { ok: true, value: { email, age, tags } } where
 *   email: trimmed and lowercased string
 *   age:   a number, defaulting to 0 when missing or unparseable
 *   tags:  an array, defaulting to []
 *
 * Failure -> { ok: false, errors: [{ field, message }] }
 *   email is required and must contain '@' ('must contain @')
 *
 * The returned object must be a NEW object, not the input.
 */
export function parseUser(input) {
  const copy = structuredClone(input);

  const emailValidator = (email) => {
    const requiredResponse = required(email);

    if (requiredResponse != null) return requiredResponse;

    const emailRegexResponse = matches(/@/, "must contain @")(email);

    if (emailRegexResponse != null) return emailRegexResponse;

    return null;
  };

  const schema = {
    email: [emailValidator],
  };

  const validation = validate(copy, schema);

  if (!validation.ok) {
    return validation;
  }

  const normalise = (input) => ({
    email: input?.email.toLowerCase().trim(),
    age: !Number.isNaN(Number.parseInt(input.age))
      ? Number.parseInt(input?.age)
      : 0,
    tags: Array.isArray(input?.tags) ? input?.tags : [],
  });

  return {
    ok: true,
    value: normalise(validation.value),
  };
}

/**
 * Parse an environment-style object of strings into typed config:
 *   PORT      -> port: number, default 3000
 *   DEBUG     -> debug: boolean, true only for the exact string 'true'
 *   HOST      -> host: string, default 'localhost'
 *
 * A PORT that isn't a valid number is an error:
 *   { ok: false, errors: [{ field: 'PORT', message: 'must be a number' }] }
 */
export function parseConfig(env) {
  const parse = (env) => {
    let PORT = undefined,
      DEBUG = undefined,
      HOST = undefined;

    // 1. PORT
    if (env.PORT == null) {
      PORT = 3000;
    } else if (
      (typeof env.PORT === "string" &&
        !Number.isNaN(Number.parseInt(env.PORT))) ||
      typeof env.PORT === "number"
    ) {
      PORT = Number.parseInt(env.PORT);
    } else {
      PORT = env.PORT;
    }

    // 2. DEBUG
    DEBUG = env.DEBUG != null && env.DEBUG === "true";

    // 3. HOST
    if (env.HOST != null && typeof env.HOST === "string") {
      HOST = env.HOST;
    } else {
      HOST = "localhost";
    }

    return {
      PORT,
      DEBUG,
      HOST,
    };
  };

  const schema = {
    PORT: [isNumber],
  };

  const input = parse(env);

  const validation = validate(input, schema);

  if (!validation.ok) return validation;

  return {
    ok: true,
    value: {
      port: validation.value?.PORT,
      debug: validation.value?.DEBUG,
      host: validation.value?.HOST,
    },
  };
}

/**
 * Build a boundary. Returns a function that:
 *   - runs `parse` on its input
 *   - on failure returns { ok: false, errors }
 *   - on success calls handler(parsedValue) and returns { ok: true, value }
 *
 * The handler must NEVER see raw input — only the parsed value.
 */
export function atBoundary(parse, handler) {
  return (input) => {
    const parsed = parse(input);

    if (parsed.ok) {
      return {
        ok: true,
        value: handler(parsed.value),
      };
    }

    return parsed;
  };
}
