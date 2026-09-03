# 02 — Custom Exceptions

An exception type is a piece of API design. Most of the time the right one is
already in `java.lang`; when it isn't, the thing you are adding is *data*, not a
new noun.

## When not to subclass

Reach for the built-ins first, and use the right one:

```java
throw new IllegalArgumentException("port must be positive: " + port);  // bad input
throw new IllegalStateException("already closed");                     // bad timing
throw new UnsupportedOperationException("read-only list");             // not here
throw new NoSuchElementException("queue is empty");
```

A custom type earns its place when a caller will **catch it specifically** or
**read data off it**. `class UserNotFoundException extends RuntimeException`
with nothing but a message adds a name and no capability; the same string in an
`IllegalArgumentException` reads identically in a log.

## What a custom type is actually for: fields

The bad version formats everything into English and throws the information away:

```java
throw new IllegalStateException(
    "rate limited: " + limit + " requests per " + windowSeconds + "s");
```

A caller who wants those numbers — to size a backoff, to fill in a `Retry-After`
header, to pick an error code — has to run a regex over a sentence. The good
version keeps both:

```java
final class RateLimited extends RuntimeException {
    private final long limit, windowSeconds;

    RateLimited(long limit, long windowSeconds) {
        super("rate limited: " + limit + " requests per " + windowSeconds + "s");
        this.limit = limit;
        this.windowSeconds = windowSeconds;
    }
    double perSecond() { return (double) limit / windowSeconds; }
}
```

The message is still there for the log. The numbers are also still there for
code, and a derived accessor like `perSecond()` hands the caller the form they
actually want rather than the one that read well in English. Exception fields
should be `final` — an exception in flight is read from places you did not plan
for, sometimes on another thread.

## The four constructors

Every exception type should offer all four, because you cannot know which one a
future caller needs:

```java
ConfigException()                             // rare, but the compiler wants it for subclasses
ConfigException(String message)
ConfigException(String message, Throwable cause)     // the important one
ConfigException(Throwable cause)
```

The two cause-taking ones are what make chaining possible at all. There is no
`setCause`; a cause is set at construction, or once via `initCause`, and never
again.

**The trap in the fourth one.** `Throwable(Throwable cause)` does not copy the
cause's message — it sets the message to `cause.toString()`:

```java
new ConfigException(new IllegalStateException("boom")).getMessage()
// "java.lang.IllegalStateException: boom"   — type name and all
```

So the convenience constructor produces a message no user should ever see. Use
it only when you have genuinely nothing to add; otherwise pass a real message
and the cause together.

## Chaining: wrap, do not replace

```java
try {
    port = Integer.parseInt(raw);
} catch (NumberFormatException e) {
    throw new ConfigException("port must be a number, got \"" + raw + "\"", e);
}
```

The caller gets a sentence about *their* problem; the original
`NumberFormatException`, with the frames showing where it actually happened,
hangs underneath as `getCause()` and prints as a `Caused by:` block. Dropping
the cause — `throw new ConfigException("bad port")` — deletes that.

Two things follow. First, do not invent a cause you do not have: a range check
that fails on its own has no underlying exception, and `getCause()` should be
`null`. Second, do not wrap what is already the right kind of thing. Every extra
layer pushes the useful message one `Caused by:` further down, and a stack of
four wrappers around one `SocketTimeoutException` is a real thing that happens.

`Throwable` initialises its `cause` field to `this`, as a sentinel meaning "not
set yet", and `getCause()` maps that sentinel back to `null`. That is why
walking a chain to its root terminates instead of looping forever on the last
link. A real cycle is not something you can build by accident either:
`initCause(this)` is refused with "Self-causation not permitted", and
`initCause` refuses a second call at all.

## Sentinel exceptions, and control flow

Sometimes an expected miss is thrown in a hot loop and the stack trace is pure
waste. The classic trick removes it:

```java
final class EndOfInput extends RuntimeException {
    EndOfInput() { super("end of input"); }
    @Override public synchronized Throwable fillInStackTrace() { return this; }
}
```

Now constructing one is about as cheap as constructing anything, because the
expensive half of an exception is walking the stack.

And you should still not do it. Compare the two APIs in this lesson:

```java
int i = indexOfOrThrow(values, target);   // needs a try/catch to be usable
int i = indexOf(values, target);          // -1, or an Optional, or a record
```

Absence is *data*. An exception is for a condition the caller did not ask about
and cannot continue past. When you use one as a return channel you get code
whose control flow is invisible at the call site, and a debugger that stops on
every "normal" miss. The sentinel technique is worth knowing so you recognise it
in a library — and so you know what it costs when you find that the stack trace
you needed is empty.

Java has no equivalent of JavaScript's habit of throwing plain objects, and that
is a mercy: every failure here is a `Throwable`, so every failure has a type, a
cause slot, and a trace.

## What to build

| Method | What it does |
| --- | --- |
| `InsufficientFunds` | Unchecked domain exception with `balance`/`requested`/`shortfall` |
| `ConfigException` | Checked, with all four constructors |
| `NotFound` | Sentinel with `fillInStackTrace` overridden away |
| `withdraw(long, long)` | Domain failure vs caller bug, as two different types |
| `readPort(String)` | Wraps a parse failure; range failure has no cause |
| `rootCause(Throwable)` | The bottom of the chain |
| `causeChain(Throwable)` | Every link as `SimpleName: message`, outermost first |
| `hasCause(Throwable, Class)` | Is this type anywhere in the chain |
| `wrapUnchecked(String, Exception)` | Wrap once, never twice |
| `indexOfOrThrow` / `indexOf` | The same search, thrown and returned |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `wrapUnchecked` returns an unchecked exception unchanged, which means the
   context string is lost for that path. What could you do instead, and what
   would it cost the reader of the stack trace?
2. `InsufficientFunds` is unchecked. Argue the other side: what would change for
   callers if it extended `Exception`, and who would be helped?
3. `hasCause` needs `Class.isInstance` rather than `getClass() == type`. Where
   else in Java does that distinction matter, and why can't `instanceof` be used
   with a `Class` object?
4. An exception's `getSuppressed()` array is empty here. What puts things in it,
   and what would `super(message, cause, false, false)` do to that?
