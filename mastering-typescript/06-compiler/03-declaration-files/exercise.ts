/**
 * Part 06, Lesson 03 — Declaration files
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`. Everything declared here must be fully erasable — check by
 * running the tests, since Node will simply refuse anything that is not.
 */
import { register, lookup } from './fixtures/plugin-host.ts';
import type { PluginRegistry } from './fixtures/plugin-host.ts';

/**
 * TODO: a `declare global` block adding
 *
 *   var BUILD_ID: string;              — injected by a build step, so `var`
 *   interface AppContext { userId: string }
 *
 * Remember which declaration keyword actually reaches `globalThis`.
 */

/**
 * TODO: a SECOND `declare global` block adding `sessionId: string` to
 * `AppContext`. Two interface blocks with one name merge; that is the whole
 * extension mechanism, and proving it to yourself is the exercise.
 */

/**
 * TODO: augment the fixture's `PluginRegistry` with two more entries:
 *
 *   auth:    { token: string }
 *   metrics: { count: number }
 *
 * The fixture already declares `core`. Since this file has imports, a
 * `declare module` here is an AUGMENTATION — which is what you want, and which
 * requires the module specifier to resolve exactly as it does above.
 */

/** Every plugin name the registry knows about, after your augmentation. */
export type PluginName = unknown; // TODO — derive it from PluginRegistry

/**
 * A typed wrapper over the fixture's untyped `register`. The name must be a
 * known plugin, and the value must match THAT plugin's declared shape — so
 * `registerTyped('auth', { count: 1 })` is an error.
 *
 * The signature below is deliberately too loose. Make it generic over
 * `PluginName` and index `PluginRegistry` with it.
 */
export function registerTyped(name: string, value: unknown): void {
  // TODO: fix the signature first
  throw new Error('registerTyped: not implemented');
}

/**
 * The typed read. Returns `undefined` when nothing is registered under `name`,
 * and the plugin's own type when something is. Same signature work as above.
 */
export function lookupTyped(name: string): unknown {
  // TODO: fix the signature first
  throw new Error('lookupTyped: not implemented');
}

/** Read the global BUILD_ID, or 'dev' when it has not been set. */
export function buildId(): string {
  throw new Error('buildId: not implemented');
}

/** Set the global BUILD_ID. */
export function setBuildId(id: string): void {
  throw new Error('setBuildId: not implemented');
}

/**
 * Build an AppContext. Both merged members must be present.
 *
 * The return annotation is `unknown` only because `AppContext` does not exist
 * until you declare it above — this file has to compile untouched. Once the
 * global is there, name it here.
 */
export function makeContext(userId: string, sessionId: string): unknown {
  // TODO: fix the return annotation once AppContext exists
  throw new Error('makeContext: not implemented');
}
