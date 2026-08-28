import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import {
  ok, err, isOk, isErr, map, mapErr, flatMap, unwrapOr, unwrap, all, tryCatch,
} from './solution.ts';
import type { Result } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Result = Expect<
  Equal<Result<number, string>, { ok: true; value: number } | { ok: false; error: string }>
>;
type _Default = Expect<Equal<Result<number>, Result<number, Error>>>;

function _typeOnly(result: Result<number, string>) {
  // @ts-expect-error - the value is not reachable without checking
  result.value;

  if (isOk(result)) {
    const value = result.value;
    type _Value = Expect<Equal<typeof value, number>>;
  } else {
    const error = result.error;
    type _Error = Expect<Equal<typeof error, string>>;
  }

  if (isErr(result)) {
    const error = result.error;
    type _Error2 = Expect<Equal<typeof error, string>>;
  }

  // Chaining accumulates the failure types into a union.
  const chained = flatMap(result, (n) => (n > 0 ? ok(String(n)) : err(404 as const)));
  type _Chained = Expect<Equal<typeof chained, Result<string, string | 404>>>;

  const mapped = map(result, (n) => n > 0);
  type _Mapped = Expect<Equal<typeof mapped, Result<boolean, string>>>;

  const remapped = mapErr(result, (e) => e.length);
  type _Remapped = Expect<Equal<typeof remapped, Result<number, number>>>;

  const bridged = tryCatch(() => 1);
  type _Bridged = Expect<Equal<typeof bridged, Result<number, unknown>>>;
}

/* ---------------------------------------------------------------- runtime */

test('ok and err', () => {
  assert.deepEqual(ok(1), { ok: true, value: 1 });
  assert.deepEqual(err('bad'), { ok: false, error: 'bad' });
});

test('ok and err carry falsy payloads', () => {
  assert.deepEqual(ok(0), { ok: true, value: 0 });
  assert.deepEqual(ok(undefined), { ok: true, value: undefined });
  assert.deepEqual(err(''), { ok: false, error: '' });
});

test('isOk and isErr', () => {
  assert.equal(isOk(ok(1)), true);
  assert.equal(isOk(err('x')), false);
  assert.equal(isErr(err('x')), true);
  assert.equal(isErr(ok(1)), false);
});

test('map', () => {
  assert.deepEqual(map(ok(2), (n) => n * 2), { ok: true, value: 4 });
  assert.deepEqual(map(err('x'), (n: number) => n * 2), { ok: false, error: 'x' });
});

test('map does not call the function on a failure', () => {
  let called = false;
  map(err('x'), (n: number) => { called = true; return n; });
  assert.equal(called, false);
});

test('mapErr', () => {
  assert.deepEqual(mapErr(err('x'), (e) => e.toUpperCase()), { ok: false, error: 'X' });
  assert.deepEqual(mapErr(ok(1), (e: string) => e), { ok: true, value: 1 });
});

test('flatMap', () => {
  assert.deepEqual(flatMap(ok(2), (n) => ok(n * 2)), { ok: true, value: 4 });
  assert.deepEqual(flatMap(ok(2), () => err('inner')), { ok: false, error: 'inner' });
  assert.deepEqual(flatMap(err('outer'), () => ok(1)), { ok: false, error: 'outer' });
});

test('flatMap chains', () => {
  const parseNum = (s: string) => (Number.isNaN(Number(s)) ? err('nan') : ok(Number(s)));
  const half = (n: number) => (n % 2 === 0 ? ok(n / 2) : err('odd'));
  assert.deepEqual(flatMap(parseNum('4'), half), { ok: true, value: 2 });
  assert.deepEqual(flatMap(parseNum('3'), half), { ok: false, error: 'odd' });
  assert.deepEqual(flatMap(parseNum('x'), half), { ok: false, error: 'nan' });
});

test('unwrapOr', () => {
  assert.equal(unwrapOr(ok(1), 9), 1);
  assert.equal(unwrapOr(err('x'), 9), 9);
  assert.equal(unwrapOr(ok(0), 9), 0, 'zero is a value');
});

test('unwrap', () => {
  assert.equal(unwrap(ok(1)), 1);
  assert.throws(() => unwrap(err('boom')), { message: 'unwrap on an error result: boom' });
});

test('all', () => {
  assert.deepEqual(all([ok(1), ok(2)]), { ok: true, value: [1, 2] });
  assert.deepEqual(all([]), { ok: true, value: [] });
  assert.deepEqual(all([ok(1), err('a')]), { ok: false, error: 'a' });
});

test('all reports the FIRST error', () => {
  assert.deepEqual(all([ok(1), err('a'), err('b')]), { ok: false, error: 'a' });
});

test('tryCatch', () => {
  assert.deepEqual(tryCatch(() => 1), { ok: true, value: 1 });
  const failed = tryCatch(() => { throw new Error('boom'); });
  assert.equal(isErr(failed), true);
  if (isErr(failed)) {
    assert.ok(failed.error instanceof Error);
    assert.equal(failed.error.message, 'boom');
  }
});

test('tryCatch catches non-Error throws too', () => {
  const thrown = tryCatch(() => { throw 'a string'; });
  assert.deepEqual(thrown, { ok: false, error: 'a string' });
  const nothing = tryCatch(() => { throw undefined; });
  assert.deepEqual(nothing, { ok: false, error: undefined });
});
