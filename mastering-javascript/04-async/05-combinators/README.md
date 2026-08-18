# 05 — Combinators and Cancellation

Four static methods for running promises together, and the standard way to stop
work you no longer want.

## The four combinators

| | Resolves when | Rejects when | Gives you |
| --- | --- | --- | --- |
| `all` | **all** fulfil | **any** rejects | array of values |
| `allSettled` | all settle | never | array of `{status, value/reason}` |
| `race` | **first** settles | first settles as rejected | that one outcome |
| `any` | **first** fulfils | **all** reject | first value, or `AggregateError` |

`all` is fail-fast: one rejection rejects the whole thing immediately, and **the
other promises keep running**. Nothing is cancelled — you just stop listening.
That matters if they have side effects.

`allSettled` is what you want for "do all of these, tell me how each went" —
batch jobs, parallel saves, anything where partial success is meaningful.

`race` settles on the first result whichever way it goes. `any` ignores
rejections until every one has failed. Use `race` for timeouts, `any` for
redundant sources where you want the first that works.

## The empty-array edge

Worth memorising, because they disagree:

```js
Promise.all([])          // resolves to []
Promise.allSettled([])   // resolves to []
Promise.any([])          // REJECTS with AggregateError
Promise.race([])         // pending forever — never settles
```

## Cancellation: `AbortController`

Promises have no cancel method. A promise is a *view* of a result, not a handle
on the work. The platform's answer is a separate signal object:

```js
const controller = new AbortController();
const { signal } = controller;

fetch(url, { signal });      // the API watches the signal
controller.abort();          // rejects with an AbortError
```

To make your own function abortable, listen to the signal and check whether it
already fired:

```js
function abortableWait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const id = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(id);            // ← actually stop the work
      reject(signal.reason);
    }, { once: true });
  });
}
```

Two things people skip: checking `signal.aborted` **before** starting, and
actually cleaning up the underlying work rather than just rejecting. A rejection
without the `clearTimeout` leaves the timer running.

`AbortSignal.timeout(ms)` gives you a signal that aborts itself — a cleaner
timeout than racing.

## What to build

| Export | What it does |
| --- | --- |
| `all` / `allSettled` / `race` / `any` | Implement all four yourself |
| `abortableWait(ms, signal)` | Cancellable delay, with cleanup |
| `mapLimit(items, limit, fn)` | Parallel, capped concurrency |

Use only `new Promise`, `.then` and `.catch` — not the built-in combinators.

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. `Promise.all` rejects fast, but the other promises still run to completion.
   Prove it, then decide when that's a bug.
2. `any` rejects with `AggregateError`. What's in its `.errors`, and how does
   that differ from a normal `Error`?
3. Does your `mapLimit` preserve order? Should it start the next item the
   instant one finishes, or in batches? The difference matters under load.
