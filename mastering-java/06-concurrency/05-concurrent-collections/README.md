# 05 — Concurrent Collections

`java.util.concurrent` has a collection for each shape of sharing. Picking the
wrong one usually still compiles, still passes your tests, and loses data in
production — because the bug is not in any single operation.

## A synchronized wrapper is not thread safety

```java
Map<String, Integer> counts = Collections.synchronizedMap(new HashMap<>());
counts.put(word, counts.getOrDefault(word, 0) + 1);        // broken
```

Every *call* there is synchronized. The `getOrDefault` is atomic, the `put` is
atomic, and the gap between them is not: two threads read 4, both write 5, one
increment is gone. This is exactly lesson 01's `count++` with more ceremony.

That is the shape to learn to see — **check-then-act**. `if (!map.containsKey(k))
map.put(k, v)` has it. So does "read the size, then decide". Wrapping a
collection makes each method atomic and can never make your *sequence* atomic.

The fix is not a bigger lock around the caller. It is an operation that does the
whole thing in one call.

## `ConcurrentHashMap` composes the operation for you

```java
counts.merge(word, 1, Integer::sum);                 // read-modify-write, atomic
cache.computeIfAbsent(key, k -> expensiveLoad(k));   // and the load runs once
map.putIfAbsent(key, value);
map.replace(key, expected, updated);                 // CAS, for a map
```

`computeIfAbsent` holds the bin's lock while the mapping function runs, so among
racing threads exactly one computes and the rest wait and get that value. Two
consequences:

- Keep the function short. Everything hashing to that bin is blocked behind it.
- **Do not touch the same map inside it.** A recursive `put` or `computeIfAbsent`
  on the same key throws `IllegalStateException: Recursive update`, and on a
  different key that lands in the same bin it can simply deadlock.

`ConcurrentHashMap` also refuses `null` keys and `null` values, where `HashMap`
allows both — `map.get(k) == null` would otherwise be genuinely ambiguous
between "absent" and "mapped to null" with no atomic way to tell.

`putIfAbsent` reads backwards, too: it returns the value that was **already**
there, so `null` means "yours won".

## `BlockingQueue` is the hand-off

A producer/consumer pair does not need a lock; it needs a queue that blocks.

```java
BlockingQueue<Job> queue = new ArrayBlockingQueue<>(100);
queue.put(job);            // blocks while full   — this is backpressure
Job job = queue.take();    // blocks while empty
```

Bounded is the whole point. An unbounded queue turns a slow consumer into an
`OutOfMemoryError` instead of a slow producer. Four verbs, four failure modes:

| | full queue |
| --- | --- |
| `add(e)` | throws `IllegalStateException` |
| `offer(e)` | returns `false` |
| `offer(e, t, u)` | waits, then returns `false` |
| `put(e)` | waits forever |

`take()`/`poll()` are the mirror image at the empty end. Shutting a consumer
down means either interrupting it — `take()` throws `InterruptedException` — or
a *poison pill*, one sentinel value per consumer, queued behind the real work so
every job before it is finished first.

## `CopyOnWriteArrayList` and its one niche

Every mutation copies the whole array. Writes are O(n) and allocate; reads and
iteration are lock-free and see a snapshot that can never change under them.
That is a terrible list and a very good listener registry: written once at
startup, iterated on every event. Use it when writes are rare and *you can name
how rare*. Its iterator has no `remove()` — the snapshot is not the list any
more.

## The trap: `ConcurrentModificationException` is not about concurrency

```java
for (String s : list) { list.add("x"); }    // one thread. Still throws.
```

`ArrayList` and `HashMap` iterators are **fail-fast**: they carry a modification
count and throw the moment the collection changes underneath, whoever changed
it. A single-threaded loop that removes as it goes throws exactly the same
exception. The name has misled a generation.

The concurrent collections instead give you **weakly consistent** iterators:
never throw, reflect the state at some point at or after creation, and may or
may not show you a change made during the walk. `ConcurrentHashMap` is like
that; `CopyOnWriteArrayList` is the strict version, a true snapshot.

So the three answers to "I mutated while iterating" are: don't, use the
iterator's own `remove()`, or use a collection whose iterator was designed for
it — and only the third is safe across threads.

## What to build

| Method | What it does |
| --- | --- |
| `tallyUnsafe(List<String>, int)` | Word counts via a synchronized wrapper |
| `tally(List<String>, int)` | The same counts, correct, with `merge` |
| `computeOnce(map, key, Supplier)` | Load a value at most once per key |
| `firstWriterWins(map, key, value)` | `putIfAbsent`, and what it returns |
| `iterateWhileMutating(Collection<String>)` | Fail-fast, snapshot, or weakly consistent |
| `whenFull(String)` | `add` vs `offer` vs `put` on a full queue |
| `processJobs(List<Integer>, int, int)` | A bounded queue, workers, and poison pills |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `tallyUnsafe` loses updates but never invents them, and its key set is always
   right. Which of those three properties does the wrapper actually guarantee,
   and which are accidents of `HashMap`'s implementation?
2. `computeIfAbsent` runs the loader under the bin's lock. Write down the
   deadlock you get if two threads each load a value that needs the other's key.
3. `processJobs` uses one poison pill per worker. What happens if you queue only
   one, and what would you use instead of pills if the workers were virtual
   threads you could just interrupt?
4. A weakly consistent iterator "may or may not" see a concurrent insert. What
   does that make `ConcurrentHashMap.size()` worth, and what should you use
   instead when the number has to be right?
