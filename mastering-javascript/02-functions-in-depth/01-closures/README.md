# 01 — Closures

A closure is a function bundled together with the scope it was created in. The
function keeps that scope alive for as long as it lives — even after the
function that built it has returned.

You already made one in Part 01, lesson 04:

```js
function makeCounter() {
  let count = 1;
  return () => count++;   // still reaches `count` after makeCounter has returned
}
```

That worked. This lesson is about *why*, and about the four things closures are
actually for.

## Scope is lexical, not dynamic

Where a function can look up a variable is decided by **where it was written**,
not by where it was called from:

```js
const x = 'outer';

function show() {
  console.log(x);      // always 'outer'
}

function caller() {
  const x = 'inner';
  show();              // still logs 'outer'
}
```

`show` was *written* next to the outer `x`, so that's the `x` it sees, forever.
This is the single rule behind every closure question — nothing else is going on.

## The variable is shared, not copied

This is the part people get wrong. A closure captures the **binding**, not the
value at capture time:

```js
function make() {
  let n = 0;
  const read = () => n;
  const bump = () => { n += 1; };
  return { read, bump };
}

const c = make();
c.read();   // 0
c.bump();
c.read();   // 1  <- read sees bump's change; they share one `n`
```

Two functions closing over the same variable see each other's writes. That's
what makes private state possible — and what makes the loop bug below happen.

## The classic loop bug

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 3, 3, 3
```

`var` is function-scoped, so all three callbacks close over **one** `i`. By the
time the timeouts run, the loop has finished and that single `i` is `3`.

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 0, 1, 2
```

`let` creates a **fresh binding each iteration**, so each callback closes over
its own `i`. This is the most-asked JavaScript interview question, and it is
entirely explained by "closures capture bindings, and `let` makes more of them."

## What closures are for

1. **Private state** — a variable nothing outside can reach, because the only
   references to it are the functions you chose to return.
2. **Factories** — `makeAdder(5)` bakes a value into a new function.
3. **Memoization** — a cache that lives between calls without being global.
4. **Once-only / rate-limited behaviour** — a flag nobody else can flip.

## The cost

A closure keeps its entire enclosing scope reachable, so nothing in that scope
can be garbage collected while the closure lives. Hold one closure over a big
array and you hold the array. Usually irrelevant; occasionally the whole bug.

## What to build

You write these in `solution.js`. The full spec for each is in the JSDoc above
the corresponding stub in `exercise.js`, and `exercise.test.js` is the final
authority.

| Export | What it does |
| --- | --- |
| `makeSecret(initial)` | Private state — `get`/`set` with no other way in |
| `once(fn)` | Runs `fn` at most once, then returns the first result forever |
| `memoize(fn)` | Caches results by argument, so `fn` runs once per input |
| `makeAccumulator()` | Running total across calls |
| `captureLoopVar()` | Return `[0, 1, 2]` from closures made in a loop |
| `createBank(balance)` | Deposit/withdraw with a balance nothing can reach directly |
| `limit(fn, max)` | Runs `fn` at most `max` times, then returns `undefined` |

## Running it

Both of these run from inside this folder:

```bash
cp exercise.js solution.js   # once
npm run watch                # scopes to this lesson automatically
```

## Going deeper

1. Rewrite the `var` loop to log `0, 1, 2` **without** changing `var` to `let`.
   (Hint: an IIFE, which is how everyone did this before 2015.)
2. `memoize` uses an object or a `Map` as its cache. What breaks if the argument
   is an object rather than a string? What would you need to fix it?
3. Does `once(fn)` still hold a reference to `fn` after the first call? Should it
   release it? What would that buy you?
