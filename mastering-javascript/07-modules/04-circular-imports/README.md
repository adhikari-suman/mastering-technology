# 04 — Circular Imports

Two modules that import each other. ESM permits it — the hoisted, static graph
means the cycle is known before anything runs — but *when* each binding becomes
usable is the whole story.

## What actually happens

Evaluation is depth-first. With `a.js` as the entry point:

1. `a.js` starts. Its `import` of `b.js` is hoisted, so `b.js` is evaluated
   first.
2. `b.js` starts. It imports `a.js`, which is already **in progress** — so it
   does not re-enter. `b` continues with `a`'s bindings created but **not yet
   initialised**.
3. `b.js` finishes.
4. `a.js` continues, now with `b`'s bindings fully initialised.

The asymmetry is the point: `b` sees a half-built `a`, but `a` sees a complete
`b`.

## The temporal dead zone

Reading an uninitialised `const` or `let` at module scope throws
`ReferenceError: Cannot access 'x' before initialization` — the same TDZ rule as
inside a function.

```js
// b.js, during a cycle
import { aValue } from './a.js';
console.log(aValue);   // ReferenceError — a hasn't run yet
```

So a cycle only breaks when a module reads a value from its partner **at
evaluation time**. Functions are fine, because they're hoisted:

```js
export function callB() { return 'b'; }   // usable immediately
```

## Why it usually works anyway

Most circular imports involve functions calling each other, and by the time
anything is *called*, both modules have finished. The bug appears when you use
an imported binding at the top level — a constant, a class `extends` clause, a
decorator argument.

```js
export class Child extends Parent {}   // Parent read at evaluation time — fragile
```

## CommonJS fails differently

CJS gives you a **partially populated `module.exports` object** instead of a
throw. So a cycle silently yields `undefined` where ESM would tell you loudly.
That's an upgrade: a `ReferenceError` at startup beats `undefined` in
production.

## Fixing them

Usually a cycle means a missing module. `a` and `b` both needing each other
often means the shared thing belongs in `c`, which both import. That removes the
cycle rather than tiptoeing around it.

Other options: move the import inside the function that needs it (deferring the
read), or use dynamic `import()` at the point of use.

## A note on the fixtures

`fixtures/entry.js` imports `a.js` before `b.js` and re-exports both. Import
from **entry.js**, not from `a.js`/`b.js` directly — otherwise the order your
own imports happen to be written in decides which module hits the TDZ, and the
lesson stops being about the cycle.

## What to build

| Export | What it does |
| --- | --- |
| `callAcrossCycle()` | Cross-module calls after evaluation — fine |
| `valuesAtCallTime()` | Both bindings, read late |
| `evaluationOrderEffects()` | Report the TDZ asymmetry |
| `breakCycle()` | Load a partner lazily inside the function |
| `CYCLE_PREDICTIONS` | Predict what is safe and what throws |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. Swap the entry point — import `b.js` first. Which module now sees the TDZ?
2. Replace `export const` with `export function` on both sides. Does the cycle
   still have a problem?
3. Build the same cycle in `.cjs` files. What do you get instead of a throw?
