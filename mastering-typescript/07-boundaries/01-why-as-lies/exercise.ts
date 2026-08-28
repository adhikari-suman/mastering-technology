/**
 * Part 07, Lesson 01 — Why `as` lies
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: `unsafeParseUser` is the ONE place an assertion is allowed, and it is
 * there to be proved wrong by a test. Everywhere else: no `as`, no `any`, no
 * `!`.
 */

/** A user, as the rest of the program expects it. */
export type User = {
  id: number;
  email: string;
  displayName?: string;
};

/** Thrown when input does not match. `field` names what failed. */
export class ParseError extends Error {
  override readonly name = 'ParseError';
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.field = field;
  }
}

/**
 * The honest parse. Checks every field and returns a NEW object holding only
 * the known ones — extra properties on the input are dropped.
 *
 * Messages, exactly:
 *   not an object            field ''       'expected an object'
 *   id missing or not number field 'id'     'id must be a number'
 *   email missing/not string field 'email'  'email must be a string'
 *   displayName present but not a string
 *                            field 'displayName'  'displayName must be a string'
 *
 * `displayName` is optional: absent or `undefined` is fine, and the result then
 * has no `displayName` key at all (`exactOptionalPropertyTypes` is on).
 */
export function parseUser(value: unknown): User {
  throw new Error('parseUser: not implemented');
}

/**
 * The version everybody writes. One assertion, no checks. Return the input,
 * claimed to be a `User`.
 *
 * It exists so that a test can hand it nonsense and watch it hand back a `User`
 * that is not one. Keep it exactly this dishonest.
 */
export function unsafeParseUser(value: unknown): User {
  throw new Error('unsafeParseUser: not implemented');
}

/** The predicate spelling. No throwing; just true or false. */
export function isUser(value: unknown): value is User {
  throw new Error('isUser: not implemented');
}

/**
 * The assertion-function spelling. Throws the same ParseErrors as `parseUser`,
 * and narrows in place rather than returning a copy.
 */
export function assertUser(value: unknown): asserts value is User {
  throw new Error('assertUser: not implemented');
}
