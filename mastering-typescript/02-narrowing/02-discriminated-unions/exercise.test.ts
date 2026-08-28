import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { transition, dataOf, isSettled, summarize } from './solution.ts';
import type { RequestState, Event } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _State = Expect<
  Equal<
    RequestState<number>,
    | { status: 'idle' }
    | { status: 'loading'; startedAt: number }
    | { status: 'success'; data: number }
    | { status: 'failure'; error: string }
  >
>;

type _Event = Expect<
  Equal<
    Event<number>,
    | { type: 'start'; at: number }
    | { type: 'resolve'; data: unknown }
    | { type: 'reject'; error: string }
    | { type: 'reset' }
  >
>;

// The discriminants are literal unions, derived rather than retyped.
type _Status = Expect<Equal<RequestState<number>['status'], 'idle' | 'loading' | 'success' | 'failure'>>;

function _typeOnly(state: RequestState<string>) {
  // The tag reaches exactly one member.
  if (state.status === 'success') {
    type _Data = Expect<Equal<typeof state.data, string>>;
    type _Member = Expect<Equal<typeof state, { status: 'success'; data: string }>>;
  }
  if (state.status === 'loading') {
    type _Started = Expect<Equal<typeof state.startedAt, number>>;
  }
  // Ruling one out narrows the rest.
  if (state.status !== 'idle') {
    type _Rest = Expect<Equal<typeof state.status, 'loading' | 'success' | 'failure'>>;
  }

  // @ts-expect-error - `data` exists on exactly one member, and this isn't it
  state.data;

  // @ts-expect-error - illegal states are unrepresentable: no data on a failure
  const _bad: RequestState<string> = { status: 'failure', error: 'x', data: 'y' };

  // @ts-expect-error - loading needs its timestamp
  const _incomplete: RequestState<string> = { status: 'loading' };
}

/* ---------------------------------------------------------------- runtime */

const idle = { status: 'idle' } as const;
const loading = { status: 'loading', startedAt: 1000 } as const;

test('transition: idle + start -> loading', () => {
  assert.deepEqual(transition<number>(idle, { type: 'start', at: 1000 }), {
    status: 'loading',
    startedAt: 1000,
  });
});

test('transition: loading + resolve -> success', () => {
  assert.deepEqual(transition<number>(loading, { type: 'resolve', data: 42 }), {
    status: 'success',
    data: 42,
  });
});

test('transition: loading + reject -> failure', () => {
  assert.deepEqual(transition<number>(loading, { type: 'reject', error: 'timeout' }), {
    status: 'failure',
    error: 'timeout',
  });
});

test('transition: reset always goes to idle', () => {
  assert.deepEqual(transition<number>(loading, { type: 'reset' }), { status: 'idle' });
  assert.deepEqual(transition<number>({ status: 'success', data: 1 }, { type: 'reset' }), {
    status: 'idle',
  });
  assert.deepEqual(transition<number>(idle, { type: 'reset' }), { status: 'idle' });
});

test('transition: an event that does not apply leaves the state alone', () => {
  const same = transition<number>(idle, { type: 'resolve', data: 1 });
  assert.deepEqual(same, idle);
  assert.equal(same, idle, 'returned as-is, not rebuilt');
  assert.deepEqual(transition<number>(loading, { type: 'start', at: 2 }), loading);
});

test('dataOf', () => {
  assert.equal(dataOf<number>({ status: 'success', data: 7 }), 7);
  assert.equal(dataOf<number>(idle), undefined);
  assert.equal(dataOf<number>(loading), undefined);
  assert.equal(dataOf<number>({ status: 'failure', error: 'x' }), undefined);
});

test('dataOf: a falsy payload is still a payload', () => {
  assert.equal(dataOf<number>({ status: 'success', data: 0 }), 0);
  assert.equal(dataOf<string>({ status: 'success', data: '' }), '');
});

test('isSettled', () => {
  assert.equal(isSettled<number>({ status: 'success', data: 1 }), true);
  assert.equal(isSettled<number>({ status: 'failure', error: 'x' }), true);
  assert.equal(isSettled<number>(idle), false);
  assert.equal(isSettled<number>(loading), false);
});

test('summarize', () => {
  assert.equal(summarize<number>(idle), 'idle');
  assert.equal(summarize<number>(loading), 'loading since 1000');
  assert.equal(summarize<number>({ status: 'success', data: 1 }), 'ok');
  assert.equal(summarize<number>({ status: 'failure', error: 'timeout' }), 'failed: timeout');
});
