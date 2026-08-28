/**
 * Part 08, Lesson 05 — Compiler performance
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`, no `as`.
 */

/**
 * A miniature type-expression language, enough to model where the cost comes
 * from:
 *
 *   leaf         a concrete type. One instantiation.
 *   union        n members. Costs the sum of its members.
 *   conditional  distributes over `over`, running `body` once per member.
 *   mapped       runs `body` once per key.
 *   template     a cross product: the product of every part's member count.
 *   alias        a named reference to another node. See `memoised`.
 */
export type TypeNode =
  | { readonly kind: 'leaf' }
  | { readonly kind: 'union'; readonly members: readonly TypeNode[] }
  | { readonly kind: 'conditional'; readonly over: TypeNode; readonly body: TypeNode }
  | { readonly kind: 'mapped'; readonly keys: number; readonly body: TypeNode }
  | { readonly kind: 'template'; readonly parts: readonly TypeNode[] }
  | { readonly kind: 'alias'; readonly name: string; readonly body: TypeNode };

/**
 * How many members a node denotes — what a conditional would distribute over.
 *
 *   leaf         1
 *   union        the sum of its members' widths
 *   conditional  the width of its body
 *   mapped       1  (a mapped type is one object type)
 *   template     the product of its parts' widths
 *   alias        the width of its body
 */
export function width(node: TypeNode): number {
  throw new Error('width: not implemented');
}

/**
 * The instantiation count for a node.
 *
 *   leaf         1
 *   union        the sum of its members' costs
 *   conditional  cost(over) + width(over) * cost(body)
 *   mapped       keys * cost(body)
 *   template     the product of its parts' WIDTHS, plus the sum of their costs
 *   alias        the cost of its body
 *
 * The multiplication is the point: nesting multiplies, it does not add.
 */
export function instantiations(node: TypeNode): number {
  throw new Error('instantiations: not implemented');
}

/** What `tsc --extendedDiagnostics` reports, as far as this Lesson cares. */
export type Diagnostics = {
  readonly files: number;
  readonly types: number;
  readonly instantiations: number;
};

/** How worried to be. */
export type Verdict = 'comfortable' | 'slow' | 'pathological';

/**
 * Judge a diagnostics report by its instantiation count:
 *
 *   under 500_000        'comfortable'
 *   under 5_000_000      'slow'
 *   otherwise            'pathological'
 *
 * The boundaries are inclusive at the bottom: exactly 500_000 is 'slow'.
 */
export function verdict(diagnostics: Diagnostics): Verdict {
  throw new Error('verdict: not implemented');
}

/** One expensive sub-expression. */
export type Hotspot = {
  readonly name: string;
  readonly cost: number;
};

/**
 * Every named alias in a tree, with its cost, most expensive first. Ties keep
 * the order they were found in, walking parents before children.
 *
 * A tree with no aliases has no hotspots — you cannot point at what has no name,
 * which is itself the argument for naming things.
 */
export function hotspots(node: TypeNode): Hotspot[] {
  throw new Error('hotspots: not implemented');
}

/**
 * What naming a repeated sub-expression saves.
 *
 * The checker memoises by type identity, so an alias appearing `uses` times is
 * computed ONCE, while the same expression written out `uses` times is computed
 * every time.
 *
 * Return the instantiations saved: `(uses - 1) * cost`, and never below zero.
 *
 *   memoised(node, 1)  ->  0    (naming something used once saves nothing)
 *   memoised(node, 0)  ->  0
 */
export function memoised(node: TypeNode, uses: number): number {
  throw new Error('memoised: not implemented');
}
