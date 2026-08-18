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
  describe: describeProp,
  defineConstant,
  defineHidden,
  defineComputed,
  enumerableKeys,
  allOwnKeys,
  deepFreeze,
  isDeeplyFrozen,
} = solution;

test('describe: assignment produces all-true defaults', () => {
  assert.deepEqual(describeProp({ x: 1 }, 'x'), {
    value: 1, writable: true, enumerable: true, configurable: true,
  });
});

test('describe: missing keys give null', () => {
  assert.equal(describeProp({}, 'x'), null);
  assert.equal(describeProp({}, 'toString'), null, 'inherited is not own');
});

test('defineConstant: readable and visible', () => {
  const o = defineConstant({}, 'PI', 3.14);
  assert.equal(o.PI, 3.14);
  assert.deepEqual(Object.keys(o), ['PI']);
});

test('defineConstant: not writable, not deletable', () => {
  const o = defineConstant({}, 'PI', 3.14);
  assert.throws(() => { o.PI = 4; }, TypeError, 'strict mode should reject the write');
  assert.throws(() => { delete o.PI; }, TypeError);
  assert.equal(o.PI, 3.14);
});

test('defineHidden: usable but invisible', () => {
  const o = defineHidden({ shown: 1 }, 'secret', 42);
  assert.equal(o.secret, 42);
  assert.deepEqual(Object.keys(o), ['shown']);
  assert.equal(JSON.stringify(o), '{"shown":1}');
  assert.deepEqual({ ...o }, { shown: 1 }, 'spread copies enumerable own keys only');
});

test('defineHidden: still writable', () => {
  const o = defineHidden({}, 'secret', 1);
  o.secret = 2;
  assert.equal(o.secret, 2);
});

test('defineComputed: getter runs with obj as this', () => {
  const user = defineComputed({ first: 'Ada', last: 'Lovelace' }, 'full', function () {
    return `${this.first} ${this.last}`;
  });
  assert.equal(user.full, 'Ada Lovelace');
});

test('defineComputed: recomputes on every read', () => {
  const user = defineComputed({ first: 'Ada', last: 'L' }, 'full', function () {
    return `${this.first} ${this.last}`;
  });
  user.first = 'Grace';
  assert.equal(user.full, 'Grace L');
});

test('defineComputed: is enumerable and is an accessor', () => {
  const o = defineComputed({}, 'x', () => 1);
  assert.deepEqual(Object.keys(o), ['x']);
  assert.ok(Object.getOwnPropertyDescriptor(o, 'x').get);
});

test('enumerableKeys vs allOwnKeys', () => {
  const o = defineHidden({ a: 1 }, 'b', 2);
  assert.deepEqual(enumerableKeys(o), ['a']);
  assert.deepEqual(allOwnKeys(o).sort(), ['a', 'b']);
});

test('deepFreeze: freezes the top level', () => {
  const o = deepFreeze({ a: 1 });
  assert.ok(Object.isFrozen(o));
  assert.throws(() => { o.a = 2; }, TypeError);
});

test('deepFreeze: freezes nested objects', () => {
  const o = deepFreeze({ nested: { deep: { x: 1 } } });
  assert.ok(Object.isFrozen(o.nested));
  assert.ok(Object.isFrozen(o.nested.deep));
  assert.throws(() => { o.nested.deep.x = 2; }, TypeError);
});

test('deepFreeze: freezes arrays', () => {
  const o = deepFreeze({ tags: ['a'] });
  assert.ok(Object.isFrozen(o.tags));
  assert.throws(() => o.tags.push('b'), TypeError, 'a shallow freeze would allow this');
});

test('deepFreeze: survives a circular reference', () => {
  const a = { name: 'a' };
  a.self = a;
  deepFreeze(a);
  assert.ok(Object.isFrozen(a));
});

test('isDeeplyFrozen', () => {
  assert.equal(isDeeplyFrozen(deepFreeze({ a: { b: 1 } })), true);
  assert.equal(isDeeplyFrozen(Object.freeze({ a: { b: 1 } })), false, 'freeze is shallow');
  assert.equal(isDeeplyFrozen({ a: 1 }), false);
  assert.equal(isDeeplyFrozen(Object.freeze({ a: 1 })), true);
});
