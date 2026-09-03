# 06 — Null Safety

Tony Hoare called the null reference his billion dollar mistake, and he invented
it. Java has no non-nullable reference type and never will retrofit one, so
null safety here is a set of habits and a few library methods rather than a
feature.

## Reject at the door: `Objects.requireNonNull`

```java
Account(String owner, List<String> signatories) {
    this.owner = Objects.requireNonNull(owner, "owner must not be null");
    this.signatories =
            List.copyOf(Objects.requireNonNull(signatories, "signatories must not be null"));
}
```

It returns its argument, which is the entire design: the check and the
assignment are one expression, so you cannot write the assignment and forget the
check. Always pass the message — a bare `requireNonNull(x)` throws an NPE
naming nothing.

**Where** matters as much as whether. Put it at the top of the constructor,
before any field is assigned, so a rejected object never half-exists. Put it at
the entry to a public method, not three calls deeper, so the stack trace points
at the caller who supplied the null rather than at the code that finally tripped
over it. That distance — between where a null is created and where it explodes
— is what makes NPEs expensive to debug.

## Helpful NullPointerExceptions

Since Java 15 the JVM generates a message describing exactly what failed
(JEP 358, on by default since 15):

```
Cannot invoke "String.length()" because the return value of
"Solution$Contact.name()" is null
```

Two halves: **what you tried to invoke**, and **which expression was null**. On
a chained expression, that second half is what saves you — `a.b().c().d()` used
to produce one bare NPE and four candidates.

Note what it can name. Fields, methods and array accesses are in the class file
by name, so they appear in full. Local variables only appear if the class was
compiled with `-g` (or `-g:vars`); otherwise you get `<local3>`. That is a
reason to build with debug info on, even in production.

The message is produced by the JVM at throw time, so an NPE you construct
yourself has none: `new NullPointerException().getMessage()` is `null`.

## The unboxing NPE

```java
Map<String, Integer> counts = …;
int n = counts.get("missing");     // NullPointerException
```

There is no dot on that line to blame. `get` returned `null`, and assigning to
`int` inserted an `intValue()` call the source does not show. Any place a
wrapper meets a primitive — assignment, arithmetic, a `?:` mixing `Integer` and
`int`, a `switch` on an `Integer` — can do this.

`getOrDefault(key, 0)` is the fix here. In general, be suspicious of any
`Integer`, `Long` or `Boolean` that came out of a map, a database row, or JSON.

## Defensive copies, in and out

```java
this.signatories = List.copyOf(signatories);       // in:  the caller cannot edit
List<String> signatories() { return signatories; } // out: already unmodifiable
```

Without the copy on the way in, the caller keeps a reference to the same list
and can add to it after construction — your invariants held for exactly as long
as it took them to call `add`. Without one on the way out, a caller can reach
into your internals through your own getter.

`List.copyOf` does three useful things at once: it copies, it returns something
unmodifiable, and it **rejects null elements**. `new ArrayList<>(source)` does
none of them. `Collections.unmodifiableList(source)` does only the second, and
is a *view* — the underlying list can still change under it.

## Null-hostile collections

`Map` does not say whether null keys or values are allowed, so implementations
disagree, and the most commonly used one is the odd one out:

| | null key | null value |
| --- | --- | --- |
| `HashMap` | allowed | allowed |
| `TreeMap` | rejected | allowed |
| `ConcurrentHashMap` | rejected | rejected |
| `Map.of(…)` | rejected | rejected |

`HashMap`'s permissiveness is why `map.get(k) == null` is ambiguous: absent, or
present-and-null? `containsKey` is the disambiguation, and needing it is a smell.
`ConcurrentHashMap` forbids both precisely so that `get` returning null has one
meaning in concurrent code.

The Java 9 factory methods — `List.of`, `Map.of`, `Set.of` — all reject nulls at
construction, so a null cannot get into the collection to be found later. Prefer
them, and prefer returning an empty collection over returning null: an empty
collection needs no check at the call site.

## The trap: `@Nullable` enforces nothing

```java
@Nullable static String maybeName(boolean present) {
    return present ? "Jane" : null;
}

String shout = maybeName(false).toUpperCase();   // compiles. NPE at runtime.
```

The annotation is metadata. `javac` reads it, records it, and does not check it.
It is not TypeScript's `string | null`, and no amount of annotating changes what
the compiler will accept.

What annotations *can* do is feed a separate tool: IntelliJ inspections,
Error Prone, the Checker Framework, NullAway. Those genuinely find bugs, and on
a codebase annotated consistently they find most of them. But they are opt-in,
they run outside `javac`, and they only see the code they are pointed at.

The ecosystem is also a mess. `javax.annotation.Nullable` (JSR-305, abandoned),
`org.jetbrains.annotations.Nullable`, `org.checkerframework.checker.nullness.qual.Nullable`,
`jakarta.annotation.Nullable` and several more all exist, all mean roughly the
same thing, and none is standard. JSpecify (`org.jspecify.annotations`) is the
current effort to end that, and is the one to reach for on new code.

The lesson: annotations are documentation with tooling potential. The things
that actually stop a null at runtime are `requireNonNull`, a null-hostile
collection, and a constructor that refuses to build.

## What to build

| Method | What it does |
| --- | --- |
| `required(T, String)` | `requireNonNull` with a message, returning the value |
| `npeMessage(Contact)` | What the JVM says about a null dereference |
| `Order` | Null checks first, then a defensive copy |
| `Order.customer()` | Never null, because the constructor refused |
| `Order.items()` | Safe to hand out |
| `nullTolerance(Map)` | What a given map implementation accepts |
| `countOf(Map, String)` | A count without the unboxing NPE |
| `safeList(List)` | Empty collection, never null, never modifiable |
| `maybeName(boolean)` | Annotated `@Nullable`, and still returns null |
| `isMarkedNullable(String)` | Reads the annotation back at runtime |

The `@Nullable` annotation type and the `Contact` record are provided — there is
nothing to implement in either.

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `Order` copies its list in the constructor. What does it cost for an order
   with a million items, and what would you do instead if the caller could
   promise not to mutate?
2. The helpful NPE message names fields and methods but not local variables
   unless `-g` was used. Look at what else `-g` puts in the class file and
   decide whether "we strip debug info in production" is defensible.
3. `Optional` from lesson 04 and `requireNonNull` here solve overlapping
   problems. Where does each belong, and why is `Optional` wrong for a field?
4. If you annotate a whole package `@NullMarked` (JSpecify) so that unannotated
   types mean non-null, what does that change about reading code — and what
   still breaks the moment a call crosses into a library that has not done it?
