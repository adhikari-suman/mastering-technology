# 01 — Exceptions

Java's failure model is a type hierarchy the compiler reads. Which branch of it
you subclass changes what callers are *forced* to write, and that is a design
decision, not a formality.

## The hierarchy, and where the compiler draws its line

```
Throwable
├── Error              JVM is in trouble: StackOverflowError, OutOfMemoryError
└── Exception          your problem
    └── RuntimeException   NullPointerException, IllegalArgumentException, …
```

Everything except `Error` and `RuntimeException` (and their subclasses) is
**checked**: the compiler will not let you call a method that can throw one
unless you catch it or declare `throws`. That is the whole rule. Note that a
bare `Throwable` is checked, and that `Error` sits *outside* `Exception` — so
`catch (Exception e)` does not catch `OutOfMemoryError`, while
`catch (Throwable t)` does.

```java
String read() throws IOException { … }   // checked: callers must deal with it
int size() { throw new IllegalStateException(); }   // unchecked: no signature change
```

## The checked-exception argument

Checked exceptions are Java's most contested feature, and both sides are right
about something.

For: a failure that a caller can reasonably recover from is part of the method's
contract, and the compiler enforcing that contract is exactly what type systems
are for. `IOException` is not a bug — the disk really can be full.

Against: they do not compose. Lambdas cannot throw them unless the functional
interface declares them, so `stream().map(this::read)` will not compile. And the
pressure to make a signature clean produces the worst possible code:

```java
try { risky(); } catch (IOException e) { }   // now the failure never happened
```

Modern Java has settled roughly here: **checked for recoverable, caller-visible
conditions at a boundary; unchecked for programming errors and for everything
crossing a layer that cannot act on it.** When you cross that line, wrap rather
than swallow — `UncheckedIOException` exists precisely to carry an `IOException`
through code that must not declare one.

In JavaScript everything is unchecked; `throws` has no equivalent. The habit to
unlearn is `catch (e)` catching everything, because here the equivalent —
`catch (Exception e)` — also catches every bug in the try block.

## try / catch / finally

`finally` runs on every exit path: fall-through, `return`, `break`, and
exception. Multi-catch handles unrelated failures with one recovery:

```java
try {
    return Config.load(path);
} catch (IOException | IllegalArgumentException e) {
    return Config.DEFAULTS;   // e is typed as the nearest common supertype
}
```

The type of `e` is inferred, and it is the nearest common supertype of the
listed types — here `Exception`, since one branch is checked and the other is
not. You get only the members that supertype declares, which is why the list
should stay short and related.

Catch clauses are tried top to bottom, so a subtype must come before its
supertype — the compiler rejects the other order as unreachable.

## The trap: a `return` in `finally` eats the exception

```java
static int finallySwallows() {
    try { throw new IllegalStateException("boom"); }
    finally { return 42; }
}
```

This returns `42`. Not "returns 42 and logs the exception somewhere" — the
`IllegalStateException` is *gone*, with no trace anywhere in the program.

The mechanism: `finally` runs while the exception is in flight, still looking
for a handler. A `return` (or `break`, or `continue`, or a new `throw`) in the
finally block is an abrupt completion of its own, and it **replaces** the one
already in progress. The pending exception is discarded, silently.

The same rule makes `try { return 1; } finally { return 2; }` yield `2`: the try
block computes its return value, then the finally block completes abruptly with
a different one and wins.

Never complete a `finally` block abruptly. `javac` will tell you if you ask:

```
$ javac -Xlint:finally …
warning: [finally] finally clause cannot complete normally
```

It is off by default, which is how this survives in real code.

## Rethrowing, and what a stack trace costs

```java
catch (IOException e) {
    log.add("failed: " + e.getMessage());
    throw e;                       // same object, original frames
}
```

`throw e` rethrows the object you caught. `throw new RuntimeException(e)`
creates a new one whose stack trace starts *here* — which is why the cause
argument is not optional when you rewrap.

A stack trace is captured by `Throwable`'s constructor, not by `throw`:

```java
new RuntimeException("never thrown").getStackTrace().length   // already > 0
```

Walking the stack is the expensive part of an exception, so "exceptions are
slow" really means "constructing them is slow". If you genuinely need one for
control flow, `super(message, cause, false, false)` — the four-argument
`Throwable` constructor — disables suppression and stack trace writing, and the
trace comes back empty. Reach for that roughly never.

## Two rules with no exceptions

**Never catch `Throwable`.** It catches `OutOfMemoryError` and
`StackOverflowError`, which you cannot handle, and every other `Error` the JVM
raises to say it can no longer run your program — `LinkageError` when a class
will not load, `InternalError` when the VM itself is broken. Swallowing one of
those does not recover from it; it turns a fatal condition into a program that
keeps going on state you know nothing about. `catch (Exception e)` is nearly as
bad one layer down: it hides every `NullPointerException` in the block as if it
were an expected condition.

**Never swallow silently.** An empty catch block is a decision to lose
information forever. If a failure really is expected and ignorable, say so in
code — a comment, or a variable name like `ignored` — so the next reader knows
it was deliberate.

## What to build

| Method | What it does |
| --- | --- |
| `classify(Throwable)` | `"error"` / `"unchecked"` / `"checked"` / `"none"` |
| `fetchOr(Fetcher, String)` | Fall back on `IOException` — and only on that |
| `fetchQuietly(Fetcher)` | Rewrap as `UncheckedIOException`, cause intact |
| `trace(Fetcher)` | Which blocks ran, in order, on both paths |
| `finallyWins()` | `try { return 1; } finally { return 2; }` |
| `finallySwallows()` | The same shape, discarding a live exception |
| `lookup(String[], String)` | Multi-catch over two unrelated failures |
| `framesWithoutThrowing()` | Frame count of an exception never thrown |
| `relay(Fetcher, List)` | Log and rethrow the same instance |

`Fetcher` is provided in `support/` — a one-method interface whose method
declares `throws IOException`, so a lambda is allowed to throw one.

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `fetchQuietly` turns a checked exception into an unchecked one. What has the
   caller lost, and what would they have to write to get it back?
2. Multi-catch types `e` as the nearest common supertype of the listed types.
   For `NumberFormatException | ArrayIndexOutOfBoundsException` that is
   `RuntimeException` — what could you have called on `e` if you had written two
   separate catch clauses instead?
3. `finallySwallows` compiles without a word of complaint by default. Given the
   compiler clearly knows (`-Xlint:finally` proves it), why is the warning off?
4. If the stack trace is captured in the constructor, what happens to the trace
   of an exception you construct once as a `static final` field and throw from
   many places?
