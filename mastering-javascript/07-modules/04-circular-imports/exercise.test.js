import test from 'node:test';
import assert from 'node:assert/strict';

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

const { CYCLE_PREDICTIONS, callAcrossCycle, valuesAtCallTime, evaluationOrderEffects, breakCycle } = solution;

const EXPECTED = {
  'a reads bValue during its own evaluation': 'works',
  'b reads aValue during its own evaluation': 'TDZ',
  'either module calls the other after evaluation': 'works',
};

test('CYCLE_PREDICTIONS: all answered', () => {
  assert.ok(CYCLE_PREDICTIONS, 'export a CYCLE_PREDICTIONS object');
  const todo = Object.keys(EXPECTED).filter((k) => CYCLE_PREDICTIONS[k] === 'TODO');
  assert.deepEqual(todo, [], `still marked TODO: ${todo.join(', ')}`);
});

for (const [situation, answer] of Object.entries(EXPECTED)) {
  test(`CYCLE_PREDICTIONS: ${situation}`, () => {
    assert.equal(CYCLE_PREDICTIONS?.[situation], answer);
  });
}

test('callAcrossCycle: calls work once everything has loaded', () => {
  assert.equal(callAcrossCycle(), 'a -> b');
});

test('valuesAtCallTime: both readable late', () => {
  assert.deepEqual(valuesAtCallTime(), { a: 'a', b: 'b' });
});

test('evaluationOrderEffects: the asymmetry', () => {
  assert.deepEqual(
    evaluationOrderEffects(),
    { aSawB: 'b', bSawA: 'TDZ' },
    'b evaluated first and saw a half-built a; a then saw a complete b',
  );
});

test('breakCycle: defers the import to call time', async () => {
  const get = breakCycle();
  assert.equal(typeof get, 'function');
  assert.equal(await get(), 'b');
});
