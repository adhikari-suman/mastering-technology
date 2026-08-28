import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { pick, makeGreeter, describeServer, totalKnown, firstPresent } from './solution.ts';
import type { Config } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Pick = Expect<Equal<ReturnType<typeof pick>, string>>;
type _Greeter = Expect<Equal<ReturnType<typeof makeGreeter>, () => string>>;
type _First = Expect<Equal<ReturnType<typeof firstPresent>, string | undefined>>;
type _Config = Expect<Equal<Config, { server?: { host?: string; port?: number } }>>;

declare function sideEffect(): void;

function _aliasedConditions(v: string | number) {
  // A guard stored in a const still narrows.
  const isStr = typeof v === 'string';
  if (isStr) {
    const got = v;
    type _ = Expect<Equal<typeof got, string>>;
  }
}

function _letNeverReassigned(v: string | null) {
  // `let` is fine too — the rule is about assignment, not the keyword.
  let x = v;
  if (x !== null) {
    const inClosure = () => {
      const got = x;
      type _ = Expect<Equal<typeof got, string>>;
      return got;
    };
    inClosure();
  }
}

function _letReassignedLater(v: string | null) {
  let x = v;
  if (x !== null) {
    const inClosure = () => {
      // @ts-expect-error - x is reassigned at the bottom of this function
      x.length;
    };
    inClosure();
  }
  x = null;
}

function _elementAccess(xs: (string | undefined)[], i: number) {
  if (xs[i] !== undefined) {
    const got = xs[i];
    type _ = Expect<Equal<typeof got, string>>;
  }
}

function _propertyNarrowingOutlivesCalls(o: { a: { b?: string } }) {
  if (o.a.b !== undefined) {
    sideEffect();               // could have cleared it; the checker does not care
    const got = o.a.b;
    type _ = Expect<Equal<typeof got, string>>;
  }
}

function _optionalChain(config: Config) {
  if (config.server?.host !== undefined) {
    const got = config.server.host;
    type _ = Expect<Equal<typeof got, string>>;
  }
}

/* ---------------------------------------------------------------- runtime */

test('pick', () => {
  assert.equal(pick(['a', 'b'], 0, 'x'), 'a');
  assert.equal(pick(['a', 'b'], 1, 'x'), 'b');
  assert.equal(pick(['a', 'b'], 5, 'x'), 'x', 'out of range');
  assert.equal(pick(['a', undefined], 1, 'x'), 'x', 'present but undefined');
  assert.equal(pick([], 0, 'x'), 'x');
  assert.equal(pick(['a'], -1, 'x'), 'x', 'negative index');
});

test('pick keeps an empty string, which is a real value', () => {
  assert.equal(pick([''], 0, 'x'), '');
});

test('makeGreeter', () => {
  assert.equal(makeGreeter('ada')(), 'hello ada');
  assert.equal(makeGreeter(null)(), 'hello stranger');
  assert.equal(makeGreeter('')(), 'hello ', 'empty is not absent');
});

test('makeGreeter returns a reusable function', () => {
  const greet = makeGreeter('grace');
  assert.equal(greet(), 'hello grace');
  assert.equal(greet(), 'hello grace');
});

test('describeServer', () => {
  assert.equal(describeServer({ server: { host: 'localhost', port: 8080 } }), 'localhost:8080');
  assert.equal(describeServer({ server: { host: 'localhost' } }), 'localhost');
  assert.equal(describeServer({ server: {} }), 'unconfigured');
  assert.equal(describeServer({}), 'unconfigured');
  assert.equal(describeServer({ server: { port: 80 } }), 'unconfigured', 'a port alone is not enough');
});

test('totalKnown', () => {
  assert.equal(totalKnown([1, null, 2]), 3);
  assert.equal(totalKnown([]), 0);
  assert.equal(totalKnown([null, null]), 0);
  assert.equal(totalKnown([0, null, 0]), 0);
  assert.equal(totalKnown([-1, 1]), 0);
});

test('firstPresent', () => {
  const env = { B: 'second', C: undefined, D: 'fourth' };
  assert.equal(firstPresent(env, ['A', 'B', 'D']), 'second');
  assert.equal(firstPresent(env, ['C', 'D']), 'fourth', 'undefined does not count as present');
  assert.equal(firstPresent(env, ['A', 'C']), undefined);
  assert.equal(firstPresent(env, []), undefined);
  assert.equal(firstPresent({}, ['A']), undefined);
});

test('firstPresent keeps an empty string', () => {
  assert.equal(firstPresent({ A: '' }, ['A']), '');
});
