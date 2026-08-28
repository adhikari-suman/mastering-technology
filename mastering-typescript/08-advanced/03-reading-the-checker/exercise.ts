/**
 * Part 08, Lesson 03 — Reading the checker
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`, no `as`.
 */

/**
 * One diagnostic: a message, and the nested causes underneath it.
 *
 * tsc prints these as an indented tree, two spaces per level:
 *
 *   Type 'A' is not assignable to type 'B'.
 *     Types of property 'x' are incompatible.
 *       Type 'string' is not assignable to type 'number'.
 */
export type Diagnostic = {
  readonly message: string;
  readonly causes: readonly Diagnostic[];
};

/**
 * Parse indented tsc output into a tree.
 *
 *   - two spaces per level of nesting
 *   - blank lines are ignored
 *   - a line indented more than one level past its parent is an error:
 *     throw a SyntaxError naming the line
 *   - the input always has exactly one root; more than one is a SyntaxError
 *
 * An empty input throws a SyntaxError too — there is no empty diagnostic.
 */
export function parseDiagnostic(output: string): Diagnostic {
  throw new Error('parseDiagnostic: not implemented');
}

/**
 * The deepest message — the actual mismatch, once you have followed the chain
 * all the way down. When a level has several causes, follow the FIRST.
 */
export function rootCause(diagnostic: Diagnostic): string {
  throw new Error('rootCause: not implemented');
}

/**
 * The property names mentioned on the way down, in order.
 *
 * A message of the form `Types of property 'x' are incompatible.` contributes
 * `x`. Everything else contributes nothing. Follow the first cause at each
 * level, as `rootCause` does.
 *
 *   -> ['user', 'address', 'postcode']
 */
export function pathTo(diagnostic: Diagnostic): string[] {
  throw new Error('pathTo: not implemented');
}

/**
 * The two lines that usually contain the whole problem: the top message, then
 * the root cause, joined by ' -> '. When there are no causes, just the message.
 */
export function summarise(diagnostic: Diagnostic): string {
  throw new Error('summarise: not implemented');
}

/** The message shapes worth recognising on sight. */
export type Category =
  | 'excess-property'
  | 'exhaustiveness'
  | 'deep-instantiation'
  | 'duplicate-package'
  | 'narrowed-to-never'
  | 'no-inference-candidate'
  | 'unknown';

/**
 * Recognise a message, by looking for these fragments anywhere in it:
 *
 *   'may only specify known properties'      -> 'excess-property'
 *   "is not assignable to type 'never'"      -> 'exhaustiveness'
 *   'excessively deep'                       -> 'deep-instantiation'
 *   'Two different types with this name'     -> 'duplicate-package'
 *   "does not exist on type 'never'"         -> 'narrowed-to-never'
 *   "parameter of type 'never'"              -> 'no-inference-candidate'
 *   anything else                            -> 'unknown'
 *
 * Test the more specific patterns first: a message can match more than one, and
 * the order above is the order to try.
 */
export function classify(message: string): Category {
  throw new Error('classify: not implemented');
}
