# 05 — Generic API Design

Everything so far has been about reading generic signatures. This lesson is
about writing them, where the recurring question is: who pays? A signature that
is easy to write is usually one that makes every caller cast, copy or fight the
compiler.

## Be liberal in what you accept

A parameter you only read from should say so. The rule from lesson 03 is not
just about correctness — it is what decides whether callers can use your method
at all:

```java
static <T> List<T> copyOf(Collection<T> source)              // rigid
static <T> List<T> copyOf(Collection<? extends T> source)    // usable
```

With the first, `List<Integer> ints` can only produce a `List<Integer>`. With
the second, `List<Number> ns = copyOf(ints)` works, because `T` is free to be
inferred as `Number`.

The same applies to functional parameters, and there it matters more, because
callers reuse functions:

```java
static <T, R> List<R> mapAll(Collection<? extends T> src,
                             Function<? super T, ? extends R> fn)
```

`? super T` on the input lets a caller pass a `Function<Object, String>` to map
a list of `Integer`. `? extends R` on the output lets that same function produce
a `List<CharSequence>`. Written as plain `Function<T, R>`, both calls are
rejected for no good reason. Every `Function`, `Predicate`, `Consumer` and
`Comparator` parameter in `java.util` is wildcarded this way.

## Be concrete in what you return

The mirror rule: **never return a wildcard.**

```java
static <T> List<? extends T> bad(...)     // every caller now has a wildcard
static <T> List<T> good(...)              // callers get a usable list
```

A wildcard in a return type is contagious. The caller cannot add to what they
get back, cannot pass it to anything expecting a `List<T>`, and usually ends up
copying it just to get a real type. You already knew the element type when you
built the list; say it.

## Generic factory methods carry inference

Constructors infer badly and read badly. A static factory does both jobs:

```java
new Pair<String, List<Integer>>("k", list);   // written twice, by hand
Pair.of("k", list);                           // inferred, and shorter
```

Factories can also return a *different* type from the one they name — the same
reason `List.of` can hand back a specialised immutable class — and they can be
given names, so `Result.ok(x)` and `Result.error(e)` are distinguishable in a
way two constructors could never be.

## Return a small generic carrier, not `Object`

When a method has two answers, the choice is between an out-parameter, a
`Map<String, Object>`, or a type:

```java
record Split<T>(List<T> matched, List<T> rest) {}

static <T> Split<T> partition(Collection<? extends T> src, Predicate<? super T> p)
```

`Split<String>` gives the caller two `List<String>`s and no cast. A record makes
this three lines, so the "it isn't worth a class" argument no longer applies.
The same reasoning gives you `Optional<T>` for "maybe absent" rather than a
`null` the caller must remember to check.

## The trap: the self-type, and builders that stop chaining

Put shared builder methods in a base class and the chain breaks at the first
inherited call:

```java
abstract class AbstractBuilder {
    AbstractBuilder named(String n) { ...; return this; }
}
class UserBuilder extends AbstractBuilder {
    UserBuilder aged(int a) { ...; return this; }
}

new UserBuilder().named("ann").aged(30);   // COMPILE ERROR
```

`named` is declared to return `AbstractBuilder`, so that is the static type of
the expression, and `AbstractBuilder` has no `aged`. Covariant return types do
not save you — the base class cannot name a subclass that does not exist yet.

The fix is to let the subclass tell the base what it is, using a recursive bound
from lesson 02:

```java
abstract class AbstractBuilder<S extends AbstractBuilder<S>> {
    protected abstract S self();
    S named(String n) { ...; return self(); }
}
final class UserBuilder extends AbstractBuilder<UserBuilder> {
    @Override protected UserBuilder self() { return this; }
    UserBuilder aged(int a) { ...; return this; }
}
```

Now `named` returns `S`, which for a `UserBuilder` is `UserBuilder`, and the
chain survives in any order. The shape has a name — the curiously recurring
generic pattern — and it is in the JDK already:

```java
public interface BaseStream<T, S extends BaseStream<T, S>> extends AutoCloseable
```

which is why `IntStream.parallel()` gives you back an `IntStream` and not a
`BaseStream`. AssertJ's `AbstractAssert<SELF, ACTUAL>` is the same trick, and so
is most of the fluent-builder code you will read.

Two things to know about it. First, `S extends AbstractBuilder<S>` **does not
prove** `S` is the class doing the extending: `class Rogue extends
AbstractBuilder<UserBuilder>` compiles, and its `self()` has to return somebody
else's builder. The bound is a strong hint, not a guarantee. Second, `self()`
exists so subclasses can return `this` honestly; the alternative is
`@SuppressWarnings("unchecked") return (S) this;` in the base, which works right
up until somebody writes `Rogue`.

## What to build

| Method | What it does |
| --- | --- |
| `copyOf(Collection<? extends T>)` | A mutable `List<T>` from anything |
| `mapAll(Collection, Function)` | Fully wildcarded input and function |
| `partition(Collection, Predicate)` | Two lists in one generic record |
| `firstMatching(Collection, Predicate)` | `Optional<T>`, not a nullable `T` |
| `sortedCopy(Collection<? extends T>)` | A bound and a wildcard together |
| `AbstractBuilder.named(String)` | Returns `S`, so the chain survives |
| `AbstractBuilder.addTag(String)` | The same |
| `UserBuilder.self()` | The one line that makes `S` real |
| `UserBuilder.aged(int)` | A subclass step, callable after a base step |
| `UserBuilder.build()` | Produces an immutable `User` |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `partition` returns `Split<T>` with two lists. What would the signature have
   to look like to return three groups, and at what point is a `Map` better?
2. `firstMatching` returns `Optional<T>`. What does that cost a caller who
   already knows the element is there, and is `Optional` right for a method that
   is called in a loop?
3. `build()` copies the tag list. What happens if it does not, and how would a
   caller ever notice?
4. `S extends AbstractBuilder<S>` cannot force `S` to be the extending class.
   Sealed types can restrict who extends what. Could the two be combined to
   close the hole, and would it be worth it?
