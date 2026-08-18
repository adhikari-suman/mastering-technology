# 05 — Performance, Honestly

Most performance advice is folklore. This lesson is about the two things that
are actually true — algorithmic complexity dominates, and you must measure —
and about how to measure without fooling yourself.

## Complexity beats micro-optimisation

```js
// O(n²) — for each item, scan the whole other array
const shared = a.filter((x) => b.includes(x));

// O(n) — one pass to index, one to check
const lookup = new Set(b);
const shared = a.filter((x) => lookup.has(x));
```

At n=10 the difference is nothing. At n=100,000 it's the difference between
instant and unusable. No amount of loop tuning fixes the wrong complexity, and
almost every real performance win is this shape.

The everyday version: `includes`/`indexOf`/`find` inside a loop over another
collection. That's an accidental O(n²), and a `Set` or `Map` is the fix.

## Measuring without lying to yourself

`Date.now()` has millisecond resolution — useless for anything fast.
`performance.now()` gives sub-millisecond and is monotonic.

Four ways benchmarks mislead:

**Too small a workload.** Anything under a millisecond is noise. Loop until the
total is meaningful, then divide.

**No warmup.** V8 runs interpreted first, then optimises hot code. Your first
iterations measure the interpreter.

**Dead code elimination.** If you never use the result, the engine may skip the
work entirely. Accumulate into something you return.

**One sample.** Run repeatedly and take the median — the mean is dragged around
by GC pauses and scheduling.

## Where memory goes

Closures keep their entire scope alive (Part 02). A `Map` keyed by object keeps
those objects alive; a `WeakMap` doesn't (Part 05). Long-lived arrays of
short-lived objects are the classic leak.

Allocation itself costs: object churn in a hot loop means GC pressure, and GC
pauses are what users actually feel.

## The rule

Measure first. The bottleneck is almost never where it feels like it is, and
"optimisations" applied without measurement usually make code slower *and*
harder to read. Then re-measure — a change you didn't verify isn't an
optimisation, it's a guess.

## What to build

| Export | What it does |
| --- | --- |
| `intersectSlow` / `intersectFast` | O(n²) versus O(n) |
| `time(fn, iterations)` | Warmup, repeats, median |
| `compare(a, b, iterations)` | Which is faster, and by how much |
| `countOperations(fn)` | Instrument work rather than timing it |
| `memoizeWithStats(fn)` | Hits and misses |
| `dedupeSlow` / `dedupeFast` | The same lesson on one array |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. Find the n where `intersectSlow` and `intersectFast` cross over. Is it where
   you guessed?
2. Remove the warmup from `time` and measure something small. How much does the
   first run differ?
3. Write a benchmark whose body the engine can eliminate entirely. What number
   do you get, and how would you notice it's wrong?
