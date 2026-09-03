# 03 — Executors and Futures

Threads are a resource; `Thread` is the raw handle to one. `ExecutorService`
separates *what to run* from *what runs it*, and `CompletableFuture` is the
Promise you already know, with a bigger and blunter API.

## Submitting work

```java
try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
    Future<Integer> f = pool.submit(() -> expensive());
    int result = f.get();          // blocks this thread until it is ready
}                                  // close() = shutdown() + wait for the rest
```

`ExecutorService` has been `AutoCloseable` since Java 19, so try-with-resources
is the shortest correct shutdown you can write.

`Runnable` returns nothing and may throw nothing checked. `Callable<T>` returns
a `T` and may throw anything — which is why `submit` takes a `Callable` when you
want an answer:

```java
Callable<String> read = () -> Files.readString(path);   // IOException is fine here
```

Sizing the pool is a real decision, not a default. CPU-bound work wants about
`availableProcessors()` threads: more only adds context switches. Blocking work
wants far more, because most of them are asleep — and the moment you write that
sentence, lesson 04 becomes interesting. A fixed pool has an unbounded queue, so
a producer faster than the pool grows the queue until the heap runs out;
`newCachedThreadPool` has the opposite failure, creating a thread per task
without limit.

## `Future.get` is a blocking call

`get()` parks the calling thread. Two threads each waiting on the other's future
is a deadlock; a web request thread blocked in `get()` is a thread you paid for
and are not using. That cost is the reason `CompletableFuture` exists.

It also rewraps the failure. Whatever the task threw arrives as an
`ExecutionException` with the real thing as its cause:

```java
try { f.get(); }
catch (ExecutionException e) { Throwable real = e.getCause(); }
```

Logging `e` instead of `e.getCause()` is how a stack trace ends up saying
nothing but "ExecutionException".

## Shutdown is two verbs, and neither is instant

| | does |
| --- | --- |
| `shutdown()` | Stop accepting work; let everything already submitted finish |
| `shutdownNow()` | Also **interrupt** the running tasks, and return the queued ones that never started |
| `awaitTermination(t, u)` | Block until terminated, or give up and return `false` |

Neither one stops anything by force. `shutdownNow` sets the interrupt flag; a
task that never checks it, or that catches `InterruptedException` and carries
on, keeps running. The standard shape is: ask nicely, wait, then insist.

```java
pool.shutdown();
if (!pool.awaitTermination(5, SECONDS)) {
    pool.shutdownNow();
    pool.awaitTermination(5, SECONDS);
}
```

## `CompletableFuture` is the Promise API

The names differ, the shapes do not:

| JavaScript | Java |
| --- | --- |
| `p.then(v => x)` | `f.thenApply(v -> x)` |
| `p.then(v => otherPromise)` | `f.thenCompose(v -> other)` |
| `Promise.all([a, b]).then(([x, y]) => …)` | `a.thenCombine(b, (x, y) -> …)` |
| `Promise.all(list)` | `CompletableFuture.allOf(…)` — see below |
| `p.catch(fallback)` | `f.exceptionally(fallback)` |
| `p.then(ok, err)` | `f.handle((v, e) -> …)` |

`thenApply` is `map` and `thenCompose` is `flatMap`. Using `thenApply` where you
meant `thenCompose` gives you a `CompletableFuture<CompletableFuture<T>>`, which
compiles and then quietly never gets unwrapped.

`allOf` is the one that is not like `Promise.all`: it returns
`CompletableFuture<Void>`. It waits, and it hands back nothing at all. Collecting
the values is your job, after the wait:

```java
CompletableFuture.allOf(futures.toArray(CompletableFuture[]::new))
                 .thenApply(ignored -> futures.stream().map(CompletableFuture::join).toList());
```

The `join()` inside is safe *because* `allOf` already completed — every future
is done, so nothing blocks.

## The trap: which exception the callback actually receives

`join()` throws `CompletionException`; `get()` throws `ExecutionException`; both
wrap the original. Worse, whether your `handle`/`exceptionally` callback sees the
wrapper depends on where the failure came from:

```java
CompletableFuture.failedFuture(new IllegalStateException())
                 .handle((v, e) -> e.getClass());   // IllegalStateException

CompletableFuture.supplyAsync(() -> { throw new IllegalStateException(); })
                 .handle((v, e) -> e.getClass());   // CompletionException
```

Same exception, same operator, different answer, because a task that throws is
completed *with a wrapper* while `failedFuture` stores the raw throwable. So
never switch on the type you were handed. Unwrap first:

```java
Throwable root = (e instanceof CompletionException && e.getCause() != null) ? e.getCause() : e;
```

One more: a stage with no `…Async` suffix runs on whichever thread completed the
previous stage — possibly the one that called `complete()`, possibly a
ForkJoinPool common-pool thread, possibly the caller's. Never assume, and never
do anything slow in a non-async stage.

## What to build

| Method | What it does |
| --- | --- |
| `runAll(List<Callable<Integer>>, int)` | Fixed pool, results in submission order |
| `causeName(Callable<?>)` | The exception a task really threw |
| `shutdownNowPending()` | How many queued tasks `shutdownNow` hands back |
| `awaitOrForce(ExecutorService, long)` | Ask nicely, wait, then insist |
| `all(List<CompletableFuture<T>>)` | The `Promise.all` that `allOf` is not |
| `combine(CompletableFuture, CompletableFuture)` | `thenCombine` of two results |
| `chain(CompletableFuture<String>, Function)` | `thenCompose`, not `thenApply` |
| `recover(CompletableFuture<String>, String)` | `exceptionally` with a fallback |
| `describe(CompletableFuture<String>)` | `handle`, unwrapping the wrapper |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `runAll` collects with `get()` in submission order. What does that cost when
   the first task is the slowest, and what would `invokeAll` do differently?
2. `all` calls `join()` on futures that are already complete. Rewrite it so it
   never calls `join` at all, and say which version you would rather debug.
3. `shutdownNow` returns the queued tasks. What can you actually do with them,
   and what does that imply about writing tasks that are safe to re-run?
4. A `CompletableFuture` you got back from a library can be completed by anyone
   who holds it — `f.complete(value)` is a public method. What is
   `minimalCompletionStage()` for, and when would you hand one out instead?
