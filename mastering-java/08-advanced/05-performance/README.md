# 05 — Performance

Most Java performance advice is folklore from 2006. The JIT has since eaten
almost all of it, and what is left is complexity, allocation, and knowing that
your measurement is a measurement.

## Complexity first, always

A constant-factor trick on an O(n²) loop buys you nothing at n = 100 000; a
`HashSet` buys you everything. Before any of the machinery below, ask what the
loop costs in n.

```java
// O(n·m): for every needle, walk the whole haystack
for (String needle : needles)
    for (String h : haystack) if (h.equals(needle)) return true;

// O(n+m): pay once to index, then ask
Set<String> index = new HashSet<>(haystack);
for (String needle : needles) if (index.contains(needle)) return true;
```

The second one allocates more and is *much* faster. That is the shape of nearly
every real Java performance fix: spend memory to remove a loop.

## What the JIT does while you are not looking

Your method starts life interpreted. Once it has run a few thousand times the VM
compiles it — first with C1 (fast to compile, mediocre code), then, if it stays
hot, with C2 (slow to compile, very good code). That is **tiered compilation**,
and it means the same method has at least three different speeds during one run.

The optimisations that matter for benchmarking:

- **Inlining.** A small hot method is pasted into its caller, which then exposes
  everything else. Almost every other optimisation depends on this one.
- **Constant folding.** If the inlined code can see that an argument never
  changes, the result is computed once at compile time.
- **Dead-code elimination.** A computation whose result nobody reads is deleted
  outright.
- **Escape analysis.** If an object provably never leaves the method, the JIT
  can put its fields in registers and never allocate it — *scalar replacement*.
  This is why "avoid allocating in loops" is mostly obsolete advice.

None of this is stable. The same code is slow, then fast, then faster, and
occasionally slow again when the VM deoptimises on a branch it had assumed away.

## The trap: your benchmark measured nothing

```java
long start = System.nanoTime();
for (int i = 0; i < 1_000_000; i++) {
    Math.sqrt(123.456);          // result unused
}
long elapsed = System.nanoTime() - start;   // ~0. Congratulations.
```

Three separate things went wrong, and each is enough on its own.

1. **Dead code.** Nothing reads the result of `Math.sqrt`, so C2 deletes the
   call. Then the loop body is empty, so the loop goes too.
2. **Constant folding.** `123.456` is a constant, so even if the result were
   used, `sqrt` would be evaluated once at compile time.
3. **No warmup.** The first few thousand iterations ran in the interpreter, so
   whatever you did measure is the speed of the wrong implementation.

The defences are: consume every result (return it, or accumulate it into a field
the JIT cannot see through), make inputs genuinely unknown at compile time, and
run the thing until it stops getting faster before you start the clock.

**JMH** (`org.openjdk.jmh`) exists because doing that correctly by hand is
harder than it looks. It forks a fresh JVM per benchmark so one measurement
cannot bias the next through profile pollution, runs measured warmup iterations,
takes your returned value and feeds it to a `Blackhole` that the JIT cannot see
through, and reports a distribution rather than a single number. If a
performance claim matters, it is a JMH claim.

## Measuring honestly by hand

```java
System.nanoTime()          // monotonic, for elapsed time. Only for elapsed time.
System.currentTimeMillis() // wall clock, can jump backwards when NTP corrects
```

`nanoTime`'s absolute value is meaningless — only differences mean anything.
Its resolution is tens of nanoseconds, so timing anything shorter than a
microsecond one iteration at a time measures the clock. Time a batch instead,
and report the *minimum* batch rather than the mean: the minimum is the run
where the OS left you alone, and the mean is mostly noise from scheduling and
GC.

And the test suite is not the place for it. A wall-clock assertion is a test
that fails when someone else's build is running. Assert on **work done** — how
many elements a loop touched — and let the complexity claim be the thing you
check. That is what `Counted` is for in this lesson.

## Allocation and GC pressure

Allocation in the young generation is a pointer bump in a thread-local buffer
(TLAB) — a handful of instructions. Java allocation is genuinely cheap. What is
not cheap is *survival*: an object still reachable when the young collection
runs must be copied, and copying is the cost. A million short-lived objects are
nearly free; a hundred thousand that live just long enough to be promoted are
not.

Practical consequences, in order of value:

- Boxing in a hot loop turns a primitive into an object per element. `IntStream`
  over `Stream<Integer>`, `int[]` over `List<Integer>`.
- `String` concatenation in a loop is O(n²) in bytes copied, because each `+`
  builds a whole new string. `StringBuilder` is O(n). This one predates the JIT
  and the JIT has not fixed it.
- Sizing a collection up front avoids the copy-on-grow, which matters when you
  already know the size.

## What to build

`Counted<T>` carries a result and a **step count**: the number of times your
code read an element of the input. That number is the complexity, made testable
without a stopwatch.

| Method | What it does |
| --- | --- |
| `sumOfSquares(int[])` | A sum wide enough not to overflow |
| `firstDuplicate(int[])` | The first repeat, in one pass |
| `rangeSums(long[], int[][])` | Many range queries, one pass over the data |
| `anyShared(List, List)` | Do two lists share an element, without a nested loop |
| `maxSubarraySum(int[])` | The best contiguous run, in one pass |
| `join(List, String)` | Concatenation that is not quadratic |
| `measureNanos(Runnable, int, int)` | Warm up, then time |
| `stepsAtSizes(int[])` | The harness: work as a function of n |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `stepsAtSizes` shows work doubling as n doubles. Sketch what the numbers
   would look like for the nested-loop version of `anyShared`, and at what n
   the difference stops being academic.
2. `rangeSums` reads the data once no matter how many queries arrive. What did
   that cost, and at how few queries does the naive version win?
3. Escape analysis can delete an allocation entirely. `Counted` is a record
   returned from every method here — does that count as escaping? What would
   have to be true for the JIT to remove it anyway?
4. `measureNanos` returns one number. What would you have to record instead to
   notice a GC pause landing inside your measurement window?
