# 06 — Gatherers

Streams shipped in Java 8 with a fixed set of intermediate operations and no way
to add one. If you wanted "batch these into threes" or "drop consecutive
duplicates" you dropped out of the pipeline and wrote a loop. `Stream.gather`,
final in Java 24, is the extension point that was missing for a decade.

## The shape of it

```java
List.of(1, 2, 3, 4, 5).stream()
    .gather(Gatherers.windowFixed(2))   // an intermediate op you supplied
    .map(List::size)
    .toList();                          // [2, 2, 1]
```

`gather` is to intermediate operations what `collect` is to terminal ones: one
method, taking an object that carries the behaviour. A `Gatherer<T, A, R>`
consumes `T`, keeps private state of type `A`, and emits `R`.

## The five built-ins

```java
Gatherers.windowFixed(3)     // [1,2,3,4,5] -> [[1,2,3], [4,5]]
Gatherers.windowSliding(2)   // [1,2,3,4,5] -> [[1,2], [2,3], [3,4], [4,5]]
Gatherers.scan(() -> 0, Integer::sum)   // [1,2,3] -> [1, 3, 6]
Gatherers.fold(() -> 0, Integer::sum)   // [1,2,3] -> [6]      (a one-element stream)
Gatherers.mapConcurrent(4, this::fetch) // map, on up to 4 virtual threads
```

Four things about those that will catch you out:

- The last fixed window is short, and a window larger than the stream gives you
  **one** window holding everything — not an empty result.
- `scan` emits one element per input element. The initial value is *not*
  emitted, so `scan` on an empty stream emits nothing.
- `fold` emits exactly one element, always — including on an empty stream,
  where it emits the initial value. It is `reduce`, but staying inside the
  pipeline so you can keep going.
- The windows are **immutable** lists. `window.add(x)` throws.

`mapConcurrent` runs the mapper on virtual threads with a concurrency limit,
preserves encounter order in the output, and propagates the first exception
after cancelling the rest. Its mapper is an ordinary `Function`, so a checked
exception has to be caught inside the lambda — the usual lambda tax.

## Writing one

```java
// [3, 1, 4, 1, 5] -> [3, 4, 5]: only values that beat everything before them
Gatherer<Integer, ?, Integer> newRecordsOnly() {
    return Gatherer.ofSequential(
        () -> new int[] { Integer.MIN_VALUE },                 // initializer: the state
        Gatherer.Integrator.of((best, element, downstream) -> {
            if (element <= best[0]) return true;               // swallow it, keep going
            best[0] = element;
            return downstream.push(element);
        }));
}
```

The **integrator** is the whole job: it gets the state, one element, and a
`Downstream` to push to. It may push zero, one or many elements per input. Its
boolean return is the interesting part — `true` means "keep feeding me", and
**`false` short-circuits the upstream**, which is how `limit` and `takeWhile`
are able to work on infinite streams and how yours can too.

`downstream.push(x)` itself returns false when whatever is downstream has had
enough, so returning it directly is the well-behaved default. An integrator that
can never short-circuit should say so with `Integrator.ofGreedy`, which lets the
JDK skip the checks.

The optional **finisher** runs once, after the last element, with the state and
the downstream — which is what makes "emit only at the end" possible:

```java
// sortedAtTheEnd(): nothing can be emitted until the last element has arrived
Gatherer.ofSequential(
    ArrayList<String>::new,
    Gatherer.Integrator.of((buffer, element, downstream) -> {
        buffer.add(element);
        return true;                       // pushes nothing at all
    }),
    (buffer, downstream) -> {                                   // finisher
        buffer.sort(Comparator.naturalOrder());
        buffer.forEach(downstream::push);
    });
```

`Gatherer.ofSequential` promises the JDK that the state is not safe to split, so
the stage runs sequentially even inside a parallel stream. `Gatherer.of` is the
parallel-capable form and additionally needs a **combiner** that merges two
states. Most stateful transformations have no sensible combiner; say
`ofSequential` and be honest.

## The trap: state is per-run, not per-gatherer

The initializer is a `Supplier`, called once per stream execution. Capturing
mutable state in the lambda instead — a `StringBuilder` declared outside the
gatherer and closed over — gives you an object shared by every stream that ever
uses that gatherer, and the second call returns garbage built on top of the
first. The state parameter exists precisely so you never have to.

```java
// wrong: one state object, forever, shared by every caller
var best = new int[] { Integer.MIN_VALUE };
return Gatherer.ofSequential(() -> best, ...);
```

The same reasoning is why `Gatherers.fold` and `scan` take a `Supplier<A>` for
the initial value rather than the value itself.

## Gatherer or Collector?

| | `Collector` | `Gatherer` |
| --- | --- | --- |
| Position | terminal — ends the pipeline | intermediate — the pipeline continues |
| Emits | exactly one value | zero, one, or many, per element |
| Timing | after the whole stream | as it goes, or at the end, or both |
| Can stop early | no | yes, by returning `false` |
| Infinite input | never | fine, if it short-circuits |

They are close relatives — four functions each, and `fold` is literally
`reduce`. The distinction that matters is that a gatherer is *incremental*: it
can push results downstream before the source is exhausted, which is what makes
`windowFixed` on a log file being tailed a sensible thing to write.

## What to build

| Method | What it does |
| --- | --- |
| `batches(List, int)` | Fixed-size chunks, short last one and all |
| `slidingSums(List, int)` | The sum of every consecutive window |
| `runningTotals(List)` | A cumulative sum, with `scan` |
| `concatenate(List)` | The whole stream to one String, with `fold` |
| `dedupeConsecutive(List)` | Your first custom gatherer |
| `takeThrough(int)` | A `Gatherer` that stops the source early |
| `tail(List, int)` | A custom gatherer that only emits in its finisher |
| `mapConcurrently(List, int)` | `mapConcurrent`, order intact |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `takeThrough(3)` terminates on `Stream.iterate(1, x -> x + 1)`. Take the
   `return false` out and see what happens — then work out which component
   actually stopped: the gatherer, the source, or `toList`.
2. `tail` buffers everything it will emit until the finisher. What is the memory
   profile of `tail(2)` over a ten-million-element stream, versus `windowSliding(2)`?
3. Write `dedupeConsecutive` as a `Gatherer.of` rather than `ofSequential` by
   inventing a combiner. What does the combiner have to know that it cannot?
4. `mapConcurrent(1, f)` and `map(f)` produce the same output. Are they the same
   operation? Consider what happens when `f` throws on the third element.
