# 02 — Bounded Types

An unbounded `T` is a type you know nothing about, so the only methods you can
call on it are `Object`'s. A bound is how you buy back the ability to do
something with the value.

## `extends` means "or a subtype of", for classes and interfaces both

```java
static <T extends Number> boolean anyNegative(List<T> values) {
    for (T v : values) {
        if (v.doubleValue() < 0) return true;      // legal: T IS-A Number
    }
    return false;
}
```

Without the bound, `v.doubleValue()` does not compile — `T` could be anything.

Java writes `extends` even when the bound is an interface, and even when the
type argument will `implements` it rather than `extends` it. There is no
`implements` in a type parameter list. `<T extends Comparable<T>>` is the
normal shape.

## Multiple bounds, separated by `&`

```java
static <T extends Number & Comparable<T>> T largestPositive(List<T> values)
```

`T` now has `doubleValue()` *and* `compareTo`. Rules:

- At most one of the bounds may be a class, and it must be written first.
- The rest must be interfaces.
- The type argument has to satisfy all of them, which rules out a lot: no
  single JDK type is both `Number` and `CharSequence`, for instance.

## Recursive bounds: `T extends Comparable<T>`

This looks circular and is not. It reads "T is a type that can be compared *to
itself*", and it is the standard way to say "orderable":

```java
static <T extends Comparable<T>> T max(List<T> items)
```

`String` satisfies it because `String implements Comparable<String>`. `Object`
does not. Crucially, neither does `Number` — `Number` is not `Comparable` at
all, only its concrete subclasses are, so `max(List<Number>)` will not compile
however obvious it looks.

`Enum<E extends Enum<E>>` in the JDK is the same trick, and it is what makes
`someEnumValue.getDeclaringClass()` return `Class<E>` rather than `Class<?>` —
the type parameter carries the enum's own identity back to you.

## The trap: `Comparable<T>` is too tight for inherited orderings

Write the obvious bound and it breaks the moment somebody subclasses:

```java
class Item implements Comparable<Item> { ... }
class Weapon extends Item { ... }

static <T extends Comparable<T>> T max(List<T> items) { ... }

max(List.of(new Weapon(...)));   // COMPILE ERROR
```

`Weapon` is not `Comparable<Weapon>`. It is `Comparable<Item>`, inherited. The
bound demands `T extends Comparable<T>` with `T = Weapon`, and `Weapon` does not
satisfy it. Nothing is wrong with the code; the *bound* is wrong.

The fix is to allow the ordering to live anywhere up the hierarchy:

```java
static <T extends Comparable<? super T>> T max(List<T> items)
```

"T can be compared to T, or to anything T is." Now `Weapon` works, because
`Comparable<Item>` is a `Comparable<? super Weapon>`. This is why every
signature in the JDK that orders things — `Collections.max`, `Collections.sort`,
`Comparator.naturalOrder` — is written with `? super`. Copy that shape by
reflex; the tighter version is a bug waiting for a subclass.

## There is no `super` bound on a type parameter

```java
static <T super Integer> void f(T t)   // does not compile, ever
```

A lower bound on a type *parameter* would be almost useless: `T` would have no
known methods beyond `Object`'s, since the only thing you would know is that `T`
is somewhere *above* `Integer`. Every method you could call on it, you could
already call on an `Object`. So the language does not offer it.

`? super` exists on *wildcards*, where it does mean something — see lesson 03.
When you want a "T or a supertype of T" relation on a method, express it in the
argument types (`Comparable<? super T>`, `Consumer<? super T>`) rather than on
`T` itself.

## What to build

`Item`, `Weapon` and the `Suit` enum are provided in `support/`.

| Method | What it does |
| --- | --- |
| `max(List<T>)` | Largest by natural order; must accept a `List<Weapon>` |
| `clamp(T, T, T)` | Value pinned between a low and a high |
| `isSorted(List<T>)` | Non-decreasing, by natural order |
| `countGreaterThan(List<T>, T)` | How many elements beat the pivot |
| `sum(List<T extends Number>)` | Total as a `double` |
| `positivesSorted(List<T>)` | Multiple bounds: filter by value, sort by order |
| `next(E)` | Next enum constant, wrapping — a recursive `Enum<E>` bound |
| `maxBy(List<T>, Function<T, U>)` | A bound on the *key* type only |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `max` on an empty list has to do *something*. Java's `Collections.max`
   throws; `Stream.max` returns `Optional`. Which is right here, and what does
   the choice cost the caller?
2. `<T extends Number & Comparable<T>>` erases to `Number`, and
   `<T extends Comparable<T>>` erases to `Comparable`. Work out which class the
   compiled bytecode names for each, then check with `javap -s`.
3. `maxBy` bounds `U` but not `T`. What went wrong if you find yourself wanting
   to bound `T` as well?
4. `Comparable<? super T>` accepts an inherited ordering. What stops a subclass
   from *narrowing* the ordering — could `Weapon` implement `Comparable<Weapon>`
   as well, and what happens if it tries?
