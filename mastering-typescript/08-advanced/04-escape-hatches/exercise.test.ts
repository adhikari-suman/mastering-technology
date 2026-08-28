import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { SEVERITY, isSelfRepairing, findHatches, audit, preferred } from './solution.ts';
import type { Hatch, Finding, Audit, Situation } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Severity = Expect<Equal<(typeof SEVERITY)[number], Hatch>>;
type _Preferred = Expect<Equal<ReturnType<typeof preferred>, Hatch>>;
type _Audit = Expect<
  Equal<
    Audit,
    {
      readonly total: number;
      readonly byHatch: Record<Hatch, number>;
      readonly uncommented: readonly Finding[];
      readonly worst: Hatch | undefined;
    }
  >
>;

function _typeOnly(finding: Finding) {
  // @ts-expect-error - a Finding is readonly
  finding.line = 1;
}

/* ---------------------------------------------------------------- runtime */

test('SEVERITY is the five, weakest first', () => {
  assert.equal(SEVERITY.length, 5);
  assert.equal(SEVERITY[0], 'ts-expect-error', 'the one to reach for first');
  assert.equal(SEVERITY[4], 'any', 'and the one to reach for last');
  assert.equal(new Set(SEVERITY).size, 5);
});

test('only one hatch repairs itself', () => {
  assert.equal(isSelfRepairing('ts-expect-error'), true);
  assert.equal(isSelfRepairing('ts-ignore'), false);
  assert.equal(isSelfRepairing('as'), false);
  assert.equal(isSelfRepairing('non-null'), false);
  assert.equal(isSelfRepairing('any'), false);
});

test('findHatches: one of each', () => {
  const source = [
    'const a = x as string;',
    'const b = y!.length;',
    'let c: any = 1;',
    '// @ts-expect-error upstream bug',
    '// @ts-ignore',
  ].join('\n');
  const found = findHatches(source);
  assert.deepEqual(found.map((f) => f.hatch), ['as', 'non-null', 'any', 'ts-expect-error', 'ts-ignore']);
  assert.deepEqual(found.map((f) => f.line), [1, 2, 3, 4, 5]);
});

test('findHatches: nothing to find', () => {
  assert.deepEqual(findHatches('const a = 1;'), []);
  assert.deepEqual(findHatches(''), []);
});

test('findHatches: `as any` counts as the stronger one', () => {
  const found = findHatches('const a = x as any;');
  assert.equal(found.length, 1);
  assert.equal(found[0]?.hatch, 'any');
});

test('findHatches: at most one finding per line', () => {
  const found = findHatches('const a = (x as string)!.y;');
  assert.equal(found.length, 1);
  assert.equal(found[0]?.hatch, 'as', 'the first match in the documented order');
});

test('findHatches: commented or not', () => {
  const source = [
    'const a = x as string; // safe: validated on the line above',
    'const b = y as string;',
    '// @ts-expect-error',
    '// @ts-expect-error see issue 42',
  ].join('\n');
  const found = findHatches(source);
  assert.equal(found[0]?.commented, true);
  assert.equal(found[1]?.commented, false);
  assert.equal(found[2]?.commented, false, 'the directive alone is not an explanation');
  assert.equal(found[3]?.commented, true);
});

test('findHatches: an empty trailing comment does not count', () => {
  const found = findHatches('const a = x as string; //   ');
  assert.equal(found[0]?.commented, false);
});

test('findHatches: the non-null forms', () => {
  assert.equal(findHatches('a!.b')[0]?.hatch, 'non-null');
  assert.equal(findHatches('f(a!)')[0]?.hatch, 'non-null');
  assert.equal(findHatches('const x = a!;')[0]?.hatch, 'non-null');
  assert.equal(findHatches('a![0]')[0]?.hatch, 'non-null');
  assert.deepEqual(findHatches('a !== b'), [], 'not a non-null assertion');
});

test('audit', () => {
  const findings = findHatches([
    'const a = x as string;',
    'const b = y as number;',
    'let c: any = 1;',
  ].join('\n'));
  const result = audit(findings);
  assert.equal(result.total, 3);
  assert.equal(result.byHatch.as, 2);
  assert.equal(result.byHatch.any, 1);
  assert.equal(result.byHatch['ts-ignore'], 0, 'zeroes are present');
  assert.equal(result.worst, 'any');
  assert.equal(result.uncommented.length, 3);
});

test('audit on nothing', () => {
  const result = audit([]);
  assert.equal(result.total, 0);
  assert.equal(result.worst, undefined);
  assert.deepEqual(result.uncommented, []);
  assert.equal(Object.keys(result.byHatch).length, 5);
});

test('audit reports the strongest hatch present', () => {
  assert.equal(audit(findHatches('// @ts-expect-error why')).worst, 'ts-expect-error');
  assert.equal(audit(findHatches('const a = b as C;')).worst, 'as');
  assert.equal(
    audit(findHatches('// @ts-expect-error why\nconst a = b!.c;')).worst,
    'non-null',
  );
});

test('audit separates the uncommented ones', () => {
  const result = audit(findHatches('const a = b as C; // justified\nconst d = e as F;'));
  assert.equal(result.uncommented.length, 1);
  assert.equal(result.uncommented[0]?.line, 2);
});

test('preferred', () => {
  assert.equal(preferred('known-compiler-bug'), 'ts-expect-error');
  assert.equal(preferred('asserting-a-compile-error-in-a-test'), 'ts-expect-error');
  assert.equal(preferred('value-just-validated'), 'as');
  assert.equal(preferred('accumulator-being-built'), 'as');
  assert.equal(preferred('untyped-dynamic-boundary'), 'any');
});

test('preferred rejects a situation it has no opinion about', () => {
  assert.throws(() => preferred('just-make-it-compile' as Situation), TypeError);
});
