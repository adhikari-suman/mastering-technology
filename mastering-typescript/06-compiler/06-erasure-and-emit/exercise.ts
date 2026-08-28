/**
 * Part 06, Lesson 06 — Erasure and emit
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`. And note that you cannot demonstrate the non-erasable
 * constructs by writing them — this file would stop compiling AND stop
 * loading. Modelling them is the closest you can get, which is the point.
 */

/** Every construct this Lesson classifies. */
export type Construct =
  | 'type-annotation' | 'interface' | 'type-alias' | 'generic-parameter'
  | 'as-assertion' | 'satisfies' | 'implements-clause' | 'abstract-modifier'
  | 'declare-modifier' | 'override-modifier' | 'accessibility-modifier'
  | 'import-type' | 'private-field' | 'static-block' | 'accessor'
  | 'enum' | 'namespace-with-body' | 'parameter-property' | 'legacy-decorator';

/**
 * The constructs that vanish, in the order they appear in `Construct` above.
 * Fifteen of them.
 */
export const ERASABLE = []; // TODO

/**
 * The four that emit runtime code, in the order they appear in `Construct`:
 * enum, namespace-with-body, parameter-property, legacy-decorator.
 */
export const EMITS_CODE = []; // TODO

/** True when the construct leaves nothing behind after type stripping. */
export function isErasable(construct: Construct): boolean {
  throw new Error('isErasable: not implemented');
}

/**
 * Report on a list of constructs.
 *
 *   { ok: true }                               when all are erasable
 *   { ok: false, offenders: [...] }            otherwise, in input order,
 *                                              deduplicated
 *
 *   checkErasable(['interface', 'enum', 'enum'])
 *     -> { ok: false, offenders: ['enum'] }
 */
export type ErasureReport =
  | { ok: true }
  | { ok: false; offenders: Construct[] };

export function checkErasable(constructs: readonly Construct[]): ErasureReport {
  throw new Error('checkErasable: not implemented');
}

/**
 * A miniature type stripper for one line: remove `: Type` annotations from a
 * parameter list and the return type, replacing each with the SAME NUMBER OF
 * SPACES, so every character after it keeps its column.
 *
 *   stripAnnotations('function f(a: number, b: string): void {')
 *     ->             'function f(a        , b        )      {'
 *
 * One rule covers both the parameters and the return type: an annotation runs
 * from a `:` up to the next `,`, `)` or `{` that is at bracket depth zero —
 * counting `<>`, `()`, `[]` and `{}` opened after the `:` — or to the end of
 * the line. Trailing spaces before the terminator are left alone, so
 * `): void {` keeps the space before the brace.
 *
 * Nothing else on the line is touched, and a line with no `:` comes back
 * unchanged.
 *
 * Preserving width is the same choice Node's stripper makes, and question 2 in
 * the README asks you why.
 */
export function stripAnnotations(line: string): string {
  throw new Error('stripAnnotations: not implemented');
}
