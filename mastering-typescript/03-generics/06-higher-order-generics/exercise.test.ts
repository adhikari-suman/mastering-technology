import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { once, memoize, curry2, partial, pipe } from './solution.ts';

/* ------------------------------------------------------------------ types */

declare function three(a: number, b: string, c: boolean): symbol;

function _typeOnly() {
  // The wrapper keeps the whole signature.
  const wrapped = once(three);
  type _Once = Expect<Equal<typeof wrapped, (a: number, b: string, c: boolean) => symbol>>;

  const cached = memoize((n: number) => String(n));
  type _Memo = Expect<Equal<typeof cached, (n: number) => string>>;

  // @ts-expect-error - the wrapper is as strict as the original
  cached('x');

  const curried = curry2((a: number, b: string) => a + b);
  type _Curried = Expect<Equal<typeof curried, (a: number) => (b: string) => string>>;

  // The split is decided by how many arguments were passed.
  const p1 = partial(three, 1);
  type _P1 = Expect<Equal<typeof p1, (b: string, c: boolean) => symbol>>;
  const p2 = partial(three, 1, 'x');
  type _P2 = Expect<Equal<typeof p2, (c: boolean) => symbol>>;
  const p0 = partial(three);
  type _P0 = Expect<Equal<typeof p0, (a: number, b: string, c: boolean) => symbol>>;

  // @ts-expect-error - the bound arguments are checked against the real ones
  partial(three, 'wrong');

  const two = pipe((n: number) => String(n), (s: string) => s.length);
  type _Two = Expect<Equal<typeof two, (a: number) => number>>;
  const threeStep = pipe((n: number) => String(n), (s: string) => s.length, (n: number) => n > 0);
  type _Three = Expect<Equal<typeof threeStep, (a: number) => boolean>>;

  // @ts-expect-error - the second step must take the first step's output
  pipe((n: number) => String(n), (n: number) => n + 1);
}

/* ---------------------------------------------------------------- runtime */

test('once calls through exactly once', () => {
  let calls = 0;
  const f = once((n: number) => { calls++; return n * 2; });
  assert.equal(f(1), 2);
  assert.equal(f(5), 2, 'later arguments are ignored');
  assert.equal(f(9), 2);
  assert.equal(calls, 1);
});

test('once caches a falsy result too', () => {
  let calls = 0;
  const f = once(() => { calls++; return undefined; });
  assert.equal(f(), undefined);
  assert.equal(f(), undefined);
  assert.equal(calls, 1);
});

test('memoize caches per argument list', () => {
  let calls = 0;
  const f = memoize((a: number, b: number) => { calls++; return a + b; });
  assert.equal(f(1, 2), 3);
  assert.equal(f(1, 2), 3);
  assert.equal(calls, 1);
  assert.equal(f(2, 3), 5);
  assert.equal(calls, 2);
});

test('memoize distinguishes argument order', () => {
  let calls = 0;
  const f = memoize((a: number, b: number) => { calls++; return a - b; });
  assert.equal(f(1, 2), -1);
  assert.equal(f(2, 1), 1);
  assert.equal(calls, 2);
});

test('memoize caches a falsy result', () => {
  let calls = 0;
  const f = memoize((n: number) => { calls++; return n * 0; });
  assert.equal(f(5), 0);
  assert.equal(f(5), 0);
  assert.equal(calls, 1);
});

test('curry2', () => {
  const add = curry2((a: number, b: string) => a + b);
  assert.equal(add(1)('x'), '1x');
});

test('curry2: the first stage is reusable', () => {
  const prefix = curry2((a: string, b: string) => a + b)('>');
  assert.equal(prefix('a'), '>a');
  assert.equal(prefix('b'), '>b');
});

test('partial', () => {
  const f = (a: number, b: string, c: boolean) => `${a}${b}${c}`;
  assert.equal(partial(f, 1)('x', true), '1xtrue');
  assert.equal(partial(f, 1, 'x')(false), '1xfalse');
  assert.equal(partial(f)(2, 'y', true), '2ytrue');
});

test('partial: the bound arguments are reusable', () => {
  const f = (a: number, b: number) => a + b;
  const addTen = partial(f, 10);
  assert.equal(addTen(1), 11);
  assert.equal(addTen(2), 12);
});

test('pipe', () => {
  assert.equal(pipe((n: number) => String(n), (s: string) => s.length)(123), 3);
  assert.equal(
    pipe((n: number) => String(n), (s: string) => s.length, (n: number) => n > 2)(123),
    true,
  );
});

test('pipe runs left to right', () => {
  const order: string[] = [];
  pipe(
    (n: number) => { order.push('first'); return n; },
    (n: number) => { order.push('second'); return n; },
  )(1);
  assert.deepEqual(order, ['first', 'second']);
});
