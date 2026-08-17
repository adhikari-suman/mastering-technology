import test from 'node:test';
import assert from 'node:assert/strict';

// Your answers live in solution.js, which you create yourself:
//     cp exercise.js solution.js
//
// It is loaded leniently so that a missing file surfaces as one clear
// failure instead of a module-load crash that hides every other test.
let solution = {};
let loadError = null;
try {
  solution = await import('./solution.js');
} catch (err) {
  loadError = err;
}

test('solution.js exists', () => {
  assert.equal(loadError, null, 'Create it first:  cp exercise.js solution.js');
});

const {
  PREDICTIONS,
  isTruthy,
  defaultTo,
  orDefault,
  addNumeric,
  compare,
  isNullish,
} = solution;

/* eslint-disable eqeqeq */
const ACTUAL = {
  'null == undefined': null == undefined,
  'null === undefined': null === undefined,
  'null == 0': null == 0,
  'null >= 0': null >= 0,
  '0 == "0"': 0 == '0',
  '0 == ""': 0 == '',
  '"" == "0"': '' == '0',
  'NaN == NaN': NaN == NaN,
  '[] == false': [] == false,
  'typeof NaN': typeof NaN,
  '1 + "2"': 1 + '2',
  '"3" - 1': '3' - 1,
  '"3" * "4"': '3' * '4',
  '[] + {}': [] + {},
  'Boolean([])': Boolean([]),
  'Boolean("false")': Boolean('false'),
};

test('PREDICTIONS: every expression has been answered', () => {
  const unanswered = Object.keys(ACTUAL).filter((k) => PREDICTIONS[k] === 'TODO');
  assert.deepEqual(unanswered, [], `still marked TODO: ${unanswered.join(', ')}`);
});

for (const [expression, actual] of Object.entries(ACTUAL)) {
  test(`PREDICTIONS: ${expression}`, () => {
    assert.equal(
      PREDICTIONS[expression],
      actual,
      `you predicted ${JSON.stringify(PREDICTIONS[expression])}, ` +
        `but ${expression} is ${JSON.stringify(actual)}`,
    );
  });
}

test('isTruthy: knows the eight falsy values', () => {
  for (const falsy of [false, 0, -0, 0n, '', null, undefined, NaN]) {
    assert.equal(isTruthy(falsy), false, `${String(falsy)} should be falsy`);
  }
});

test('isTruthy: everything else is truthy', () => {
  for (const truthy of [true, 1, -1, 'a', '0', 'false', [], {}, () => {}, Infinity]) {
    assert.equal(isTruthy(truthy), true, `${String(truthy)} should be truthy`);
  }
});

test('defaultTo: only null and undefined trigger the fallback', () => {
  assert.equal(defaultTo(null, 100), 100);
  assert.equal(defaultTo(undefined, 100), 100);
  assert.equal(defaultTo(0, 100), 0);
  assert.equal(defaultTo('', 'N/A'), '');
  assert.equal(defaultTo(false, true), false);
  assert.equal(defaultTo(NaN, 1), NaN);
});

test('orDefault: any falsy value triggers the fallback', () => {
  assert.equal(orDefault(null, 100), 100);
  assert.equal(orDefault(0, 100), 100);
  assert.equal(orDefault('', 'N/A'), 'N/A');
  assert.equal(orDefault(false, true), true);
  assert.equal(orDefault('hi', 'x'), 'hi');
  assert.equal(orDefault(42, 0), 42);
});

test('addNumeric: adds instead of concatenating', () => {
  assert.equal(addNumeric('10', 5), 15);
  assert.equal(addNumeric('10', '5'), 15);
  assert.equal(addNumeric(1, 2), 3);
  assert.equal(addNumeric('1.5', '2.5'), 4);
});

test('addNumeric: rejects non-numeric input', () => {
  assert.equal(addNumeric('10', 'x'), null);
  assert.equal(addNumeric(undefined, 1), null);
  assert.equal(addNumeric({}, 1), null);
});

test('compare: orders values', () => {
  assert.ok(compare(1, 2) < 0);
  assert.ok(compare(2, 1) > 0);
  assert.equal(compare(1, 1), 0);
  assert.ok(compare('a', 'b') < 0);
});

test('compare: works as a sort comparator', () => {
  assert.deepEqual([10, 1, 5, 2].sort(compare), [1, 2, 5, 10]);
});

test('isNullish: null and undefined only', () => {
  assert.equal(isNullish(null), true);
  assert.equal(isNullish(undefined), true);
  assert.equal(isNullish(0), false);
  assert.equal(isNullish(''), false);
  assert.equal(isNullish(false), false);
  assert.equal(isNullish(NaN), false);
});
