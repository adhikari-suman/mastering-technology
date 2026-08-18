# 04 — `async` / `await`

Syntax over promises. It doesn't add capability — it makes async code read like
the synchronous code it replaced, and it makes `try/catch` work again.

## The two rules

`async` makes a function **always return a promise**, wrapping whatever you
return. `await` pauses inside that function until a promise settles, then gives
you the value — or throws the rejection.

```js
async function load(id) {
  const user = await fetchUser(id);   // unwraps
  return user.name;                   // wrapped back into a promise
}
```

Returning a promise from an `async` function doesn't double-wrap it; it adopts
it, exactly as `.then` does.

## `try/catch` works again

This is the headline. A rejection becomes a thrown error at the `await`:

```js
try {
  const user = await fetchUser(id);
} catch (err) {
  // catches rejections AND synchronous throws, in one place
} finally {
  // runs either way
}
```

Compare lesson 02, where `try/catch` around a callback caught nothing.

## The mistake everybody makes: accidental serialisation

```js
const a = await slowA();   // 1000ms
const b = await slowB();   // 1000ms — starts only after A finishes
// total: 2000ms
```

Nothing here needs to be sequential. `await` in sequence means *waiting* in
sequence. If the calls are independent, start them both first:

```js
const [a, b] = await Promise.all([slowA(), slowB()]);   // 1000ms total
```

The rule: **`await` at the point you need the value, not the point you start
the work.** Calling the function starts it; `await` only decides when you block.

The same bug in a loop is worse:

```js
for (const id of ids) results.push(await fetch(id));   // strictly one at a time
const results = await Promise.all(ids.map(fetch));     // all at once
```

Sometimes serial *is* what you want — rate limits, ordering, back-pressure. Just
make it a decision rather than an accident.

## Await in the wrong places

**`forEach` ignores async callbacks entirely.** `arr.forEach(async x => ...)`
returns immediately and nothing is awaited. Use `for...of` for serial, or
`map` + `Promise.all` for parallel.

**Top-level `await`** works in ES modules only, and blocks that module's
consumers until it settles.

## Floating promises

Call an async function without `await` or `.catch` and you've created a promise
nobody handles. If it rejects, that's an unhandled rejection — a crash in modern
Node. Either await it, chain a `.catch`, or explicitly collect it.

## What to build

| Export | What it does |
| --- | --- |
| `sequential(tasks)` | Await one at a time; slow but ordered |
| `concurrent(tasks)` | Start together; results in input order |
| `timedSequential/Concurrent` | Prove the timing difference |
| `mapSeries(items, fn)` | Async map, strictly serial |
| `mapParallel(items, fn)` | Async map, all at once |
| `safeCall(fn)` | Never throws — returns `[error, value]` |
| `forEachIsBroken(items, fn)` | Demonstrate the `forEach` trap |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. `return await p` versus `return p` inside an `async` function — when does the
   difference matter? (Hint: put a `try/finally` around it.)
2. Does `await` on a non-promise still yield to the microtask queue? Prove it
   with lesson 01's tools.
3. Write `mapLimit(items, n, fn)` — parallel, but at most `n` at a time. This is
   what production code actually needs.
