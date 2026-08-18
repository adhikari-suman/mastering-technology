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

const {
  safeParse, stringifyStable, redact, reviveDates,
  serialise, deserialise, deepClone, losesData,
} = solution;

test('safeParse: valid input', () => {
  assert.deepEqual(safeParse('{"a":1}'), [null, { a: 1 }]);
  assert.deepEqual(safeParse('null'), [null, null]);
});

test('safeParse: invalid input never throws', () => {
  const [err, value] = safeParse('{oops}');
  assert.ok(err instanceof Error);
  assert.equal(value, null);
});

test('stringifyStable: key order does not matter', () => {
  assert.equal(stringifyStable({ b: 1, a: 2 }), stringifyStable({ a: 2, b: 1 }));
  assert.equal(stringifyStable({ a: 2, b: 1 }), '{"a":2,"b":1}');
});

test('stringifyStable: sorts at every depth', () => {
  assert.equal(
    stringifyStable({ z: { d: 1, c: 2 }, a: 3 }),
    '{"a":3,"z":{"c":2,"d":1}}',
  );
});

test('stringifyStable: arrays keep their order', () => {
  assert.equal(stringifyStable({ list: [3, 1, 2] }), '{"list":[3,1,2]}');
});

test('redact: drops keys at the top level and deeper', () => {
  assert.equal(redact({ user: 'a', password: 'x' }, ['password']), '{"user":"a"}');
  assert.equal(
    redact({ a: { token: 't', keep: 1 } }, ['token']),
    '{"a":{"keep":1}}',
  );
});

test('redact: multiple keys, and none matching', () => {
  assert.equal(redact({ a: 1, b: 2, c: 3 }, ['a', 'c']), '{"b":2}');
  assert.equal(redact({ a: 1 }, ['zzz']), '{"a":1}');
});

test('reviveDates: ISO strings become Dates', () => {
  const result = reviveDates('{"at":"2020-01-01T00:00:00.000Z"}');
  assert.ok(result.at instanceof Date);
  assert.equal(result.at.toISOString(), '2020-01-01T00:00:00.000Z');
});

test('reviveDates: other strings are untouched', () => {
  const result = reviveDates('{"name":"Ada","n":1}');
  assert.equal(result.name, 'Ada');
  assert.equal(result.n, 1);
});

test('reviveDates: works at depth and in arrays', () => {
  const result = reviveDates('{"a":{"at":"2020-01-01T00:00:00.000Z"}}');
  assert.ok(result.a.at instanceof Date);
  const arr = reviveDates('["2020-01-01T00:00:00.000Z"]');
  assert.ok(arr[0] instanceof Date);
});

test('serialise round trip: plain data', () => {
  assert.deepEqual(deserialise(serialise({ a: 1, b: [2, 3] })), { a: 1, b: [2, 3] });
});

test('serialise round trip: Map survives', () => {
  const result = deserialise(serialise({ m: new Map([['a', 1]]) }));
  assert.ok(result.m instanceof Map);
  assert.equal(result.m.get('a'), 1);
});

test('serialise round trip: Set survives', () => {
  const result = deserialise(serialise({ s: new Set([1, 2]) }));
  assert.ok(result.s instanceof Set);
  assert.deepEqual([...result.s], [1, 2]);
});

test('serialise round trip: undefined survives', () => {
  const result = deserialise(serialise({ u: undefined }));
  assert.ok('u' in result, 'the key must survive');
  assert.equal(result.u, undefined);
});

test('deepClone: independent at depth', () => {
  const original = { nested: { deep: [1, 2] } };
  const clone = deepClone(original);
  clone.nested.deep.push(3);
  assert.deepEqual(original.nested.deep, [1, 2]);
});

test('deepClone: Map, Set and Date survive', () => {
  const original = { m: new Map([['a', 1]]), s: new Set([1]), d: new Date(0) };
  const clone = deepClone(original);
  assert.ok(clone.m instanceof Map);
  assert.equal(clone.m.get('a'), 1);
  assert.ok(clone.s instanceof Set);
  assert.ok(clone.d instanceof Date);
  assert.equal(clone.d.getTime(), 0);
});

test('deepClone: survives a cycle', () => {
  const a = { name: 'a' };
  a.self = a;
  const clone = deepClone(a);
  assert.equal(clone.self, clone);
  assert.notEqual(clone, a);
});

test('losesData: safe values', () => {
  assert.equal(losesData({ a: 1, b: 'x', c: [1, 2], d: null }), false);
  assert.equal(losesData([1, 2, 3]), false);
});

test('losesData: lossy values', () => {
  assert.equal(losesData({ fn: () => {} }), true);
  assert.equal(losesData({ u: undefined }), true);
  assert.equal(losesData({ n: NaN }), true);
  assert.equal(losesData({ i: Infinity }), true);
  assert.equal(losesData({ m: new Map([['a', 1]]) }), true);
  assert.equal(losesData({ s: new Set([1]) }), true);
});
