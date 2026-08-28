/**
 * Part 02, Lesson 03 — Type predicates
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `as` in any body. A predicate whose implementation needs an
 * assertion is a predicate that is lying, and the point of this Lesson is to
 * notice the difference.
 *
 * CONVENTION: every stub below is annotated `boolean`, which compiles and
 * narrows nothing. Replacing that annotation with the predicate form is half
 * the exercise; the TYPES light stays red until you do.
 */

/** True when `value` is a string — and narrows it. */
export function isString(value: unknown): boolean {  // TODO: this annotation is wrong on purpose
  throw new Error('isString: not implemented');
}

/** True when `value` is a number. `NaN` is a number; `'1'` is not. */
export function isNumber(value: unknown): boolean {  // TODO: this annotation is wrong on purpose
  throw new Error('isNumber: not implemented');
}

/**
 * Removes `null` and `undefined` while keeping whatever `T` was. Written
 * generically so it composes with `filter`.
 */
export function isNonNull<T>(value: T | null | undefined): boolean {  // TODO: this annotation is wrong on purpose
  throw new Error('isNonNull: not implemented');
}

/**
 * True when `value` is a non-null, non-array object — something you can index
 * by string. Note the narrowed type: the VALUES stay `unknown`, because
 * nothing here has established what they are.
 */
export function isRecord(value: unknown): boolean {  // TODO: this annotation is wrong on purpose
  throw new Error('isRecord: not implemented');
}

/**
 * True when `value` is a record carrying `key`. The narrowed type must mention
 * `key` specifically, so that reading it afterwards typechecks:
 *
 *   if (hasKey(x, 'id')) x.id;   // unknown, but reachable
 */
export function hasKey<K extends string>(value: unknown, key: K): boolean {  // TODO: this annotation is wrong on purpose
  throw new Error('hasKey: not implemented');
}

/**
 * True when `value` is an array whose every element passes `guard`.
 * An empty array passes.
 */
export function isArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T,
): boolean {  // TODO: this annotation is wrong on purpose
  throw new Error('isArrayOf: not implemented');
}

/**
 * Drop the nullish entries. The return type must be `T[]` with no `null` in it,
 * and the body must not need a cast to get there.
 */
export function compact<T>(values: readonly (T | null | undefined)[]): T[] {
  throw new Error('compact: not implemented');
}
