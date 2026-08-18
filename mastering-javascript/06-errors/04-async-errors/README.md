# 04 — Errors in Async Code

Everything from lessons 01–03, plus the ways asynchrony breaks it.

## `try/catch` works with `await`, and only with `await`

```js
try {
  const user = await fetchUser(id);      // caught
} catch (err) { }
```

Remove the `await` and the catch becomes decorative:

```js
try {
  fetchUser(id);        // NOT caught — the rejection happens after try exits
} catch (err) { }       // never runs
```

The `try` block finishes synchronously, long before the promise settles. Same
reason a callback couldn't be caught in lesson 02.

## Floating promises

A promise nobody handles is the async equivalent of an ignored error. Since Node
15 an unhandled rejection **crashes the process** by default.

```js
async function save() { throw new Error('boom'); }
save();                  // floating — crashes the process
save().catch(log);       // handled
await save();            // handled by the caller's try/catch
void save();             // still floating; `void` fixes lint, not behaviour
```

If you deliberately want fire-and-forget, attach a `.catch` — that's the
difference between "I chose to ignore this" and "I forgot".

## `Promise.all` loses errors

```js
await Promise.all([saveA(), saveB()]);   // B's failure is invisible if A fails first
```

`all` rejects with the *first* rejection and discards the rest. If both matter,
`allSettled` and inspect. This is the most common way a failure disappears in
production.

Worse: the losing promises keep running. Their side effects still happen.

## Errors in a `finally`

An async `finally` that throws replaces the original error, exactly as in
lesson 01. Cleanup that can fail needs its own `try/catch`.

## Timeouts don't cancel

`Promise.race([work(), timeout(1000)])` gives you a timeout *notification*. The
work carries on — writing to the database, holding the connection. Cancellation
needs `AbortController` from Part 04 lesson 05.

## `unhandledRejection`

Node emits a process event you can listen to for logging. It's a last-resort
safety net for observability, never a substitute for handling.

## What to build

| Export | What it does |
| --- | --- |
| `catchAsync(fn)` | Async `[error, value]` |
| `missingAwait()` | Demonstrate the uncaught case |
| `withAwait()` | The same, done right |
| `settleAll(promises)` | `allSettled` split into successes and failures |
| `firstError(promises)` | All failures, not just the first |
| `withAsyncCleanup(fn, cleanup)` | Cleanup that can't mask the error |
| `guardFloating(promise, onError)` | Make a fire-and-forget explicit |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. Register `process.on('unhandledRejection')`, then float a rejecting promise.
   How long after the rejection does it fire, and why not immediately?
2. `return await p` versus `return p` inside a `try` — one of them catches the
   rejection and the other doesn't. Which, and why?
3. `Promise.all` with two failures: prove the second promise still ran and its
   side effect still happened.
