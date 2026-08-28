/**
 * Part 08, Lesson 04 — The escape hatches
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`, no `as`. Auditing the hatches while using them would be a
 * poor advertisement.
 */

/** The five ways to overrule the checker. */
export type Hatch = 'ts-expect-error' | 'non-null' | 'as' | 'ts-ignore' | 'any';

/**
 * Ranked weakest to strongest — that is, in the order you should prefer them.
 * Index 0 is the one to reach for first.
 */
export const SEVERITY = []; // TODO

/**
 * Only one hatch reports itself when it is no longer needed. Which one, and
 * why, is the heart of this Lesson.
 */
export function isSelfRepairing(hatch: Hatch): boolean {
  throw new Error('isSelfRepairing: not implemented');
}

/** One use of a hatch, found in source text. */
export type Finding = {
  readonly hatch: Hatch;
  readonly line: number;
  readonly commented: boolean;
};

/**
 * Scan source text for hatches, reporting each with its 1-based line number.
 *
 * What counts, per line, in this order — at most ONE finding per line, the
 * first that matches:
 *
 *   '@ts-expect-error'  ->  'ts-expect-error'
 *   '@ts-ignore'        ->  'ts-ignore'
 *   ': any' or '<any>' or 'as any'  ->  'any'
 *   ' as '              ->  'as'
 *   '!.' or '!)' or '!;' or '![' ->  'non-null'
 *
 * `commented` is true when the line contains a `//` comment carrying at least
 * one non-space character after it. For the two directive forms, the directive
 * itself does not count — `// @ts-expect-error` alone is uncommented, while
 * `// @ts-expect-error upstream bug #123` is commented.
 *
 * Findings come back in line order.
 */
export function findHatches(source: string): Finding[] {
  throw new Error('findHatches: not implemented');
}

/** What a scan adds up to. */
export type Audit = {
  readonly total: number;
  readonly byHatch: Record<Hatch, number>;
  readonly uncommented: readonly Finding[];
  /** The strongest hatch present, or undefined when there are none. */
  readonly worst: Hatch | undefined;
};

/**
 * Summarise a scan. `byHatch` carries an entry for every hatch, including the
 * zeroes, so a caller can render a table without checking for absence.
 */
export function audit(findings: readonly Finding[]): Audit {
  throw new Error('audit: not implemented');
}

/** The situations this Lesson has an opinion about. */
export type Situation =
  | 'known-compiler-bug'
  | 'asserting-a-compile-error-in-a-test'
  | 'value-just-validated'
  | 'accumulator-being-built'
  | 'untyped-dynamic-boundary';

/**
 * The weakest hatch that does the job:
 *
 *   known-compiler-bug                  -> 'ts-expect-error'
 *   asserting-a-compile-error-in-a-test -> 'ts-expect-error'
 *   value-just-validated                -> 'as'
 *   accumulator-being-built             -> 'as'
 *   untyped-dynamic-boundary            -> 'any'
 *
 * An unknown situation throws a TypeError.
 */
export function preferred(situation: Situation): Hatch {
  throw new Error('preferred: not implemented');
}
