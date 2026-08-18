# 06 — Build a Promise

The capstone. You've used promises for four lessons; now implement one. When
this passes, nothing about promises is a black box any more.

## What you're building

A `MyPromise` class supporting `then`, `catch`, `finally` and the static
helpers, satisfying the behaviours the real thing guarantees.

## The state machine

Three states, one irreversible transition:

```
pending ──resolve──> fulfilled (has a value)
        └─reject───> rejected  (has a reason)
```

Every guard follows from "settle once": `resolve` and `reject` must both check
whether the state is still `pending` and return silently otherwise. Call
`resolve` twice and the second call is ignored — that's the guarantee callbacks
couldn't give you.

## The four hard parts

**1. Handlers registered before settling.** `then` can be called while pending,
so you must queue those callbacks and run them when the promise settles. Keep
two arrays, or one array of `{onFulfilled, onRejected}` pairs.

**2. Handlers are always asynchronous.** Even on an already-settled promise,
`then` callbacks must run on the microtask queue, never synchronously.
`queueMicrotask` is the tool. This is lesson 01 made load-bearing: skip it and
your promise runs handlers in the wrong order relative to real ones.

**3. `then` returns a new promise, and the result flows into it.** The
resolution procedure:

- handler returns a plain value → resolve the new promise with it
- handler throws → reject the new promise
- handler returns a **thenable** → adopt it: wait for it, take its outcome
- handler is missing → pass the value or reason straight through

That last one is how errors skip past `.then`s to reach a `.catch`, and how
values skip past `.catch`s.

**4. Adoption.** If `resolve` is called with something having a `.then` method,
you don't store it — you subscribe to it. This is what makes chains flatten
instead of nesting.

## Derived, not special

`catch(fn)` is exactly `then(undefined, fn)`.

`finally(fn)` is `then(v => { fn(); return v; }, e => { fn(); throw e; })` —
runs on both paths, passes through, ignores its own return value.

Write them that way, in terms of `then`. If `then` is right, they're free.

## What to build

| Export | What it does |
| --- | --- |
| `MyPromise` | The class: `then`, `catch`, `finally` |
| `MyPromise.resolve` / `.reject` | Static shortcuts |
| `MyPromise.all` / `.allSettled` / `.race` | Statics returning MyPromise |
| `deferred()` | `{ promise, resolve, reject }` for imperative settling |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. The real spec is Promises/A+, and its test suite has 872 cases. Read the
   resolution procedure §2.3 and find one edge your version gets wrong.
2. What should happen if you resolve a promise with **itself**? The spec is
   explicit; most hand-rolled versions hang forever.
3. Your `then` calls `queueMicrotask`. Replace it with `setTimeout` and rerun
   lesson 01's ordering tests. What breaks, and why?
