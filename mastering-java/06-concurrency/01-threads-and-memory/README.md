# 01 — Threads and Memory

JavaScript gives you one thread and a queue, so a data race is not expressible.
Java gives you real threads over shared memory, so it is — and the compiler, the
JIT and the CPU are all allowed to reorder your code as long as *one* thread
cannot tell.

## Starting a thread

A `Thread` wraps a `Runnable`. `start()` runs it on a new thread; `join()` waits
for it to finish.

```java
Thread t = new Thread(() -> System.out.println("hello"));
t.start();
t.join();          // throws InterruptedException — it is a blocking call
```

Three facts that bite immediately:

- `t.run()` compiles and does nothing you wanted. It calls the `Runnable`
  straight through, on the calling thread. No new thread exists.
- `t.start()` a second time throws `IllegalThreadStateException`. A `Thread`
  object is single-use; a terminated thread cannot be restarted.
- An exception thrown inside the body does **not** reach the caller. `join()`
  returns normally and tells you nothing. The throwable goes to the thread's
  uncaught-exception handler, which by default prints to stderr.

## Happens-before is the whole memory model

The Java Memory Model does not say "writes become visible eventually". It gives
you a partial order called *happens-before*, and one rule: a read may see a
write if that write happens-before it (or is unordered with it — which is the
bug). Within one thread, program order is happens-before. Across threads you
only get it from specific acts:

```java
t.start();     // everything before start()  happens-before the thread's first action
t.join();      // everything the thread did  happens-before join() returning
// unlocking a monitor happens-before the next lock of that monitor
// a volatile write   happens-before every later volatile read of that field
```

`join()` is why this is safe with an ordinary, non-`volatile` field:

```java
String[] slot = new String[1];
Thread t = new Thread(() -> slot[0] = "written on another thread");
t.start();
t.join();
slot[0];      // guaranteed visible. No volatile needed.
```

Take the `join()` away and the guarantee is gone — not "usually fine", *gone*.

## Visibility and atomicity are different bugs

They are diagnosed differently and fixed differently, and confusing them is the
most common way to write concurrent Java that is subtly wrong.

**Visibility**: thread A wrote, thread B is still reading a stale value —
possibly forever, because the JIT is entitled to hoist a non-`volatile` read out
of a loop and never look at memory again.

**Atomicity**: both threads saw the current value, and one of the updates was
lost anyway. `count++` is three operations — read, add, write — and any other
thread can slip between them.

```java
count++;      // is  int tmp = count;  tmp = tmp + 1;  count = tmp;
```

Four threads doing 100 000 increments each on a shared `int` routinely come out
under 400 000 — and never over. How far under is not something you can predict,
or even bound: a thread descheduled between its read and its write republishes
whatever it read, however stale.

## `volatile` fixes exactly one of them

Marking a field `volatile` means every read goes to memory, every write is
published, and reads and writes cannot be reordered across it. That is a real
guarantee and it is what a stop flag needs:

```java
private volatile boolean stopped;    // set by one thread, polled by another
```

It does nothing for atomicity. `volatile int count; count++` still loses
updates, because it is still read-then-write with a gap. What `volatile` buys is
that each half of the gap sees fresh memory. There is no such thing as a
`volatile` array *element*, either — `volatile int[] a` makes the reference
volatile, never `a[0]`. That gap is the whole reason `AtomicInteger` exists.

## The strategy that beats all of this

Don't share. Give each thread its own accumulator and combine after the join —
now there is no shared write at all and no memory model question to get wrong:

```java
long[] partials = new long[threads];       // each thread owns exactly one slot
// ... thread i writes only partials[i] ...
t.join();                                  // publishes every slot safely
```

The second-best strategy is to share only values that cannot change. An object
whose fields are `final` and assigned in the constructor is *safely published*:
any thread that sees the reference is guaranteed to see the fully built object.
Records give you that by construction — provided you also copy any mutable thing
handed to you, because a `List` field that someone else still holds a reference
to is not immutable at all.

```java
record Endpoint(String host, List<String> aliases) {
    Endpoint {
        // A compact constructor's parameters ARE the fields-to-be: whatever
        // `aliases` holds when this block ends is what gets stored. So reassign
        // it to a copy nobody outside holds a reference to, and nobody can
        // mutate it later. java.util.List has a single call that does both.
    }
}
```

## What to build

| Method | What it does |
| --- | --- |
| `parallelSum(int[], int)` | Sum an array on N threads, combining after join |
| `whoRuns(boolean)` | Whether `run()` / `start()` used the caller's thread |
| `racyCount(int, int)` | Shared plain `int`, incremented without protection |
| `volatileCount(int, int)` | The same, `volatile` — and still wrong |
| `unsharedCount(int, int)` | Per-thread accumulators, combined after join |
| `handoff(String)` | A plain field published by `join()` |
| `uncaught(Runnable)` | What happened to the exception the thread threw |
| `lifecycle()` | `NEW` → `TERMINATED`, and starting twice |
| `Config` | A record that is actually immutable |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. The tests can only assert `racyCount(4, 100_000) <= 400_000`, never `<`. Why
   is the loss not guaranteed, and what would you have to do to make a test that
   fails reliably when the code is wrong?
2. `volatileCount` and `racyCount` are both wrong, but only one of them can
   return a value that no thread ever computed. Which, and why?
3. `handoff` works with no `volatile` anywhere. Which sentence of the
   happens-before rules is doing the work, and what breaks if the thread writes
   the field *after* signalling that it is done?
4. `Config` copies its list in. Is `Config` safe to publish through a plain
   non-`volatile` field to another thread? What exactly does `final` promise
   about a constructor that has already returned?
