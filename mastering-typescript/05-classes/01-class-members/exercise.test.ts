import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { Counter, Config, Temperature } from './solution.ts';

/* ------------------------------------------------------------------ types */

function _typeOnly(config: Config, temp: Temperature) {
  type _Created = Expect<Equal<typeof Counter.created, number>>;
  type _Host = Expect<Equal<typeof config.host, string>>;
  type _Port = Expect<Equal<typeof config.port, number>>;
  type _Label = Expect<Equal<typeof config.label, string | undefined>>;
  // The honest annotation, not a definite-assignment assertion.
  type _LoadedAt = Expect<Equal<typeof config.loadedAt, number | undefined>>;
  type _Unit = Expect<Equal<typeof temp.unit, 'C'>>;
  type _Load = Expect<Equal<ReturnType<typeof config.load>, Config>>;

  // @ts-expect-error - host is readonly
  config.host = 'other';
  // @ts-expect-error - port is readonly
  config.port = 1;
  // @ts-expect-error - unit is readonly
  temp.unit = 'C';
}

/* ---------------------------------------------------------------- runtime */

test('Counter: starting value and increment', () => {
  const c = new Counter();
  assert.equal(c.value, 0);
  assert.equal(c.increment(), 1);
  assert.equal(c.increment(5), 6);
  assert.equal(c.value, 6);
});

test('Counter: an explicit start', () => {
  const c = new Counter(10);
  assert.equal(c.value, 10);
  c.increment();
  assert.equal(c.value, 11);
});

test('Counter: reset returns to the starting value, not to zero', () => {
  const c = new Counter(10);
  c.increment(5);
  c.reset();
  assert.equal(c.value, 10);
});

test('Counter: instances are independent', () => {
  const a = new Counter();
  const b = new Counter();
  a.increment();
  assert.equal(b.value, 0);
});

test('Counter: the static block gives `created` its zero', () => {
  Counter.reset();
  assert.equal(Counter.created, 0);
  new Counter();
  new Counter(3);
  assert.equal(Counter.created, 2);
  Counter.reset();
  assert.equal(Counter.created, 0);
});

test('Config: defaults and optionals', () => {
  const c = new Config('localhost');
  assert.equal(c.host, 'localhost');
  assert.equal(c.port, 8080);
  assert.equal(c.label, undefined);

  const d = new Config('example.com', 443, 'prod');
  assert.equal(d.port, 443);
  assert.equal(d.label, 'prod');
});

test('Config: loadedAt is absent until load() runs', () => {
  const c = new Config('localhost');
  assert.equal(c.isLoaded(), false);
  assert.equal(c.loadedAt, undefined);
  c.load();
  assert.equal(c.isLoaded(), true);
  assert.equal(typeof c.loadedAt, 'number');
});

test('Config: load returns this, so it chains', () => {
  const c = new Config('localhost');
  assert.equal(c.load(), c);
  assert.equal(c.load().isLoaded(), true);
});

test('Temperature: celsius round-trips', () => {
  const t = new Temperature(20);
  assert.equal(t.celsius, 20);
  t.celsius = 30;
  assert.equal(t.celsius, 30);
});

test('Temperature: fahrenheit is computed both ways', () => {
  const t = new Temperature(100);
  assert.equal(t.fahrenheit, 212);
  t.fahrenheit = 32;
  assert.equal(t.celsius, 0);
  t.celsius = -40;
  assert.equal(t.fahrenheit, -40, 'the one place the scales meet');
});

test('Temperature: absolute zero is enforced by both setters', () => {
  const t = new Temperature(0);
  assert.throws(() => { t.celsius = -300; }, RangeError);
  assert.throws(() => { t.fahrenheit = -500; }, RangeError);
  assert.doesNotThrow(() => { t.celsius = -273.15; }, 'the boundary itself is legal');
});

test('Temperature: the constructor validates too', () => {
  assert.throws(() => new Temperature(-300), RangeError);
});

test('Temperature: unit', () => {
  assert.equal(new Temperature(0).unit, 'C');
});
