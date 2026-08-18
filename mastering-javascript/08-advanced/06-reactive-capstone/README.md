# 06 — Capstone: A Reactive Store

The last lesson. You build a small reactivity system — the engine behind Vue,
Solid and every signals library — using pieces from every Part of this
curriculum.

## What you're building

```js
const state = reactive({ count: 0, name: 'Ada' });

effect(() => console.log(`count is ${state.count}`));
// logs immediately: 'count is 0'

state.count = 1;    // logs 'count is 1'
state.name = 'Bob'; // logs nothing — this effect never read `name`
```

No subscribe calls, no dependency lists. The system works out what each effect
depends on **by watching which properties it reads**.

## How it works

Three ideas, and you already have all of them.

**1. Track reads.** A `Proxy` `get` trap (Part 08 lesson 01) records that the
currently-running effect depends on this property.

**2. Trigger writes.** A `set` trap looks up which effects read that property
and re-runs them.

**3. Know who's running.** A module-level "current effect" variable, set while
an effect runs and restored afterwards. That's a closure over mutable state
(Part 02 lesson 01), and the reason the `get` trap knows who to attribute a read
to.

The dependency map is `WeakMap<target, Map<key, Set<effect>>>` — a `WeakMap`
(Part 05 lesson 02) so a discarded object's dependencies go with it, and a `Set`
so one effect registered twice is stored once.

## The subtleties

**Re-track on every run.** An effect with a branch reads different properties
depending on state. Clear its dependencies before each run, or it keeps
subscriptions to properties it no longer reads.

**Don't trigger on an unchanged write.** `state.count = 0` when it's already `0`
should do nothing. Use `Object.is` — it handles `NaN` correctly, unlike `===`.

**Iterate over a copy.** An effect may write while running, mutating the very
`Set` you're looping. Copy it first, or you get an infinite loop or a skipped
effect.

**Nested effects need a stack**, not a single variable — restore the previous
effect when an inner one finishes.

## What you're reusing

| From | What |
| --- | --- |
| Part 02 | Closures over mutable state; higher-order functions |
| Part 03 | Property descriptors, `Reflect`-shaped access |
| Part 05 | `WeakMap`, `Map`, `Set` |
| Part 06 | Cleanup that always runs, even when an effect throws |
| Part 08 | `Proxy` traps and `Reflect` forwarding with the receiver |

## What to build

| Export | What it does |
| --- | --- |
| `reactive(obj)` | The tracking proxy |
| `effect(fn)` | Run, track dependencies, re-run on change |
| `computed(fn)` | A lazily-recomputed derived value |
| `stop(runner)` | Unsubscribe an effect |
| `batch(fn)` | Group writes into one re-run |
| `dependencyCount(obj, key)` | Inspect the graph |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. Make `reactive` deep, by returning a reactive proxy for object values. What
   does that cost, and when would you want it lazy?
2. Your `computed` recomputes when read after a change. Make it cache until
   something it depends on actually changes.
3. What happens if an effect writes to a property it also reads? Trace it — this
   is where real libraries add cycle detection.
