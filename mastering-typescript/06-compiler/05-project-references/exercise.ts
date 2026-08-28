/**
 * Part 06, Lesson 05 — Project references
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`.
 */

/** One project: its name, and the names of the projects it references. */
export type Project = {
  readonly name: string;
  readonly references: readonly string[];
};

/** A set of projects, keyed by name — the shape `tsc --build` works from. */
export type Graph = readonly Project[];

/** Thrown when the reference graph has a cycle. */
export class ReferenceCycleError extends Error {
  override readonly name = 'ReferenceCycleError';
  readonly cycle: readonly string[];

  constructor(cycle: readonly string[]) {
    super(`reference cycle: ${cycle.join(' -> ')}`);
    this.cycle = cycle;
  }
}

/** Thrown when a project references something that isn't in the graph. */
export class UnknownReferenceError extends Error {
  override readonly name = 'UnknownReferenceError';

  constructor(from: string, to: string) {
    super(`${from} references unknown project ${to}`);
  }
}

/**
 * The order `tsc --build` would build these in: every project after everything
 * it references.
 *
 *   buildOrder([{ name: 'app', references: ['core'] }, { name: 'core', references: [] }])
 *     -> ['core', 'app']
 *
 * Rules:
 *   - a project depended on twice appears once
 *   - independent projects keep their order of appearance in the input, so the
 *     result is deterministic
 *   - a cycle throws ReferenceCycleError, with `cycle` naming the loop starting
 *     and ending at the same project: ['a', 'b', 'a']
 *   - an unknown reference throws UnknownReferenceError
 */
export function buildOrder(graph: Graph): string[] {
  throw new Error('buildOrder: not implemented');
}

/**
 * Everything `name` depends on, transitively, in build order — not including
 * `name` itself.
 *
 *   dependenciesOf(graph, 'app')  ->  ['core', 'ui']
 *
 * An unknown project name throws UnknownReferenceError with itself as both ends.
 */
export function dependenciesOf(graph: Graph, name: string): string[] {
  throw new Error('dependenciesOf: not implemented');
}

/**
 * The reverse: everything that must rebuild when `name` changes, in build
 * order, not including `name` itself.
 *
 *   affectedBy(graph, 'core')  ->  ['ui', 'app']
 */
export function affectedBy(graph: Graph, name: string): string[] {
  throw new Error('affectedBy: not implemented');
}
