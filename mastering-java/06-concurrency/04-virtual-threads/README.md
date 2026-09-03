# 04 — Virtual Threads

A virtual thread is a `Thread` the JVM schedules itself, on a small pool of real
OS threads. Final since Java 21. The API is the one you already learned; what
changes is the price, and therefore the architecture.

## What actually changed

A platform thread costs an OS thread and about a megabyte of stack, so you pool
them and you guard them: blocking one is expensive, and the whole reactive style
exists to avoid it. A virtual thread costs a heap object and a stack that grows
on demand. Ten thousand of them blocking is unremarkable:

```java
try (var pool = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 10_000; i++) {
        pool.submit(() -> { Thread.sleep(50); return null; });
    }
}                                    // close() waits for all of them
```

That runs in well under a second. When a virtual thread blocks, its stack is
*unmounted* from the carrier thread and parked on the heap; the carrier goes and
runs someone else. Blocking became a cheap operation, so the code that reads
best — one thread per request, straight-line, with ordinary `try`/`catch` — is
also the code that scales. This is the opposite of the JavaScript conclusion,
where blocking is forbidden and everything is a callback: Java made blocking
cheap instead of making it illegal.

Three ways to make one:

```java
Thread.ofVirtual().start(runnable);              // started
Thread.ofVirtual().name("worker").unstarted(r);  // not started yet
Executors.newVirtualThreadPerTaskExecutor();     // usually this one
```

## They are not platform threads wearing a hat

- **Always daemon.** `setDaemon(false)` throws `IllegalArgumentException`. A
  virtual thread will never keep the JVM alive; if `main` returns, it dies.
- **Always priority 5.** `setPriority` is accepted and does nothing.
- **Unnamed by default.** `getName()` is `""`, not `"Thread-3"`. Logging setups
  that key on thread name get an empty column.
- **No thread group you can use, and not poolable in the old sense.**

## The trap: do not pool them

Every instinct trained on platform threads says "put them in a pool". A pool
exists to *limit* how many threads there are, because threads are scarce. These
are not scarce. Pooling them reintroduces the queue and the concurrency cap
while keeping none of the benefits:

```java
Executors.newFixedThreadPool(200, Thread.ofVirtual().factory());   // wrong
```

That compiles, runs, and gives you exactly 200-way concurrency and a growing
queue behind it — the same bottleneck you had, now with a worse debugger story.
The virtual-thread executor is not a pool at all: it makes a thread per task and
throws it away. If you need to limit concurrency, limit it with a `Semaphore`
around the scarce resource, which is what you actually meant.

## `ThreadLocal` gets expensive by getting correct

`ThreadLocal` used to be a per-*pool-thread* cache: 8 threads, 8 copies, reused
for the lifetime of the process. With a thread per task there are a million
threads, therefore a million copies, and none of them is reused. Nothing is
broken — that is exactly what "thread local" always meant — but a cached
`SimpleDateFormat` that cost 8 allocations now costs one per request, and an
inheritable thread-local copies its map into every child.

The replacement is `ScopedValue`, which is lesson 06.

## Pinning, and how it got better

While a virtual thread is *pinned* it cannot unmount, so its carrier thread is
stuck too — and with only `availableProcessors()` carriers by default, a handful
of pinned threads can stall everything.

In Java 21 the big cause was `synchronized`: block inside a monitor and you
pinned. JEP 491 fixed that in **Java 24**, so on this JDK blocking inside
`synchronized` (and inside `Object.wait`) unmounts normally. What still pins is
a native frame — a JNI call, or a foreign-function downcall — and the JFR event
`jdk.VirtualThreadPinned` is how you find one.

That history matters when you read older advice: "replace `synchronized` with
`ReentrantLock` for virtual threads" was correct in 21 and is obsolete now.

## When platform threads are still right

Long-running CPU-bound work. A virtual thread gives you nothing there — the
carrier is busy either way, and you wanted a bounded number of them.
`ForkJoinPool` and a fixed pool sized to the cores remain the right tools. The
rule of thumb: virtual threads are for tasks that *wait*.

## What to build

| Method | What it does |
| --- | --- |
| `countVirtual(ExecutorService, int)` | How many tasks ran on a virtual thread |
| `inParallel(List<Callable<T>>)` | `invokeAll` on a thread-per-task executor |
| `fanOutBlocking(int, long)` | Ten thousand threads, all asleep at once |
| `distinctThreadLocals(ExecutorService, int)` | How many copies a `ThreadLocal` made |
| `unstartedVirtual(Runnable)` | A virtual `Thread` you have not started |
| `canRunConcurrently(ExecutorService, int, long)` | Whether N tasks can be in flight together |
| `withTimeout(Callable<T>, long, T)` | Give up on a task, and cancel it |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `canRunConcurrently` is false for `newFixedThreadPool(2, virtualFactory)`
   and true for `newVirtualThreadPerTaskExecutor()`. Both make virtual threads.
   Write down, in one sentence, what a pool is actually for.
2. `fanOutBlocking(10_000, 50)` finishes in about a tenth of a second. What
   would the same call cost with `newFixedThreadPool(10_000)`, and which
   resource runs out first?
3. `withTimeout` cancels with `cancel(true)`. What does that do to a task
   sitting in `Thread.sleep`, and what does it do to one in a `while (true)`
   loop that never checks anything?
4. A `Semaphore` limits concurrency without limiting threads. Where does the
   backpressure end up instead, and what is now unbounded that used to be
   bounded by the pool size?
