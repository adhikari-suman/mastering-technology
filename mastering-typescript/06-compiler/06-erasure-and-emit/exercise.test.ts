import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { ERASABLE, EMITS_CODE, isErasable, checkErasable, stripAnnotations } from './solution.ts';
import type { Construct, ErasureReport } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Erasable = Expect<
  Equal<(typeof ERASABLE)[number], Exclude<Construct, (typeof EMITS_CODE)[number]>>
>;
type _Emits = Expect<
  Equal<
    (typeof EMITS_CODE)[number],
    'enum' | 'namespace-with-body' | 'parameter-property' | 'legacy-decorator'
  >
>;

function _typeOnly(report: ErasureReport) {
  if (report.ok) {
    // @ts-expect-error - there are no offenders when ok
    report.offenders;
  } else {
    const offenders = report.offenders;
    type _Offenders = Expect<Equal<typeof offenders, Construct[]>>;
  }

  // @ts-expect-error - not a Construct
  isErasable('semicolon');
}

/* ---------------------------------------------------------------- runtime */

test('the two lists partition the constructs', () => {
  assert.equal(ERASABLE.length, 15);
  assert.equal(EMITS_CODE.length, 4);
  assert.equal(new Set([...ERASABLE, ...EMITS_CODE]).size, 19, 'no overlap, nothing missing');
});

test('isErasable: the ones that vanish', () => {
  for (const c of ['type-annotation', 'interface', 'type-alias', 'generic-parameter',
    'as-assertion', 'satisfies', 'implements-clause', 'declare-modifier',
    'import-type'] as const) {
    assert.equal(isErasable(c), true, `${c} should erase`);
  }
});

test('isErasable: the four that do not', () => {
  assert.equal(isErasable('enum'), false);
  assert.equal(isErasable('namespace-with-body'), false);
  assert.equal(isErasable('parameter-property'), false);
  assert.equal(isErasable('legacy-decorator'), false);
});

test('isErasable: the ones people expect to emit, and do not', () => {
  assert.equal(isErasable('abstract-modifier'), true, 'the check is compile-time only');
  assert.equal(isErasable('accessibility-modifier'), true, '`private` is a convention');
  assert.equal(isErasable('private-field'), true, '#x is JavaScript, not TypeScript');
  assert.equal(isErasable('static-block'), true, 'also JavaScript');
  assert.equal(isErasable('accessor'), true, 'get/set are JavaScript');
  assert.equal(isErasable('override-modifier'), true);
});

test('checkErasable: all clear', () => {
  assert.deepEqual(checkErasable(['interface', 'type-alias']), { ok: true });
  assert.deepEqual(checkErasable([]), { ok: true });
});

test('checkErasable: reports offenders in input order, deduplicated', () => {
  assert.deepEqual(checkErasable(['interface', 'enum', 'enum']), {
    ok: false,
    offenders: ['enum'],
  });
  assert.deepEqual(checkErasable(['parameter-property', 'interface', 'enum']), {
    ok: false,
    offenders: ['parameter-property', 'enum'],
  });
});

test('stripAnnotations: a parameter list and a return type', () => {
  assert.equal(
    stripAnnotations('function f(a: number, b: string): void {'),
    'function f(a        , b        )       {',
  );
  assert.equal(
    stripAnnotations('function f(a: number, b: string): void {').length,
    'function f(a: number, b: string): void {'.length,
  );
});

test('stripAnnotations preserves the line width', () => {
  const input = 'function f(a: number, b: string): void {';
  assert.equal(stripAnnotations(input).length, input.length);
});

test('stripAnnotations: no annotations, no change', () => {
  assert.equal(stripAnnotations('function f(a, b) {'), 'function f(a, b) {');
  assert.equal(stripAnnotations('const x = 1;'), 'const x = 1;');
  assert.equal(stripAnnotations(''), '');
});

test('stripAnnotations: a single parameter', () => {
  assert.equal(stripAnnotations('function f(a: number) {'), 'function f(a        ) {');
});

test('stripAnnotations: a return type with no body brace', () => {
  assert.equal(stripAnnotations('declare function f(): void'), 'declare function f()      ');
});

test('stripAnnotations: a nested generic argument stays inside its annotation', () => {
  assert.equal(
    stripAnnotations('function f(a: Map<string, number>) {'),
    'function f(a                     ) {',
  );
});
