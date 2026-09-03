# 01 — Generic Types

Generics are how Java says "a list of strings" rather than "a list". They exist
entirely at compile time, which is why they are both easy to write and full of
sharp edges — this lesson covers the writing, and the rest of the Part covers
the edges.

## Declaring a type parameter

A type parameter goes in angle brackets after the name of the thing it belongs
to. Classes, interfaces and records take them:

```java
class Box<T> {
    private final T value;
    Box(T value) { this.value = value; }
    T get() { return value; }
}

record Pair<A, B>(A first, B second) {}

interface Transformer<I, O> { O apply(I input); }
```

Inside `Box`, `T` is an ordinary type name. You can declare fields of it, return
it, take it as a parameter. What you cannot do is `new T()`, `new T[10]` or
`T.class` — lesson 04 explains why.

The conventional single-letter names are `T` (type), `E` (element), `K`/`V`
(key/value), `R` (result), `S`/`U` (extra types). They are only conventions, and
a longer name is legal, but every Java reader expects the letters.

## Generic methods put the parameter before the return type

A method can introduce its own type parameters, independent of the class:

```java
static <T> List<T> repeat(T value, int times) { ... }
static <K, V> Map<V, K> invert(Map<K, V> source) { ... }
```

The `<T>` comes after the modifiers and before the return type. This trips
people up because it reads like a second return type. A method in a generic
class can add more:

```java
record Pair<A, B>(A first, B second) {
    <C> Pair<A, C> withSecond(C next) { ... }
}
```

`A` and `B` come from the record; `C` belongs to that one method call.

## Inference and the diamond

You almost never write the type arguments at a call site. Java infers them from
the arguments and, when that is not enough, from what the result is assigned to:

```java
var box = new Box<>("hi");                  // Box<String> — the diamond
List<String> empty = new ArrayList<>();     // inferred from the target type
Pair<String, Integer> p = pair("a", 1);     // static <A,B> Pair<A,B> pair(...)
```

`<>` is not the same as leaving the brackets off. `new ArrayList<>()` is a fully
generic `ArrayList<String>`; `new ArrayList()` is a **raw type**, and that is a
different thing entirely.

Explicit type arguments exist for when inference picks something you did not
want: `Solution.<Number>repeat(1, 3)` gives a `List<Number>`, not a
`List<Integer>`.

Inference reaches for the most specific type that fits *all* the arguments, and
that can be strange:

```java
static <T> T either(T a, T b) { ... }

var x = either("a", 1);   // T is an intersection of Comparable & Serializable,
                          // not Object
```

The compiler builds an intersection of everything `String` and `Integer` have
in common rather than falling back to `Object`.

## The trap: a raw type erases everything, not just the part you left off

`Box` (no brackets) is the raw type of `Box<T>`. It exists so that pre-2004 code
still compiles. Using one does not just make `T` become `Object` — it turns off
generics for *every* member of that type, including ones that never mentioned
`T`:

```java
class Registry<T> {
    T item() { ... }
    List<String> tags() { ... }
}

Registry<String> good = ...;
List<String> a = good.tags();   // fine

Registry raw = ...;
List<String> b = raw.tags();    // COMPILE ERROR: List, not List<String>
```

`tags()` has nothing to do with `T`, and it still comes back raw. This is the
"raw types poison everything downstream" rule, and it is why `List` and
`List<Object>` are not interchangeable: `List<Object>` is a real generic type
with checked operations, `List` is a hole in the type system.

The hole is real, not theoretical. Through a raw reference the compiler will let
you put anything into any collection:

```java
List<String> names = new ArrayList<>();
List raw = names;
raw.add(42);                   // unchecked warning, compiles, runs

names.get(0);                  // ClassCastException, in code with no cast
```

Nothing checks the element on the way in, because at runtime the list does not
know it is a `List<String>`. The failure surfaces at the *reader*, arbitrarily
far from the code that caused it. Java calls this state **heap pollution**.

If you are coming from TypeScript: a raw type is not `any`, it is worse. `any`
spreads to what it touches; a raw type retroactively un-generifies members that
had nothing to do with the missing argument.

## What to build

`Transformer<I, O>` is provided for you in `support/`.

| Method | What it does |
| --- | --- |
| `pair(A, B)` | A static generic factory returning `Pair<A, B>` |
| `Pair.swapped()` | `Pair<A, B>` → `Pair<B, A>` |
| `Pair.withSecond(C)` | A method-level type parameter on a generic record |
| `firstOr(List<T>, T)` | First element, or the fallback when empty |
| `repeat(T, int)` | A list of n copies |
| `invert(Map<K, V>)` | Keys and values swapped |
| `mapEach(List<I>, Transformer<I, O>)` | Apply the interface to each element |
| `lengthTransformer()` | A `Transformer<String, Integer>` as a lambda |
| `poison(List<String>, Object)` | Smuggle a non-String in via a raw reference |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `repeat("a", 3)` infers `List<String>`. What does `repeat(null, 3)` infer,
   and what does that say about where inference gets its information?
2. `invert` loses entries when two keys share a value. Could a signature stop
   the caller from hitting that, or is it inherently a runtime concern?
3. `poison` compiles with an unchecked warning rather than an error. Why did the
   language designers make that a warning? What breaks if it is an error?
4. `new Box<>(...)` needs a target to infer from. What does
   `var b = new Box<>(null);` infer, and will it compile at all?
