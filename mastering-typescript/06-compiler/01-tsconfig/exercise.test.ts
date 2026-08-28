import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import {
  STRICT_FLAGS, EXTRA_STRICT_FLAGS, resolveFlags, isStricterThan, describeConfig,
} from './solution.ts';
import type { StrictFlag, ExtraFlag, Flag, Config, ResolvedFlags } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Strict = Expect<
  Equal<
    StrictFlag,
    | 'noImplicitAny' | 'strictNullChecks' | 'strictFunctionTypes' | 'strictBindCallApply'
    | 'strictPropertyInitialization' | 'noImplicitThis' | 'useUnknownInCatchVariables'
    | 'alwaysStrict'
  >
>;
type _Extra = Expect<
  Equal<
    ExtraFlag,
    | 'noUncheckedIndexedAccess' | 'exactOptionalPropertyTypes' | 'noImplicitOverride'
    | 'noImplicitReturns' | 'noFallthroughCasesInSwitch' | 'noPropertyAccessFromIndexSignature'
  >
>;
type _Flag = Expect<Equal<Flag, StrictFlag | ExtraFlag>>;
type _Resolved = Expect<Equal<ResolvedFlags, Record<StrictFlag | ExtraFlag, boolean>>>;
type _Config = Expect<
  Equal<Config, { strict?: boolean } & { [K in StrictFlag | ExtraFlag]?: boolean }>
>;

function _typeOnly(config: Config) {
  // @ts-expect-error - not a flag this Lesson knows about
  const bad: Config = { noSuchFlag: true };

  const ok: Config = { strict: true, strictNullChecks: false };
  const resolved = resolveFlags(ok);
  type _Value = Expect<Equal<typeof resolved.noImplicitAny, boolean>>;
}

/* ---------------------------------------------------------------- runtime */

test('the flag lists', () => {
  assert.equal(STRICT_FLAGS.length, 8);
  assert.equal(EXTRA_STRICT_FLAGS.length, 6);
  assert.equal(STRICT_FLAGS[0], 'noImplicitAny');
  assert.equal(STRICT_FLAGS[1], 'strictNullChecks');
  assert.equal(EXTRA_STRICT_FLAGS[0], 'noUncheckedIndexedAccess');
});

test('resolveFlags: an empty config enables nothing', () => {
  const flags = resolveFlags({});
  assert.equal(Object.values(flags).every((v) => v === false), true);
  assert.equal(Object.keys(flags).length, 14);
});

test('resolveFlags: strict enables exactly the eight', () => {
  const flags = resolveFlags({ strict: true });
  for (const flag of STRICT_FLAGS) assert.equal(flags[flag], true, `${flag} should be on`);
  for (const flag of EXTRA_STRICT_FLAGS) assert.equal(flags[flag], false, `${flag} should be off`);
});

test('resolveFlags: an explicit flag overrides strict, in both directions', () => {
  const off = resolveFlags({ strict: true, strictNullChecks: false });
  assert.equal(off.strictNullChecks, false, 'still claims strict, and is not');
  assert.equal(off.noImplicitAny, true);

  const on = resolveFlags({ noUncheckedIndexedAccess: true });
  assert.equal(on.noUncheckedIndexedAccess, true);
  assert.equal(on.noImplicitAny, false, 'without strict, nothing else came along');
});

test('resolveFlags: strict false is the same as absent', () => {
  assert.deepEqual(resolveFlags({ strict: false }), resolveFlags({}));
});

test('isStricterThan', () => {
  assert.equal(isStricterThan({ strict: true }, {}), true);
  assert.equal(isStricterThan({}, { strict: true }), false);
  assert.equal(isStricterThan({ strict: true }, { strict: true }), false, 'equal is not stricter');
});

test('isStricterThan: a config missing one flag is not stricter', () => {
  const almost = { strict: true, strictNullChecks: false, noUncheckedIndexedAccess: true };
  assert.equal(isStricterThan(almost, { strict: true }), false, 'it dropped one');
  assert.equal(isStricterThan({ strict: true, noUncheckedIndexedAccess: true }, { strict: true }), true);
});

test('describeConfig: nothing on lists everything as off', () => {
  assert.equal(
    describeConfig({}),
    '0 of 14 flags enabled; off: noImplicitAny, strictNullChecks, strictFunctionTypes, ' +
      'strictBindCallApply, strictPropertyInitialization, noImplicitThis, ' +
      'useUnknownInCatchVariables, alwaysStrict, noUncheckedIndexedAccess, ' +
      'exactOptionalPropertyTypes, noImplicitOverride, noImplicitReturns, ' +
      'noFallthroughCasesInSwitch, noPropertyAccessFromIndexSignature',
  );
});

test('describeConfig', () => {
  assert.equal(
    describeConfig({ strict: true }),
    '8 of 14 flags enabled; off: noUncheckedIndexedAccess, exactOptionalPropertyTypes, ' +
      'noImplicitOverride, noImplicitReturns, noFallthroughCasesInSwitch, ' +
      'noPropertyAccessFromIndexSignature',
  );
});

test('describeConfig: everything on has no off clause', () => {
  const all: Config = {
    strict: true,
    noUncheckedIndexedAccess: true,
    exactOptionalPropertyTypes: true,
    noImplicitOverride: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true,
    noPropertyAccessFromIndexSignature: true,
  };
  assert.equal(describeConfig(all), '14 of 14 flags enabled');
});

test('describeConfig lists disabled flags in declaration order', () => {
  assert.equal(
    describeConfig({ strict: true, noImplicitAny: false, exactOptionalPropertyTypes: true }),
    '8 of 14 flags enabled; off: noImplicitAny, noUncheckedIndexedAccess, ' +
      'noImplicitOverride, noImplicitReturns, noFallthroughCasesInSwitch, ' +
      'noPropertyAccessFromIndexSignature',
  );
});
