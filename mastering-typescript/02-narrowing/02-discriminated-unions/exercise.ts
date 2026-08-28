/**
 * Part 02, Lesson 02 — Discriminated unions
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `as`, no `any`, and no optional properties. If you reach for `?`,
 * the union is missing a member.
 */

/**
 * The four states of a request, generic in its payload:
 *
 *   idle                          nothing has happened
 *   loading    startedAt: number  a millisecond timestamp
 *   success    data: T            the payload
 *   failure    error: string      why it failed
 *
 * Tag every member with a `status` property holding a string literal.
 */
export type RequestState<T> = unknown; // TODO

/**
 * The events that drive it:
 *
 *   start     at: number
 *   resolve   data: unknown       narrowed by the caller's T at the use site
 *   reject    error: string
 *   reset
 *
 * Tag every member with a `type` property. Note it is NOT called `status` —
 * one union's discriminant has nothing to do with another's.
 */
export type Event<T> = unknown; // TODO

/**
 * The reducer. Given a state and an event, produce the next state:
 *
 *   any state    + reset    -> idle
 *   idle         + start    -> loading
 *   loading      + resolve  -> success
 *   loading      + reject   -> failure
 *   anything else            -> the state unchanged (returned as-is)
 *
 * A `resolve` arriving while idle is not an error; it is ignored.
 */
export function transition<T>(state: RequestState<T>, event: Event<T>): RequestState<T> {
  throw new Error('transition: not implemented');
}

/** The payload when the request succeeded, and `undefined` otherwise. */
export function dataOf<T>(state: RequestState<T>): T | undefined {
  throw new Error('dataOf: not implemented');
}

/** Whether the request has finished — success or failure, but not idle or loading. */
export function isSettled<T>(state: RequestState<T>): boolean {
  throw new Error('isSettled: not implemented');
}

/**
 * One line of status:
 *   'idle'                'loading since 1000'
 *   'ok'                  'failed: timeout'
 */
export function summarize<T>(state: RequestState<T>): string {
  throw new Error('summarize: not implemented');
}
