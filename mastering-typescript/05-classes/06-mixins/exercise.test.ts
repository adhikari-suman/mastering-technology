import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { Entity, Timestamped, Serialisable, Countable, User } from './solution.ts';
import type { Ctor } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Ctor = Expect<Equal<Ctor<{ a: 1 }>, new (...args: any[]) => { a: 1 }>>;

function _typeOnly(user: User) {
  // Every mixin's members are visible on the composed class.
  type _Name = Expect<Equal<typeof user.name, string>>;
  type _Email = Expect<Equal<typeof user.email, string>>;
  type _CreatedAt = Expect<Equal<typeof user.createdAt, number>>;
  type _Age = Expect<Equal<ReturnType<typeof user.age>, number>>;
  type _Json = Expect<Equal<ReturnType<typeof user.toJSON>, Record<string, unknown>>>;
  type _Count = Expect<Equal<typeof User.count, number>>;

  // withEmail returns `this`, so it chains into subclass members.
  type _Chained = Expect<Equal<ReturnType<typeof user.withEmail>, User>>;

  // A mixin over a plain base composes too.
  const Composed = Timestamped(Serialisable(Entity));
  type _Composed = Expect<Equal<InstanceType<typeof Composed>['name'], string>>;
}

/* ---------------------------------------------------------------- runtime */

test('Timestamped adds createdAt and age', () => {
  const Stamped = Timestamped(Entity);
  const e = new Stamped('thing');
  assert.equal(typeof e.createdAt, 'number');
  assert.equal(e.age(e.createdAt + 500), 500);
});

test('Serialisable adds toJSON over own enumerable properties', () => {
  const S = Serialisable(Entity);
  const e = new S('thing');
  Object.assign(e, { a: 1, b: 'two' });
  assert.deepEqual(e.toJSON(), { name: 'thing', a: 1, b: 'two' });
});

test('toJSON reads own properties only, not the prototype', () => {
  const S = Serialisable(Entity);
  const e = new S('thing');
  assert.deepEqual(Object.keys(e.toJSON()), ['name'], 'methods live on the prototype');
});

test('Countable counts per mixed class, not globally', () => {
  const A = Countable(Entity);
  const B = Countable(Entity);
  A.resetCount();
  B.resetCount();
  new A('x');
  new A('y');
  new B('z');
  assert.equal(A.count, 2);
  assert.equal(B.count, 1, 'each application gets its own class, and its own counter');
});

test('Countable: resetCount', () => {
  const A = Countable(Entity);
  A.resetCount();
  new A('x');
  assert.equal(A.count, 1);
  A.resetCount();
  assert.equal(A.count, 0);
});

test('User composes all three and its own base', () => {
  User.resetCount();
  const u = new User('ada');
  assert.equal(u.name, 'ada');
  assert.equal(u.email, '');
  assert.equal(typeof u.createdAt, 'number');
  assert.equal(User.count, 1);
  assert.ok(u instanceof Entity, 'the chain still reaches the base');
});

test('User#withEmail chains and returns the instance', () => {
  const u = new User('ada');
  assert.equal(u.withEmail('a@b.c'), u);
  assert.equal(u.email, 'a@b.c');
});

test('User#toJSON sees the fields every layer added', () => {
  const u = new User('ada').withEmail('a@b.c');
  const json = u.toJSON();
  assert.equal(json['name'], 'ada');
  assert.equal(json['email'], 'a@b.c');
  assert.equal(typeof json['createdAt'], 'number');
});

test('the prototype chain runs through every mixin', () => {
  const u = new User('ada');
  assert.equal(typeof u.age, 'function');
  assert.equal(typeof u.toJSON, 'function');
});
