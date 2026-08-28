import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import {
  logValue, parseJson, getProp, setLevel, currentLevel, levelValue, firstOr, LEVELS,
} from './solution.ts';
import type { Level } from './solution.ts';

/* ------------------------------------------------------------------ types */

// 1. No type parameter left to widen.
type _Log = Expect<Equal<typeof logValue, (value: unknown) => string>>;

// 2. The caller is handed the truth and must narrow it themselves.
type _Parse = Expect<Equal<typeof parseJson, (json: string) => unknown>>;

// 4. A closed union, said plainly.
type _SetLevel = Expect<Equal<typeof setLevel, (level: Level) => void>>;

function _typeOnly() {
  const obj = { a: 1, b: 'x' };

  // 3. The constraint is what makes the result precise.
  const a = getProp(obj, 'a');
  type _A = Expect<Equal<typeof a, number>>;
  const b = getProp(obj, 'b');
  type _B = Expect<Equal<typeof b, string>>;

  // @ts-expect-error - 'z' is not a key of obj
  getProp(obj, 'z');

  // @ts-expect-error - a return-only generic no longer exists to be supplied
  parseJson<{ a: number }>('{}');

  // The one that keeps its generic: the answer depends on the argument.
  const debug = levelValue('debug');
  type _Debug = Expect<Equal<typeof debug, 0>>;
  const error = levelValue('error');
  type _Error = Expect<Equal<typeof error, 3>>;

  // @ts-expect-error - not a Level
  levelValue('verbose');

  const f = firstOr([1, 2], 0);
  type _F = Expect<Equal<typeof f, number>>;
}

/* ---------------------------------------------------------------- runtime */

test('logValue', () => {
  assert.equal(logValue('a'), 'a');
  assert.equal(logValue(1), '1');
  assert.equal(logValue({ a: 1 }), '{"a":1}');
  assert.equal(logValue([1, 2]), '[1,2]');
  assert.equal(logValue(null), 'null');
});

test('logValue: values JSON cannot represent', () => {
  assert.equal(logValue(undefined), 'undefined');
  assert.equal(logValue(() => {}), '() => {}');
});

test('parseJson returns the parsed value', () => {
  assert.deepEqual(parseJson('{"a":1}'), { a: 1 });
  assert.deepEqual(parseJson('[1]'), [1]);
  assert.equal(parseJson('null'), null);
});

test('getProp', () => {
  assert.equal(getProp({ a: 1, b: 'x' }, 'a'), 1);
  assert.equal(getProp({ a: 1, b: 'x' }, 'b'), 'x');
});

test('setLevel and currentLevel', () => {
  assert.equal(currentLevel(), 'info', 'the default before any call');
  setLevel('warn');
  assert.equal(currentLevel(), 'warn');
  setLevel('debug');
  assert.equal(currentLevel(), 'debug');
  setLevel('info');
});

test('levelValue', () => {
  assert.equal(levelValue('debug'), 0);
  assert.equal(levelValue('info'), 1);
  assert.equal(levelValue('warn'), 2);
  assert.equal(levelValue('error'), 3);
});

test('levelValue covers every level in LEVELS', () => {
  for (const level of LEVELS) {
    assert.equal(typeof levelValue(level), 'number');
  }
});

test('firstOr', () => {
  assert.equal(firstOr([1, 2], 0), 1);
  assert.equal(firstOr([], 0), 0);
  assert.equal(firstOr([undefined, 1], 9), undefined, 'a present undefined is the first element');
});
