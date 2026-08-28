import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import {
  QueryBuilder, SortedQueryBuilder, Maybe, describeNamed, Model, User,
} from './solution.ts';

/* ------------------------------------------------------------------ types */

function _chaining() {
  const q = new SortedQueryBuilder('users');

  // The base methods must hand back the SUBCLASS, or this stops compiling.
  const chained = q.where('a = 1').limit(10).orderBy('name');
  type _Chained = Expect<Equal<typeof chained, SortedQueryBuilder>>;

  // ...in any order.
  q.orderBy('n').where('a').limit(1).orderBy('m').build();

  const base = new QueryBuilder('t').where('x');
  type _Base = Expect<Equal<typeof base, QueryBuilder>>;

  // @ts-expect-error - the base does not gain the subclass's method
  new QueryBuilder('t').orderBy('n');
}

function _maybe(m: Maybe<number>) {
  // @ts-expect-error - get is not on the class; only the narrowed shape has it
  m.get();

  if (m.hasValue()) {
    const value = m.get();
    type _Value = Expect<Equal<typeof value, number>>;
  }
}

function _thisParam() {
  // The receiver is checked, and never passed by the caller.
  describeNamed.call({ name: 'ada' });

  // @ts-expect-error - the receiver must have a name
  describeNamed.call({});

  type _NoParams = Expect<Equal<Parameters<typeof describeNamed>, []>>;
}

function _staticFactory() {
  const m = Model.create();
  type _M = Expect<Equal<typeof m, Model>>;
  const u = User.create();
  type _U = Expect<Equal<typeof u, User>>;
}

/* ---------------------------------------------------------------- runtime */

test('QueryBuilder: the minimal query', () => {
  assert.equal(new QueryBuilder('users').build(), 'SELECT * FROM users');
});

test('QueryBuilder: where and limit', () => {
  assert.equal(
    new QueryBuilder('users').where('a = 1').limit(10).build(),
    'SELECT * FROM users WHERE a = 1 LIMIT 10',
  );
  assert.equal(new QueryBuilder('t').limit(5).build(), 'SELECT * FROM t LIMIT 5');
});

test('QueryBuilder: several conditions are ANDed', () => {
  assert.equal(
    new QueryBuilder('t').where('a = 1').where('b = 2').build(),
    'SELECT * FROM t WHERE a = 1 AND b = 2',
  );
});

test('QueryBuilder: the last limit wins', () => {
  assert.equal(new QueryBuilder('t').limit(1).limit(2).build(), 'SELECT * FROM t LIMIT 2');
});

test('SortedQueryBuilder chains through the inherited methods', () => {
  assert.equal(
    new SortedQueryBuilder('users').where('a = 1').limit(10).orderBy('name').build(),
    'SELECT * FROM users WHERE a = 1 LIMIT 10 ORDER BY name',
  );
});

test('SortedQueryBuilder: order of calls does not change the SQL', () => {
  assert.equal(
    new SortedQueryBuilder('t').orderBy('n').where('a').build(),
    'SELECT * FROM t WHERE a ORDER BY n',
  );
});

test('Maybe: of and empty', () => {
  assert.equal(Maybe.of(1).hasValue(), true);
  assert.equal(Maybe.empty<number>().hasValue(), false);
});

test('Maybe: a present undefined is still empty', () => {
  assert.equal(Maybe.of(undefined).hasValue(), false);
});

test('Maybe: a present falsy value is present', () => {
  assert.equal(Maybe.of(0).hasValue(), true);
  assert.equal(Maybe.of('').hasValue(), true);
  assert.equal(Maybe.of(null).hasValue(), true);
});

test('Maybe: map', () => {
  const doubled = Maybe.of(2).map((n) => n * 2);
  assert.equal(doubled.hasValue(), true);
  if (doubled.hasValue()) assert.equal(doubled.get(), 4);
});

test('Maybe: map on empty does not call the function', () => {
  let called = false;
  const out = Maybe.empty<number>().map(() => { called = true; return 1; });
  assert.equal(called, false);
  assert.equal(out.hasValue(), false);
});

test('describeNamed', () => {
  assert.equal(describeNamed.call({ name: 'ada' }), 'name: ada');
  assert.equal(describeNamed.call({ name: '' }), 'name: ');
});

test('Model.create and User.create', () => {
  assert.ok(Model.create() instanceof Model);
  const u = User.create();
  assert.ok(u instanceof User);
  assert.ok(u instanceof Model);
  assert.equal(u.greet(), 'hello from User');
});
