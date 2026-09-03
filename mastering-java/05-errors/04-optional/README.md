# 04 — Optional

`Optional<T>` is a **return type** that says "there may legitimately be no
answer here". It is not a null-safety layer, and it is not a container you build
data structures out of. Almost every complaint about it comes from using it as
one of those two things.

## What it is for, and where it goes

```java
Optional<User> findByEmail(String email);   // yes: absence is a normal outcome
```

The signature now tells the caller something the compiler will enforce: they
cannot use the `User` without deciding what to do when there isn't one. That is
the entire value proposition, and it applies at exactly one place — the return
of a method whose answer may not exist.

Where it does not go:

- **Fields.** `private Optional<String> nickname` costs an extra object per
  instance and is not `Serializable`. Use a nullable field and return
  `Optional.ofNullable(nickname)` from the getter.
- **Parameters.** `void f(Optional<String> name)` forces every caller to wrap,
  including the ones with a value in hand. Overload, or accept null and document
  it.
- **Collections.** `List<Optional<String>>` and `Map<K, Optional<V>>` both have
  two ways to spell "nothing", and callers must handle both.
- **Anything already empty-able.** Never `Optional<List<T>>` — return an empty
  list. Never `Optional<String>` where `""` already means absent, unless blank
  and absent are genuinely different.

## Making one

```java
Optional.of(value)            // NullPointerException if value is null
Optional.ofNullable(value)    // empty if value is null
Optional.empty()
```

`Optional.of` throwing on null is deliberate: it is an assertion that you
believe the value is there. `ofNullable` is the one for the boundary, where a
map lookup or a database row may hand you a null.

## The combinators

```java
findUser(id)                             // Optional<User>
    .flatMap(User::manager)              // the fn returns an Optional
    .map(User::email)                    // the fn returns a plain value
    .filter(address -> address.endsWith(".com"))
    .or(this::escalationAddress)         // Optional in, Optional out
    .orElseGet(this::onCallAddress);     // unwrap, lazily
```

Each of these on an empty Optional is a no-op that stays empty, which is what
makes a chain safe with no `isPresent` in it. The rule of thumb: if the function
you are handing over returns an `Optional`, you want `flatMap`; otherwise `map`.
Getting this wrong gives you `Optional<Optional<T>>`, which the compiler will
tell you about immediately.

Java 9 added three that close most remaining gaps: `or(Supplier<Optional<T>>)`
for a fallback that is itself optional, `stream()` for viewing an `Optional` as a
stream of zero or one elements, and `ifPresentOrElse(Consumer, Runnable)` for
handling both branches in one call.

```java
Optional.of("a").stream().count()   // 1
Optional.empty().stream().count()   // 0
```

That second one is small and dull on its own. Its use is a `List<Optional<T>>`
or a stream of them: one step flattens the whole thing to the present values,
with no `isPresent` and no `get` anywhere in it.

## The trap: `orElse` evaluates its argument, always

```java
value.orElse(expensiveFallback())      // expensiveFallback() ALWAYS runs
value.orElseGet(this::expensiveFallback)  // runs only when value is absent
```

`orElse` takes a value, so Java evaluates the expression producing it before the
call happens — present or not. The result is discarded when the Optional has a
value, and the work has already been done.

This is ordinary eager argument evaluation, not an `Optional` quirk, but it is
invisible at the call site: the two lines read as synonyms. In a hot loop it is
a slowdown; when the fallback inserts a default row into a database, it is a
bug that only shows up as mysterious extra rows.

Reserve `orElse` for constants — `orElse("")`, `orElse(0)`, `orElse(EMPTY)` —
and use `orElseGet` for everything with a computation in it.

## `get()` is a smell

```java
String name = maybe.get();          // NoSuchElementException: No value present
String name = maybe.orElseThrow();  // identical behaviour, honest name
```

They are the same method — `get()` is the original, `orElseThrow()` was added in
Java 10 to give it a name that looks dangerous. Prefer the honest one.

More to the point: a chain that ends in `orElseThrow()` has usually thrown away
the reason it was an `Optional` in the first place. If the caller genuinely
cannot continue without a value, an exception with a real message beats a bare
`NoSuchElementException` — `orElseThrow(() -> new UserNotFound(email))`.

Java has no `?.` or `??`, and `Optional` is not a substitute for them: it is one
object allocation and a lambda per step. Inside a tight loop, an `if (x != null)`
is still the right code. `Optional` earns its keep at API boundaries, where the
type is documentation the compiler checks.

## What to build

| Method | What it does |
| --- | --- |
| `lookup(Map, String)` | `ofNullable` plus a `filter` for blankness |
| `parseInt(String)` | Failure as absence |
| `eagerFallback(Optional, Supplier)` | `orElse` — and its cost |
| `lazyFallback(Optional, Supplier)` | `orElseGet` — the same answer |
| `resolve(Map, Map, String)` | Two lookups chained with `flatMap` |
| `presentOnly(List<Optional>)` | `Optional::stream` |
| `preferred(Optional, Supplier)` | `or`, short-circuiting |
| `describe(Optional)` | `ifPresentOrElse`, both branches |
| `tagsOf(Map, String)` | Empty collection, never empty Optional |
| `demand(Optional)` | `orElseThrow` and its message |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `describe` needs a mutable holder to get a value out of `ifPresentOrElse`.
   Rewrite it as `map(...).orElse(...)` — which reads better, and when would the
   `ifPresentOrElse` shape actually win?
2. `Optional` has value-based `equals`, so `Optional.of("a").equals(Optional.of("a"))`
   is true. Given that, why does the javadoc warn against using one as a
   `HashMap` key or a lock?
3. `parseInt` swallows the `NumberFormatException` entirely. What has the caller
   lost compared to a `Result` type carrying the reason — and is that trade ever
   wrong?
4. There is no `Optional<int>`. What does `OptionalInt` exist for, why does it
   have no `map`, and what does that tell you about generics over primitives?
