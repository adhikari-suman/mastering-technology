import test from 'node:test';
import assert from 'node:assert/strict';
import * as solution from './solution.js';

const { attachMetadata, readMetadata, symbolKeysOf, Range, Money, Even } = solution;

test('attachMetadata: stores and returns the object', () => {
  const obj = { name: 'Ada' };
  assert.equal(attachMetadata(obj, { id: 1 }), obj);
  assert.deepEqual(readMetadata(obj), { id: 1 });
});

test('attachMetadata: invisible to normal enumeration', () => {
  const obj = attachMetadata({ name: 'Ada' }, { id: 1 });
  assert.deepEqual(Object.keys(obj), ['name']);
  assert.equal(JSON.stringify(obj), '{"name":"Ada"}');
  assert.deepEqual(Object.getOwnPropertyNames(obj), ['name']);
});

test('readMetadata: undefined when nothing was attached', () => {
  assert.equal(readMetadata({}), undefined);
});

test('attachMetadata: does not collide with a string key of the same name', () => {
  const obj = { metadata: 'mine' };
  attachMetadata(obj, { id: 1 });
  assert.equal(obj.metadata, 'mine');
  assert.deepEqual(readMetadata(obj), { id: 1 });
});

test('symbolKeysOf', () => {
  const s = Symbol('a');
  assert.deepEqual(symbolKeysOf({ [s]: 1 }), [s]);
  assert.deepEqual(symbolKeysOf({ plain: 1 }), []);
});

test('Range: spreads', () => {
  assert.deepEqual([...new Range(1, 3)], [1, 2, 3]);
  assert.deepEqual([...new Range(2, 2)], [2]);
  assert.deepEqual([...new Range(3, 1)], []);
});

test('Range: works with for...of', () => {
  const seen = [];
  for (const n of new Range(1, 4)) seen.push(n);
  assert.deepEqual(seen, [1, 2, 3, 4]);
});

test('Range: works with destructuring and Array.from', () => {
  const [first, second] = new Range(10, 20);
  assert.equal(first, 10);
  assert.equal(second, 11);
  assert.deepEqual(Array.from(new Range(1, 3)), [1, 2, 3]);
});

test('Range: iterating twice starts over', () => {
  const r = new Range(1, 3);
  assert.deepEqual([...r], [1, 2, 3]);
  assert.deepEqual([...r], [1, 2, 3], 'each iteration needs a fresh iterator');
});

test('Money: numeric hint', () => {
  assert.equal(+new Money(5, 'GBP'), 5);
  assert.equal(new Money(5, 'GBP') * 2, 10);
});

test('Money: string hint', () => {
  assert.equal(`${new Money(5, 'GBP')}`, '5 GBP');
  assert.equal(String(new Money(3, 'USD')), '3 USD');
});

test('Money: default hint behaves as a string', () => {
  assert.equal(new Money(5, 'GBP') + '', '5 GBP');
});

test('Money: toStringTag', () => {
  assert.equal(Object.prototype.toString.call(new Money(1, 'GBP')), '[object Money]');
});

test('Even: hasInstance drives instanceof', () => {
  assert.equal(4 instanceof Even, true);
  assert.equal(0 instanceof Even, true);
  assert.equal(3 instanceof Even, false);
  assert.equal('x' instanceof Even, false);
  assert.equal(2.5 instanceof Even, false);
});
