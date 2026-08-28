import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import {
  HOLES, describeHole, isClosedBy, demonstrateArrayCovariance, demonstrateFieldOrder, safeSum,
} from './solution.ts';
import type { Hole, Remedy, Dog } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Holes = Expect<Equal<(typeof HOLES)[number], Hole>>;
type _Closed = Expect<Equal<ReturnType<typeof isClosedBy>, Remedy>>;

function _typeOnly(dogs: Dog[], numbers: number[]) {
  // Hole 1, in the type system: the assignment TypeScript allows.
  const animals: { legs: number }[] = dogs;

  // The remedy, as a signature: a readonly parameter accepts a mutable array...
  safeSum(numbers);
  safeSum([1, 2, 3]);

  // ...and refuses to hand out the ability to write.
  // @ts-expect-error - readonly number[] is not number[]
  const escaped: number[] = [] as readonly number[];
}

/* ---------------------------------------------------------------- runtime */

test('the catalogue is complete', () => {
  assert.equal(HOLES.length, 9);
  assert.equal(new Set(HOLES).size, 9, 'no duplicates');
  assert.equal(HOLES[0], 'array-covariance');
});

test('describeHole', () => {
  assert.equal(
    describeHole('array-covariance'),
    'Dog[] is an Animal[], so a Cat can be pushed in',
  );
  assert.equal(describeHole('any'), 'assignable both ways, and it spreads');
  assert.equal(
    describeHole('field-initialisation-order'),
    'a base constructor can read an uninitialised subclass field',
  );
});

test('describeHole covers every hole', () => {
  for (const hole of HOLES) {
    assert.equal(typeof describeHole(hole), 'string');
    assert.ok(describeHole(hole).length > 0);
  }
});

test('describeHole rejects an unknown hole', () => {
  assert.throws(() => describeHole('not-a-hole' as Hole), TypeError);
});

test('isClosedBy', () => {
  assert.equal(isClosedBy('array-covariance'), 'readonly-parameters');
  assert.equal(isClosedBy('method-bivariance'), 'callbacks-as-properties');
  assert.equal(isClosedBy('unchecked-index'), 'noUncheckedIndexedAccess');
  assert.equal(isClosedBy('field-initialisation-order'), 'no-overridable-calls-in-constructors');
});

test('isClosedBy: the ones no flag closes', () => {
  assert.equal(isClosedBy('any'), 'discipline');
  assert.equal(isClosedBy('type-assertion'), 'discipline');
  assert.equal(isClosedBy('type-predicate'), 'discipline');
  assert.equal(isClosedBy('property-narrowing'), 'discipline');
  assert.equal(isClosedBy('ambient-declaration'), 'discipline');
});

test('array covariance really does let a Cat in', () => {
  const dogs = demonstrateArrayCovariance();
  assert.equal(dogs.length, 2);
  const last = dogs[1];
  assert.ok(last !== undefined);
  // Its static type is Dog. Its runtime shape is not.
  assert.equal(typeof (last as unknown as { bark?: unknown }).bark, 'undefined');
  assert.equal(typeof (last as unknown as { meow?: unknown }).meow, 'function');
});

test('array covariance: calling the method the type promised throws', () => {
  const dogs = demonstrateArrayCovariance();
  const impostor = dogs[1];
  assert.ok(impostor !== undefined);
  assert.throws(() => impostor.bark(), TypeError, 'the type said this was safe');
});

test('field initialisation order hands you an undefined string', () => {
  const seen = demonstrateFieldOrder();
  // The declared type is `string`. The value is not.
  assert.equal(seen, undefined);
  assert.notEqual(typeof seen, 'string');
});

test('safeSum', () => {
  assert.equal(safeSum([1, 2, 3]), 6);
  assert.equal(safeSum([]), 0);
  assert.equal(safeSum([-1, 1]), 0);
});

test('safeSum does not touch its argument', () => {
  const values = [1, 2, 3];
  safeSum(values);
  assert.deepEqual(values, [1, 2, 3]);
});
