# 06 — Structured Concurrency

Two features that only make sense together: `ScopedValue`, which is the context
a task runs in, and `StructuredTaskScope`, which is the lifetime a task runs in.
Both exist because "start a thread and hope" is not a program structure.

**This lesson needs a preview flag.** `ScopedValue` is final in 25;
`StructuredTaskScope` is still preview, so this folder ships a `java.flags`
file containing `--enable-preview`, and the runner passes it to the compiler
and the JVM. Every other lesson in this Part compiles without it.

## `ScopedValue`: a value with a lifetime

```java
static final ScopedValue<String> USER = ScopedValue.newInstance();

ScopedValue.where(USER, "alice").run(() -> {
    …                       // USER.get() is "alice" anywhere down this call tree
});
                            // and out here it is unbound again
```

Compare `ThreadLocal`: mutable by anyone who can reach it, unbounded in time,
cleaned up by a `remove()` in a `finally` you forgot to write, and — as lesson
04 showed — one copy per virtual thread, which is now one per task. A
`ScopedValue` binding is immutable, is visible exactly for the duration of the
`run`/`call`, and unbinds itself.

Reading one that is not bound throws `NoSuchElementException`, so `orElse` and
`isBound` are how you write an optional context:

```java
USER.orElse("anonymous");
```

Rebinding nests rather than assigns. An inner `where` shadows the outer for its
own block, and the outer value is back afterwards — there is no `set`, so no
"who changed my context" question exists.

## `StructuredTaskScope`: a lifetime for the tasks

```java
try (var scope = StructuredTaskScope.open(Joiner.<String>allSuccessfulOrThrow())) {
    Subtask<String> name  = scope.fork(() -> fetchName());
    Subtask<String> email = scope.fork(() -> fetchEmail());
    scope.join();                       // both, or an exception
    return name.get() + " " + email.get();
}
```

The invariant is the block: subtasks forked inside it cannot outlive it. `close()`
will not return while one is still running, so by the closing brace every thread
this code created is finished. That is the same guarantee a `try`/`finally`
gives you for a file handle, applied to concurrency.

Each `fork` runs on its own virtual thread. `join()` returns whatever the
`Joiner` decides:

| Joiner | `join()` gives you | on failure |
| --- | --- | --- |
| `allSuccessfulOrThrow()` | `Stream<Subtask<T>>` | throws on the first failure, cancels the rest |
| `anySuccessfulResultOrThrow()` | the first successful `T` | throws only if all fail |
| `awaitAllSuccessfulOrThrow()` | `Void` | as above |
| `allUntil(predicate)` | `Stream<Subtask<T>>` | never throws; inspect each subtask |

Cancellation comes with it. When `allSuccessfulOrThrow` sees a failure it
cancels the scope, and every sibling still running is **interrupted** — you do
not write that, and you cannot forget it. `ScopedValue` bindings in force at the
fork are inherited by the subtask, which is the other half of why the two
features shipped together.

## The trap: unstructured code loses the error

```java
executor.submit(() -> { throw new IllegalStateException("nobody will ever know"); });
```

That compiles, runs, throws, and tells no one. The exception is stored in a
`Future` you did not keep, so there is no stack trace, no log line, and no
failure — the work simply did not happen. `submit` and forget is the single
easiest way to lose an error in Java, and it looks exactly like the code that
works.

The task's lifetime is unbounded too: nothing ties it to the method that started
it, so an error in the caller returns while the child keeps running, and a
`shutdownNow()` somewhere else decides when it stops. A scope makes both
problems unrepresentable: you cannot leave the block without joining, and
joining is what surfaces the error.

Two more edges worth knowing:

- `Subtask.get()` before `join()` throws `IllegalStateException`. The subtask is
  a handle, not a `Future`; there is nothing to block on.
- `join()` throws `StructuredTaskScope.FailedException` wrapping the subtask's
  exception. Unwrap with `getCause()`, exactly as with `ExecutionException`.

## What to build

| Method | What it does |
| --- | --- |
| `currentUser()` | The bound user, or `"anonymous"` |
| `asUser(String, Callable<T>)` | Run something with the value bound |
| `rebindTrace()` | What nesting a second binding does |
| `userInForkedTasks(String, int)` | Subtasks inherit the binding |
| `userSeenByExecutor(String)` | An executor thread does not |
| `forkAll(List<Callable<T>>)` | Fork everything, join, results in order |
| `firstSuccess(List<Callable<String>>)` | The first one that works wins |
| `cancellationReport()` | One failure interrupts its siblings |
| `executorOutcome(boolean)` | The exception nobody ever sees |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `userSeenByExecutor` gets `"anonymous"` and `userInForkedTasks` gets the
   bound name. Why is inheriting into a pooled thread unsafe in a way that
   inheriting into a forked subtask is not?
2. `cancellationReport` shows the sibling being interrupted. What happens to a
   sibling that catches `InterruptedException` and keeps working, and what does
   that do to the scope's closing brace?
3. `forkAll` returns results in fork order, but `allSuccessfulOrThrow` gives you
   a `Stream<Subtask<T>>`. Is that stream ordered, and what would you have to do
   if it were not?
4. `StructuredTaskScope.open` takes a `Configuration` with `withTimeout`. Where
   does the timeout exception surface, and how is that different from wrapping
   each subtask in its own timeout?
