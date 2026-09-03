# 03 — try-with-resources

Cleanup is the part of error handling that has its own error handling. Java 7
made a language feature of it because everybody, including the JDK, was getting
the hand-written version wrong.

## The two interfaces

```java
public interface AutoCloseable { void close() throws Exception; }
public interface Closeable extends AutoCloseable { void close() throws IOException; }
```

`Closeable` predates `AutoCloseable` and is the I/O-specific one. Anything
implementing either may appear in a try-with-resources header.

An override may **narrow** the throws clause, and a resource type of your own
usually should narrow it all the way to nothing:

```java
final class Probe implements AutoCloseable {
    @Override public void close() { … }     // no throws clause at all
}
```

That is not cosmetic. If `close()` declares `throws Exception`, every caller of
every try-with-resources over your type is forced to catch `Exception` — the
catch-all this Part spent lesson 01 warning about. Narrow the signature and the
problem disappears.

`close()` should also be idempotent: the JDK's own contract asks for it, because
resources get closed twice more often than you would think.

## The statement

```java
try (Probe a = new Probe("a"); Probe b = new Probe("b")) {
    a.use();
    b.use();
}
// closes b, then a
```

Resources are closed in the **reverse** of declaration order, because a later
resource may have been built from an earlier one — the reader wrapping the
stream must close before the stream does.

Resource variables are implicitly final; you cannot reassign `a` inside the
block. Since Java 9 the header may also name an existing final or effectively
final variable, with no new declaration:

```java
try (probe) { probe.use(); }
```

And a `null` resource is simply skipped — the generated code null-checks before
calling `close()`, so `try (Probe p = null) { … }` does not throw.

## The ordering that surprises everyone

```java
try (Probe a = new Probe("a")) {
    throw new IllegalStateException("body");
} catch (IllegalStateException e) {
    // a is ALREADY CLOSED here
} finally {
    // and here
}
```

Resources close when the `try` **block** ends, before any `catch` or `finally`
attached to the same statement. The order is: body, close, catch, finally.

The consequence: a catch block cannot use the resource it is reporting on. If
your handler needs to read a connection's last error or a stream's position, it
has to capture that inside the try block, or the resource needs an outer scope.

## The trap: `finally { close(); }` destroys the real error

This is the shape every pre-2011 tutorial taught:

```java
Probe a = new Probe("a");
try {
    throw new IllegalStateException("body");     // the real failure
} finally {
    a.close();                                   // which also throws
}
```

What escapes is the exception from `close()`. The `IllegalStateException("body")`
— the one describing what actually went wrong — is discarded by exactly the
mechanism from lesson 01: the finally block completes abruptly and replaces the
exception in flight. And `getSuppressed()` is empty, so there is nowhere to go
looking for it.

Real version: the database write fails, the connection close then fails because
the connection is broken, and the only thing in your log is
"connection already closed". The cause is invisible.

try-with-resources fixes this properly rather than by being tidier:

```java
try (Probe a = new Probe("a", log, true); Probe b = new Probe("b", log, true)) {
    throw new IllegalStateException("body");
}
// escapes: IllegalStateException("body")
// e.getSuppressed(): [close:b, close:a]
```

The body's exception wins; each close failure is attached to it with
`addSuppressed`. Nothing is lost, and `printStackTrace` renders the extras as
`Suppressed:` blocks under the main trace. When the body succeeds and only the
close fails, the close failure is the only failure, and it escapes normally.

`addSuppressed` is an ordinary `Throwable` method — try-with-resources is simply
calling it for you.

JavaScript's `finally` has the same replace-the-in-flight-exception rule, but no
suppression list and, until very recently, no `using` declaration. If you have
written `try { … } finally { conn.close(); }` in Node and thought it correct,
this is the lesson where that stops being true.

## What to build

| Method | What it does |
| --- | --- |
| `Probe` | A resource that logs open/use/close and can fail on close |
| `closeOrder(List)` | Two resources, one header — watch the close order |
| `closeBeforeCatch(List)` | Where close sits relative to catch and finally |
| `bodyWinsOverClose(List)` | Body throws, both closes throw, nothing is lost |
| `closeFailsAlone(List)` | Body succeeds, close throws |
| `finallyCloseBug(List)` | The hand-written version, and what it destroys |
| `useExisting(Probe)` | The Java 9 header form over an existing variable |
| `nullResource(List)` | A null resource |
| `readLines(String)` | A genuine `Closeable` from `java.io` |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `finallyCloseBug` loses the body's exception. Write the pre-Java-7 code that
   does *not* lose it. How many lines, and how many people would get it right?
2. Resources close before `catch`. Design an API where the handler genuinely
   needs the resource — what does the shape of your code have to become?
3. If `close()` is called twice, what does yours do? What does
   `BufferedReader`'s do?
4. `getSuppressed()` returns an array, not a `List`, and `addSuppressed` rejects
   adding a throwable to itself. Why would the JDK bother checking that?
