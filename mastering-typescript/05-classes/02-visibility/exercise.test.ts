import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { Account, LeakyAccount, isAccount, Vehicle, Car } from './solution.ts';

/* ------------------------------------------------------------------ types */

function _typeOnly(account: Account, leaky: LeakyAccount, car: Car) {
  type _Balance = Expect<Equal<typeof account.balance, number>>;
  type _Wheels = Expect<Equal<ReturnType<typeof car.wheelCount>, number>>;

  // @ts-expect-error - #private is not reachable from outside, at all
  account.balanceValue;

  // @ts-expect-error - TypeScript private is not reachable through the type either
  leaky.balanceValue;

  // @ts-expect-error - protected is visible to subclasses, not to callers
  car.wheels;

  // @ts-expect-error - balance is a getter with no setter
  account.balance = 5;
}

/* ---------------------------------------------------------------- runtime */

test('Account: deposits and withdrawals', () => {
  const a = new Account(100);
  assert.equal(a.balance, 100);
  a.deposit(50);
  assert.equal(a.balance, 150);
  a.withdraw(30);
  assert.equal(a.balance, 120);
});

test('Account: rejects nonsense amounts', () => {
  const a = new Account(100);
  assert.throws(() => a.deposit(0), RangeError);
  assert.throws(() => a.deposit(-1), RangeError);
  assert.throws(() => a.withdraw(0), RangeError);
  assert.throws(() => a.withdraw(101), RangeError);
  assert.doesNotThrow(() => a.withdraw(100), 'the whole balance is allowed');
});

test('Account: the balance is invisible to reflection', () => {
  const a = new Account(100);
  assert.deepEqual(Object.keys(a), [], 'no own enumerable properties');
  assert.equal(JSON.stringify(a), '{"type":"account"}');
  assert.equal(Reflect.ownKeys(a).length, 0);
});

test('LeakyAccount: TypeScript `private` is a convention, not a wall', () => {
  const a = new LeakyAccount(100);
  assert.equal(a.balance, 100);
  assert.deepEqual(Object.keys(a), ['balanceValue'], 'right there in the open');
  assert.equal(JSON.stringify(a), '{"balanceValue":100}', 'and in your logs');
});

test('isAccount uses the private field as a brand', () => {
  assert.equal(isAccount(new Account(1)), true);
  assert.equal(isAccount(new LeakyAccount(1)), false, 'same shape, different brand');
  assert.equal(isAccount({ balance: 1 }), false);
  assert.equal(isAccount(null), false);
  assert.equal(isAccount(undefined), false);
  assert.equal(isAccount('account'), false);
});

test('Vehicle and Car', () => {
  const v = new Vehicle(2);
  assert.equal(v.describe(), 'Vehicle with 2 wheels');
  const c = new Car();
  assert.equal(c.describe(), 'Car with 4 wheels');
  assert.equal(c.wheelCount(), 4, 'a subclass can read protected');
});

test('Car is a Vehicle', () => {
  assert.ok(new Car() instanceof Vehicle);
});
