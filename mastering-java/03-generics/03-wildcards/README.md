# 03 — Wildcards

Generic types are **invariant**: `List<Dog>` is not a `List<Animal>`, and never
will be. Wildcards are the escape hatch, and the price of the escape is that
each one takes something away.

## Why invariance is not a mistake

```java
List<Dog> dogs = new ArrayList<>();
List<Animal> animals = dogs;    // COMPILE ERROR — and a good thing
animals.add(new Cat());         // ...or this would put a Cat in a List<Dog>
```

Any language that lets a `List<Dog>` be seen as a `List<Animal>` has to check
every write at runtime. Java has that language already, for arrays:

```java
Object[] array = new String[1];
array[0] = 42;                  // compiles fine — throws ArrayStoreException
```

Arrays are covariant and pay for it with a runtime check on every store.
Generics chose the other trade: no runtime cost, no runtime check, and the
compiler says no.

## `? extends` — a producer you can read

```java
int countNegatives(Collection<? extends Number> numbers) {
    int found = 0;
    for (Number n : numbers) {
        if (n.doubleValue() < 0) found++;               // reading is fine
    }
    return found;
}
```

`Collection<? extends Number>` means "a collection of *some one* unknown subtype
of Number". You can read: whatever comes out is at least a `Number`. You cannot
write, because you do not know which subtype it holds:

```java
List<? extends Number> ns = List.of(1, 2);
ns.add(3);          // COMPILE ERROR
ns.add(3.0);        // COMPILE ERROR
ns.add(null);       // legal — null is a member of every reference type
```

`add` is not "disabled". Its parameter type is the unknown type itself, and no
expression you can write has that type — except `null`.

## `? super` — a consumer you can write to

```java
void appendRange(List<? super Integer> sink, int from, int to) {
    for (int i = from; i < to; i++) sink.add(i);         // writing is fine
}
```

`List<? super Integer>` means "a list of Integer or of some supertype". Every
such list can hold an `Integer`, so writing is safe. Reading gives you `Object`
and nothing better, because the element type could be as wide as `Object`:

```java
List<? super Integer> sink = new ArrayList<Number>();
Integer i = sink.get(0);        // COMPILE ERROR
Object o = sink.get(0);         // the best you get
```

## PECS

**Producer Extends, Consumer Super.** A parameter your method reads from gets
`? extends`; a parameter your method writes to gets `? super`. In one signature:

```java
static <T> void copy(List<? super T> dest, List<? extends T> src)
```

`src` produces `T`s, `dest` consumes them. Written this way, `copy` accepts a
`List<Dog>` source with a `List<Animal>` destination — which is what a caller
actually has, and what the invariant version would reject.

A parameter you both read and write gets no wildcard at all: it has to be
exactly `List<T>`.

## Unbounded `?`

`List<?>` is `List<? extends Object>`. Read as `Object`, write nothing but
`null`. It is the right type for a method that only counts, checks emptiness, or
prints — `List<Object>` would be wrong there, because a `List<String>` is not a
`List<Object>` either.

## The trap: a wildcard does not remember itself

```java
static void moveFirstToEnd(List<?> list) {
    Object first = list.remove(0);
    list.add(first);            // COMPILE ERROR
}
```

You took an element *out of the very same list* and cannot put it back. Each
appearance of `?` is a fresh unknown type — the compiler names them
`capture#1`, `capture#2` — so as far as it knows, `remove` returned one unknown
type and `add` wants a different one. It has no way to see they are the same.
The error says exactly that:

```
error: incompatible types: Object cannot be converted to CAP#1
  where CAP#1 is a fresh type-variable:
    CAP#1 extends Object from capture of ?
```

The fix is the **capture helper**: a private generic method whose type
parameter gives the unknown a name.

```java
static void moveFirstToEnd(List<?> list) {
    moveHelper(list);
}

private static <T> void moveHelper(List<T> list) {
    T first = list.remove(0);
    list.add(first);
}
```

Calling `moveHelper(list)` *captures* the wildcard: the compiler binds `T` to
whatever `?` actually is for this call, and inside the helper everything type
checks because `T` is a single named type. The two methods have identical
bodies' worth of information; only the naming differs.

There is a second road, which the JDK's own `Collections.swap` takes: assign the
list to a **raw** `List` local and do the work there. Raw types switch the
element-type checks off entirely, so nothing complains — and the JDK's source
carries a comment saying it knew the alternative:

```
// instead of using a raw type here, it's possible to capture
// the wildcard but it will require a call to a supplementary
// private method
```

Both compile. The helper is the version that keeps every check the compiler can
still make; the raw one turns them all off for the length of the method and
relies on the author being right. Prefer the helper.

`Collections.swap` is named here as the JDK's precedent, not as something to
call: `swap` below is yours to write, and delegating to the library version
turns the tests green without ever meeting the capture error.

## What to build

`Animal`, `Dog` and `Cat` are provided in `support/`.

| Method | What it does |
| --- | --- |
| `sumAll(Collection<? extends Number>)` | Total as a double — a pure producer |
| `fillSquares(List<? super Integer>, int)` | Append 0, 1, 4, 9 … — a consumer |
| `copyInto(List<? super T>, List<? extends T>)` | PECS in one signature |
| `countNulls(Collection<?>)` | The unbounded wildcard is enough |
| `swap(List<?>, int, int)` | Needs the capture helper |
| `concat(List<? extends T>, List<? extends T>)` | Two producers, one result |
| `maxOf(Collection<? extends T>)` | A bound and a wildcard together |
| `storeInto(Object[], Object)` | The runtime check generics do not need |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `concat` takes `List<? extends T>` and returns `List<T>`. Why is returning a
   wildcard — `List<? extends T>` — almost always a mistake?
2. `fillSquares` writes `Integer`s. Would `List<? super Number>` be a better
   parameter type, or a worse one? Which calls does each version accept?
3. `swap` works through the helper. Could you write it with an unchecked cast
   instead, and what exactly would be unchecked about it?
4. `Collection<?>` and `Collection<? extends Object>` mean the same thing. Is
   there any context where writing the longer one is clearer?
