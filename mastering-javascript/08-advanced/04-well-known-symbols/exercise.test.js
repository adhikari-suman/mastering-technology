import test from 'node:test';
import assert from 'node:assert/strict';
import * as solution from './solution.js';

const { Duration, Collection, PositiveNumber, PlainArray, typeTagOf, hintUsed } = solution;

test('Duration: number hint', () => {
  assert.equal(+new Duration(1500), 1500);
  assert.equal(new Duration(1000) * 2, 2000);
});

test('Duration: string hint', () => {
  assert.equal(`${new Duration(1500)}`, '1.5s');
  assert.equal(String(new Duration(2000)), '2s');
  assert.equal(String(new Duration(500)), '0.5s');
});

test('Duration: default hint behaves as a string', () => {
  assert.equal(new Duration(1500) + '', '1.5s');
});

test('Duration: keeps its raw value and its tag', () => {
  assert.equal(new Duration(1500).ms, 1500);
  assert.equal(Object.prototype.toString.call(new Duration(1)), '[object Duration]');
});

test('Collection: synchronously iterable', () => {
  assert.deepEqual([...new Collection([1, 2, 3])], [1, 2, 3]);
  assert.deepEqual([...new Collection([])], []);
  const seen = [];
  for (const x of new Collection(['a'])) seen.push(x);
  assert.deepEqual(seen, ['a']);
});

test('Collection: asynchronously iterable', async () => {
  const seen = [];
  for await (const x of new Collection([1, 2, 3])) seen.push(x);
  assert.deepEqual(seen, [1, 2, 3]);
});

test('Collection: size and tag', () => {
  assert.equal(new Collection([1, 2]).size, 2);
  assert.equal(Object.prototype.toString.call(new Collection([])), '[object Collection]');
});

test('Collection: re-iterable', () => {
  const c = new Collection([1, 2]);
  assert.deepEqual([...c], [1, 2]);
  assert.deepEqual([...c], [1, 2]);
});

test('PositiveNumber: structural instanceof', () => {
  assert.equal(5 instanceof PositiveNumber, true);
  assert.equal(0.5 instanceof PositiveNumber, true);
  assert.equal(0 instanceof PositiveNumber, false);
  assert.equal(-1 instanceof PositiveNumber, false);
  assert.equal('5' instanceof PositiveNumber, false);
  assert.equal(NaN instanceof PositiveNumber, false);
});

test('PlainArray: is an Array subclass', () => {
  const a = PlainArray.from([1, 2, 3]);
  assert.ok(a instanceof PlainArray);
  assert.ok(Array.isArray(a));
  assert.equal(a.length, 3);
});

test('PlainArray: derived operations return plain arrays', () => {
  const a = PlainArray.from([1, 2, 3]);
  const mapped = a.map((n) => n * 2);
  assert.equal(mapped instanceof PlainArray, false, 'Symbol.species should say Array');
  assert.ok(Array.isArray(mapped));
  assert.deepEqual(mapped, [2, 4, 6]);
  assert.equal(a.filter(() => true) instanceof PlainArray, false);
  assert.equal(a.slice(0, 1) instanceof PlainArray, false);
});

test('typeTagOf: built-ins', () => {
  assert.equal(typeTagOf([]), 'Array');
  assert.equal(typeTagOf({}), 'Object');
  assert.equal(typeTagOf(null), 'Null');
  assert.equal(typeTagOf(undefined), 'Undefined');
  assert.equal(typeTagOf(new Map()), 'Map');
  assert.equal(typeTagOf(new Set()), 'Set');
  assert.equal(typeTagOf(new Date()), 'Date');
  assert.equal(typeTagOf(/x/), 'RegExp');
  assert.equal(typeTagOf(1), 'Number');
  assert.equal(typeTagOf('s'), 'String');
});

test('typeTagOf: honours a custom toStringTag', () => {
  assert.equal(typeTagOf(new Duration(1)), 'Duration');
  assert.equal(typeTagOf(new Collection([])), 'Collection');
});

test('hintUsed', () => {
  assert.equal(hintUsed('add'), 'default');
  assert.equal(hintUsed('template'), 'string');
  assert.equal(hintUsed('multiply'), 'number');
  assert.equal(hintUsed('string'), 'string');
});
