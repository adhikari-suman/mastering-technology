# 01 — Values and Types

Java has two kinds of value, and almost every surprise in this lesson comes from
the seam between them.

## Primitives and references

Eight primitives — `boolean`, `byte`, `short`, `char`, `int`, `long`, `float`,
`double` — and everything else is a reference to an object. A primitive variable
*holds* its value. A reference variable holds an address.

```java
int a = 1;              // the box contains 1
String s = "hi";        // the box contains an arrow pointing at "hi"
```

That distinction decides what `==` means. On primitives it compares values; on
references it compares *identity* — are these the same object. It is never a
"compare the contents" operator, which is why `equals` exists.

## Boxing, and the cache that ruins `==`

Each primitive has a wrapper class (`int`/`Integer`, `char`/`Character`, …), and
Java converts between them automatically:

```java
Integer boxed = 42;     // autoboxing:   Integer.valueOf(42)
int back = boxed;       // unboxing:     boxed.intValue()
```

Convenient, and the source of the single most famous Java gotcha:

```java
Integer a = 127, b = 127;
Integer c = 128, d = 128;
a == b;   // true
c == d;   // false
```

`Integer.valueOf` keeps a cache of the values `-128..127` and returns the *same
object* for those. Above 127 you get a fresh object each time, so `==` — which
compares identity — goes false. The numbers are equal either way; the objects
are not. **Compare boxed values with `equals`, always.**

Unboxing has a second trap: a `null` wrapper unboxes by calling `.intValue()` on
`null`, so a `NullPointerException` comes out of what looks like arithmetic.

## Integers wrap; they don't overflow

```java
Integer.MAX_VALUE + 1 == Integer.MIN_VALUE   // true, and not an error
```

Java's `int` is a fixed 32 bits, and arithmetic silently wraps. Nothing warns
you. When a sum must not wrap, `Math.addExact`, `multiplyExact` and friends
throw `ArithmeticException` instead — this is what banks and array-index
arithmetic use.

Casting between primitives is likewise unchecked: `(byte) 200` doesn't complain,
it hands back `-56`, because it keeps the low 8 bits and the top one now means
"negative".

## Integer division truncates

`7 / 2` is `3`, not `3.5`, and `-7 / 2` is `-3` — **toward zero**, not floor
(floor would be `-4`). Division by zero throws `ArithmeticException`… but only
for integers. In floating point the same expression is `Infinity`, and `0.0/0.0`
is `NaN`, and neither throws.

The type of the *operands* decides, not the type you assign to:

```java
double wrong = 7 / 2;      // 3.0 — the division happened in int first
double right = 7 / 2.0;    // 3.5
```

## Floating point is not the reals

```java
0.1 + 0.2 == 0.3    // false
```

`double` is binary, and 0.1 has no exact binary form, exactly as 1/3 has no
exact decimal form. Never compare doubles with `==`; compare within a tolerance.
And `NaN` is unequal to everything including itself, so `x != x` is a working
NaN test — the one case where a value isn't equal to itself.

For money, don't use `double` at all. `BigDecimal`, or count in integer pence.

## `var` is not dynamic typing

```java
var count = 1;          // int, decided at compile time and fixed forever
count = "no";           // compile error
```

`var` infers the type from the initialiser. The variable is as statically typed
as if you had written it out; you just didn't have to.

## What to build

| Method | What it does |
| --- | --- |
| `describe(Object)` | The wrapper's simple name, or `"null"` |
| `safeAdd(int, int)` | Sum, throwing on overflow rather than wrapping |
| `sameBox(int, int)` | Whether two boxed Integers are the same object |
| `truncate(int)` | Narrowing cast to `byte` |
| `nearlyEqual(double, double, double)` | Tolerance comparison that rejects NaN |
| `parseOr(String, int)` | Parse an int, or fall back |
| `nextLetter(char)` | `'a'`→`'b'`, `'z'`→`'a'` |
| `intDivide(int, int)` | Integer division, including its throw |
| `floatDivide(int, int)` | The same sum in floating point, which never throws |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `describe(1)` returns `"Integer"` even though you passed an `int`. Could a
   method ever see the primitive? What would its signature have to be?
2. `sameBox(127, 127)` is true and `sameBox(128, 128)` is false. Would that
   change if you wrote `new Integer(127)` instead? (It would — which is part of
   why that constructor is deprecated for removal.)
3. `truncate(200)` is `-56`. Work out the bits by hand before you run it.
4. Why is `x != x` a valid test for NaN, and what does that imply about using a
   `double` as a `HashMap` key?
