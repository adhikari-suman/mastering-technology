# 03 — Promises

A promise is an object representing a value that isn't ready yet. It fixes the
three things lesson 02 exposed: nesting, uncatchable errors, and callbacks that
fire the wrong number of times.

## Three states, one transition

`pending` → `fulfilled` **or** `rejected`. Once settled, permanently — a promise
cannot change its mind, and its handlers run exactly once. That guarantee is
structural, not conventional.

```js
const p = new Promise((resolve, reject) => {
  if (ok) resolve(value);
  else reject(new Error('nope'));
});
```

The executor runs **synchronously**, immediately. Only the handlers are async.

## Chaining is flattening

`.then` always returns a **new** promise. What you return from a handler decides
what it resolves to:

```js
p.then((v) => v * 2)              // resolves to the value
 .then((v) => somePromise(v))     // waits for it, resolves to ITS value
 .then((v) => { throw new Error('x'); })   // rejects
```

Returning a promise from a handler **adopts** it rather than nesting it. That's
the whole fix for callback pyramids: sequential steps stay flat.

Forgetting to `return` inside a handler is the single most common promise bug —
the next `.then` gets `undefined` and runs too early.

## Errors travel down the chain

A rejection skips every `.then` until it finds a `.catch`:

```js
step1().then(step2).then(step3).catch(handleAnyOf them);
```

`.catch(fn)` is just `.then(undefined, fn)`. Two things worth knowing:

**`.then(onOk, onErr)` does not catch errors thrown by `onOk`** — the handler
pair is chosen before `onOk` runs. `.catch` after it does.

**A `.catch` that returns a value recovers the chain.** Subsequent `.then`s run
normally with that value. To keep failing, re-throw.

`.finally(fn)` runs either way, passes the value or rejection through untouched,
and ignores what `fn` returns — for cleanup.

## Unhandled rejections

A rejected promise with no rejection handler is a process-level warning in Node
and, since v15, **crashes the process by default**. Both branches of every chain
need somewhere to land.

## `Promise.resolve` and `.reject`

Shortcuts for already-settled promises. `Promise.resolve(x)` on a promise
returns it unchanged, which makes it a useful normaliser: `Promise.resolve(maybePromise)`
gives you a promise either way.

## What to build

| Export | What it does |
| --- | --- |
| `wait(ms)` | A promise resolving after a delay |
| `resolveAfter(ms, value)` / `rejectAfter(ms, error)` | Building blocks |
| `chain(value, ...fns)` | Thread a value through async steps, flat |
| `retry(fn, attempts)` | Re-run a failing async function |
| `withTimeout(promise, ms)` | Reject if it takes too long |
| `settle(promise)` | Never rejects — reports `{ status, value/reason }` |
| `tapPromise(fn)` | Part 02's `tap`, for promise chains |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. What's the difference between `p.then(f).catch(g)` and `p.then(f, g)`? Build
   a case where they behave differently.
2. `Promise.resolve(promise) === promise` — true or false? What about
   `new Promise(r => r(promise))`?
3. A `.finally` that throws — what happens to the original value?
