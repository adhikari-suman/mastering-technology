# 04 — Type Erasure

Generics were added to Java in 2004 without changing the class file format or
breaking a single existing library. The way that was done — throw the type
arguments away after checking them — explains every strange rule in the
previous three lessons.

## What the compiler throws away

After type checking, `javac` replaces each type variable with its **leftmost
bound** and deletes the rest:

```java
class Box<T>                      ->  class Box            (T becomes Object)
<T extends Number> void f(T t)    ->  void f(Number t)
<T extends Comparable<T>> void g  ->  void g(Comparable t)
<T extends Number & Comparable<T>> void h  ->  void h(Number t)
List<String> names                ->  List names
```

Then it inserts the casts that make the erased code type correct. So this:

```java
List<String> names = ...;
String first = names.get(0);
```

compiles to `List names; String first = (String) names.get(0);`. **The cast is
always there.** You just did not write it. That is why a `ClassCastException`
can appear on a line with no cast in it — lesson 01's `poison` was exactly this.

What survives: the *declaration's* signature is kept in a `Signature` attribute
for the compiler and for reflection. What does not survive: which type argument
any particular *object* was created with. `new ArrayList<String>()` and
`new ArrayList<Integer>()` produce indistinguishable objects.

## The four things you cannot write

```java
<T> void f() {
    T t = new T();                     // no: which constructor?
    T[] a = new T[10];                 // no: the JVM needs a real element type
    Class<?> c = T.class;              // no: there is no class named T
    if (x instanceof List<String>) {}  // no: nothing to check at runtime
}
```

`instanceof List<?>` *is* allowed, because `?` asks nothing. `instanceof List`
is allowed too. Only a real type argument is refused, and refused as an error
rather than a warning, because the check could not be honest.

## Overloads that erase to the same thing collide

```java
void handle(List<String> s) { }
void handle(List<Integer> i) { }   // COMPILE ERROR: same erasure
```

Both become `handle(List)`. The error message — "name clash: both methods have
the same erasure" — is one you will meet, and the fix is always to rename one,
never to cast.

Return types do not help: two methods differing only in return type are illegal
in Java regardless of generics.

## Bridge methods

Erasure breaks overriding, so the compiler patches it. `Sized implements
Comparable<Sized>` has one `compareTo` in the source and two in the class file:

```
int compareTo(Sized)     the one you wrote
int compareTo(Object)    synthetic, "bridge", calls the one you wrote
```

The interface's erased method is `compareTo(Object)`, so something has to
implement *that* signature or the class would be abstract. The bridge does, by
casting and delegating. Two consequences worth knowing:

- Reflection over `getDeclaredMethods()` returns methods you never wrote. Filter
  with `Method::isBridge` when you enumerate.
- The cast lives inside the bridge, so calling `compareTo` through a raw or
  `Comparable` reference with the wrong argument type throws
  `ClassCastException` from a method that does not exist in your source.

## The trap: heap pollution through generic varargs

A varargs parameter is an array, and `T...` is a `T[]` — an array of a type that
does not exist at runtime. The compiler creates an `Object[]` and hopes:

```java
static <T> T firstOfFirst(List<T>... lists) {
    Object[] asObjects = lists;        // legal: every array is an Object[]
    asObjects[0] = List.of(42);        // legal: a List is a List
    return lists[0].get(0);            // returns an Integer, typed as T
}

String s = firstOfFirst(List.of("a")); // ClassCastException
```

Every line inside the method compiles, most without a warning, and the failure
lands on the caller. The array's own runtime check does not fire, because a
`List<Integer>` and a `List<String>` are both just `List`. The declaration
itself gets a warning — "possible heap pollution from parameterized vararg type"
— which is the compiler telling you it cannot help further.

If your varargs method genuinely only *reads* the array and never lets it
escape, say so with `@SafeVarargs`. That silences the warning at the declaration
*and* at every call site. It is a promise, not a check: the compiler only
verifies that the method is `static`, `final` or `private` so nobody can
override it with an unsafe version.

## What to build

`Sized` and `Erased` are provided in `support/`.

| Method | What it does |
| --- | --- |
| `arrayOf(T, int, T[])` | A real `T[]`, built from a template array |
| `unsafeArray(List<T>)` | The `(T[])` cast that works right up until it doesn't |
| `isListOfStrings(Object)` | What replaces the illegal `instanceof List<String>` |
| `uncheckedCast(List<?>)` | A cast that can never fail where it is written |
| `firstOfFirst(List<T>...)` | Heap pollution, and where the exception lands |
| `flatten(List<? extends T>...)` | The safe version, with `@SafeVarargs` |
| `declaredOverloads(Class<?>, String)` | See the bridge the compiler wrote |
| `erasedParameterType(Class<?>, String)` | See a type variable's leftmost bound |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `arrayOf` needs a template array to work; `unsafeArray` does not, and is
   broken. What does `Collection.toArray(T[])` do about this, and why does it
   take an array rather than a `Class`?
2. `isListOfStrings(List.of())` returns true. Is there any implementation that
   could return something better for an empty list?
3. `@SafeVarargs` on a method that stores the array in a field would compile.
   Construct the failure that follows.
4. C# reifies generics: `List<string>` is a real runtime type. Name two things
   Java gained by not doing that, and one it lost.
