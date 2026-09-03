# 06 — Class Tokens

Erasure took the type information away at runtime. This lesson is about handing
it back by hand — passing a `Class<T>` as an argument — and about how far that
gets you, which is further than you expect and then abruptly not far enough.

## `Class<T>` is a value that stands for a type

`String.class` has type `Class<String>`. That link between the *value* and the
*type parameter* is the whole trick: a method that takes a `Class<T>` learns
what `T` is at runtime, and can hand back a `T` with nobody casting.

```java
static <T> T attribute(Map<String, Object> attributes, String key, Class<T> type) {
    Object raw = attributes.get(key);
    if (!type.isInstance(raw)) {
        throw new IllegalArgumentException(key + " is not a " + type.getSimpleName());
    }
    return type.cast(raw);
}

String s = attribute(attributes, "name", String.class);   // no cast at the call site
```

`attributes` is a bag of `Object`. The token is what turns one entry back into a
`String` without the caller writing `(String)`.

`(T) x` and `type.cast(x)` look interchangeable and fail in completely different
places. `(T) x` inside a generic method erases to `(Object) x` and checks
nothing — the exception surfaces in your caller, as lesson 04's `uncheckedCast`
showed. `type.cast(x)` is an ordinary method call that makes the check `(String)
x` would have made, against a class it only learns at runtime, and throws where
the mistake actually is. `type.isInstance(x)` asks the same question without
throwing.

Two more things a token gives you that the language cannot:

```java
T[] array = (T[]) java.lang.reflect.Array.newInstance(componentType, length);
```

That is a real `String[]` when handed `String.class` — the working answer to
"you cannot write `new T[n]`". And for enums, `type.getEnumConstants()` returns
`E[]`, which is why `Class<E extends Enum<E>>` appears all over the JDK.

## Typesafe heterogeneous containers

A `Map<Class<?>, Object>` holds values of many types at once. Parameterise the
*methods* rather than the container and the API is type safe anyway:

```java
class TypeMap {
    private final Map<Class<?>, Object> values = new HashMap<>();

    <T> void put(Class<T> type, T value) { ... }
    <T> T get(Class<T> type)             { ... }
}
```

Both bodies are one line, and the interesting question is what `put` does with
`value` before storing it. Hand the raw `value` straight to the map and a caller
using a raw `Class` can file an `Integer` under `String.class`; the failure then
surfaces in whoever calls `get`, arbitrarily far away. Route it through the
token instead and the store fails at the store.

## The trap: `int.class` matches nothing, and `List.class` matches everything

Two ways a class token is less specific than it looks.

**Primitives have class objects that are not their wrappers.** `int.class` is a
real `Class<Integer>`-shaped object, and `isInstance` on it is always false —
there is no such thing as an object whose class is `int`:

```java
int.class.isInstance(1)        // false
Integer.class.isInstance(1)    // true
int.class == Integer.class     // false
Integer.TYPE == int.class      // true
```

Anything boxed arrives as its wrapper. Reach for `int.class` only when you are
reading reflection results, never as a token to match values against.

**A parameterized type has no class object at all.** There is no
`List<String>.class`; the syntax does not exist, because there is no such class
at runtime. `List.class` is a `Class<List>`, and it is the *only* token for
every `List<?>` there will ever be:

```java
map.put(List.class, List.of(1, 2));
map.put(List.class, List.of("a"));   // same key — the first is gone
```

The container cannot tell a `List<String>` from a `List<Integer>`, and neither
can `cast`. This is not a hole you can patch with more tokens.

## The super type token

There is one place a full parameterized type is written down and *kept*: a
class declaration. `class Foo extends TypeRef<List<String>>` records
`List<String>` in Foo's `Signature` attribute, and reflection can read it back.
Neal Gafter's trick makes an anonymous subclass just to have somewhere to write
it:

```java
abstract class TypeRef<T> {
    Type type() { ... }          // read the recorded argument back out
}

Type t = new TypeRef<List<String>>() {}.type();
t.getTypeName();     // "java.util.List<java.lang.String>"
```

The body is a chain of three reflection calls: ask the object for its class, ask
that class for its *generic* superclass, and take the first actual type argument
of what comes back.

The trailing `{}` is load-bearing: it is what creates the subclass. Without it
there is no declaration and no signature, and `getGenericSuperclass()` returns a
plain `Class` — the cast fails. This is exactly how Jackson's `TypeReference`
and Guice's `TypeLiteral` work, and why you write
`new TypeReference<List<User>>() {}` when you deserialise a JSON array.

What you get back is a `java.lang.reflect.Type`, not a `Class`. `Type` has four
interesting subtypes — `Class`, `ParameterizedType`, `WildcardType`,
`GenericArrayType` — and code that consumes them has to handle each.

## Reflection keeps what the bytecode discards

Erasure removes types from *values*, not from *declarations*. Every generic
signature you write is stored in the class file for the compiler's benefit, and
reflection will read it out:

```java
Method m = Reflected.class.getDeclaredMethod("names");
m.getReturnType()          // interface java.util.List      — the erasure
m.getGenericReturnType()   // java.util.List<java.lang.String>  — the source
```

So the type argument of a *field*, *parameter*, *return type* or *superclass* is
recoverable. The type argument of an *object* never is. That distinction is the
whole of erasure in one line.

## What to build

`Reflected` and the `Traffic` enum are provided in `support/`.

| Method | What it does |
| --- | --- |
| `castOrNull(Object, Class<T>)` | `isInstance` then `cast`, no caller cast |
| `filterByType(Collection<?>, Class<T>)` | Keep the elements of one type |
| `newArray(Class<T>, int)` | The runtime answer to `new T[n]` |
| `enumNames(Class<E>)` | A token plus the recursive `Enum<E>` bound |
| `TypeMap.put` / `TypeMap.get` | A typesafe heterogeneous container |
| `TypeRef.type()` | The super type token |
| `rawTypeOf(Type)` | Back from a `Type` to a `Class` |
| `genericReturnTypeOf(Class<?>, String)` | The signature erasure did not delete |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `TypeMap.get(List.class)` cannot distinguish `List<String>` from
   `List<Integer>`. Could a `TypeRef`-keyed map fix that, and what would `put`
   have to check?
2. `castOrNull(1, int.class)` returns null. Write the version that treats
   `int.class` as `Integer.class` — should a general-purpose API do that?
3. `newArray(String.class, 3)` produces a real `String[]`. What does
   `newArray(int.class, 3)` produce, and what happens when you assign it?
4. Jackson needs `new TypeReference<List<User>>() {}` but not for
   `User.class`. Given everything in this Part, explain that asymmetry in two
   sentences.
