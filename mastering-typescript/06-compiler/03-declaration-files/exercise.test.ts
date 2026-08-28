import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import {
  registerTyped, lookupTyped, buildId, setBuildId, makeContext,
} from './solution.ts';
import type { PluginName } from './solution.ts';
import type { PluginRegistry } from './fixtures/plugin-host.ts';

/* ------------------------------------------------------------------ types */

// The augmentation reached the fixture's interface.
type _Names = Expect<Equal<PluginName, 'core' | 'auth' | 'metrics'>>;
type _Auth = Expect<Equal<PluginRegistry['auth'], { token: string }>>;
type _Metrics = Expect<Equal<PluginRegistry['metrics'], { count: number }>>;
type _Core = Expect<Equal<PluginRegistry['core'], { version: string }>>;

// Two `declare global` blocks merged into one interface.
type _Context = Expect<Equal<AppContext, { userId: string; sessionId: string }>>;

function _typeOnly() {
  // The global `var` is reachable both ways, which is what `var` buys.
  const a: string = BUILD_ID;
  const b: string = globalThis.BUILD_ID;

  // @ts-expect-error - 'nope' is not a registered plugin name
  registerTyped('nope', {});

  // @ts-expect-error - the value must match the plugin's declared shape
  registerTyped('auth', { count: 1 });

  const auth = lookupTyped('auth');
  type _Auth = Expect<Equal<typeof auth, { token: string } | undefined>>;

  // @ts-expect-error - AppContext needs both merged members
  const bad: AppContext = { userId: 'u' };
}

/* ---------------------------------------------------------------- runtime */

test('registerTyped and lookupTyped', () => {
  registerTyped('auth', { token: 'abc' });
  assert.deepEqual(lookupTyped('auth'), { token: 'abc' });
  registerTyped('metrics', { count: 3 });
  assert.deepEqual(lookupTyped('metrics'), { count: 3 });
});

test('lookupTyped: the fixture pre-registers core', () => {
  assert.deepEqual(lookupTyped('core'), { version: '1.0.0' });
});

test('registerTyped overwrites', () => {
  registerTyped('auth', { token: 'first' });
  registerTyped('auth', { token: 'second' });
  assert.deepEqual(lookupTyped('auth'), { token: 'second' });
});

test('BUILD_ID falls back before it is set', () => {
  assert.equal(buildId(), 'dev');
});

test('BUILD_ID round-trips through the global', () => {
  setBuildId('abc123');
  assert.equal(buildId(), 'abc123');
  assert.equal(globalThis.BUILD_ID, 'abc123', 'a `var` really is on globalThis');
});

test('makeContext', () => {
  assert.deepEqual(makeContext('u1', 's1'), { userId: 'u1', sessionId: 's1' });
});

test('the declarations are fully erased', () => {
  // If any of them were not, this module would have failed to load at all and
  // every test above would be missing rather than failing.
  assert.ok(true);
});
