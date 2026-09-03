# 02 — Strings and Text

`String` is the class you touch most and the one with the most folklore. Almost
all of it comes from two facts: a String never changes, and the compiler quietly
shares the ones it can.

## Immutable, and pooled

Every String method that "changes" a String returns a new one.

```java
String s = "hello";
s.toUpperCase();        // returns "HELLO" and throws it away
s = s.toUpperCase();    // this is how you meant it
```

Because they cannot change, identical *literals* can safely be the same object.
Every literal in your source goes into the **string constant pool**, and equal
literals point at one shared instance:

```java
String a = "hi";
String b = "hi";
a == b;                                 // true — one pooled object
String c = new StringBuilder("hi").toString();
a == c;                                 // false — built at runtime
a == c.intern();                        // true — intern looks it up in the pool
```

So `==` on Strings appears to work, right up to the first value that arrived
from a file, a socket, or a `StringBuilder` — and then it silently returns
false. **Compare Strings with `equals`, always.** `==` on a String is a bug that
passes your tests.

Concatenation of *constants* is folded at compile time, so `"h" + "i" == "hi"`
is true, while `x + "i"` with a variable `x` is not. Do not build a mental model
out of that; just use `equals`.

## Ordering with `compareTo`

```java
"apple".compareTo("banana");   // -1
"A".compareTo("a");            // -32
"Zebra".compareTo("apple");    // -7
```

`compareTo` returns a *magnitude*, not `-1`/`0`/`1` — it is the difference
between the first differing UTF-16 code units, or the length difference when one
string is a prefix of the other. Never test it with `== -1`; test its sign, or
normalise with `Integer.signum`.

The ordering is by code unit, which means every uppercase letter sorts before
every lowercase one — `"Zebra"` before `"apple"`. For human-facing sorting you
want `String.CASE_INSENSITIVE_ORDER` or a `Collator`.

## Building strings in a loop

`+` on Strings is not free. Each `+` produces a new String and copies everything
so far, so this is quadratic:

```java
String out = "";
for (String part : parts) out += part;      // O(n²) copying
```

The compiler turns a single expression like `a + b + c` into one concatenation
operation, but it cannot merge across loop iterations — each pass allocates a
new String and copies the whole accumulation into it. Do it explicitly:

```java
StringBuilder sb = new StringBuilder();
for (String part : parts) sb.append(part);
String out = sb.toString();
```

`StringBuilder` is a mutable char buffer with a fluent `append` that accepts any
type. Where the shape allows it, `String.join`, `"x".repeat(n)` and
`Collectors.joining` are better still, because they say what you mean.

## Text blocks

A `"""` block spans lines without escapes, and the compiler strips **incidental
whitespace**: the common indentation of all non-blank lines *and of the closing
delimiter line*.

```java
String note = """
        Dear %s,
          balance due: %d
        """.formatted("Ada", 42);
// "Dear Ada,\n  balance due: 42\n"
```

The two spaces before `balance` survive, because only the indentation *common*
to every line is incidental.

Two rules bite. First, the closing `"""` participates in that calculation: put
it further left than the content and you keep indentation you did not want.
Second, a text block ends with a newline when the closing delimiter is on its
own line, and does not when it sits right after the last character:

```java
String withNewline = """
        a
        b
        """;        // "a\nb\n"
String without = """
        a
        b""";       // "a\nb"
```

`formatted(...)` is `String.format` with the receiver as the pattern. Both are
locale-sensitive — `String.format(Locale.GERMANY, "%.2f", 1.5)` is `"1,50"` —
so pass `Locale.ROOT` for anything a machine will read back.

## `length()` is not the number of characters

Java Strings are UTF-16. A code point outside the Basic Multilingual Plane —
every emoji, most CJK extensions — is stored as a *surrogate pair*: two `char`s.

```java
"a😀b".length();                 // 4, not 3
"a😀b".codePointCount(0, 4);     // 3
"😀".charAt(0);                  // 0xD83D — half a character
```

`charAt`, `substring` and index arithmetic all count code units, so slicing at
the wrong index hands you an unpaired surrogate that renders as a box. Use
`codePointAt`, `Character.toChars` and `codePoints()` when the unit you mean is
"a character a human would count".

`StringBuilder.reverse()` is one of the few methods that knows: it keeps
surrogate pairs intact rather than reversing them into garbage.

## Splitting and trimming

`split` takes a **regex**, not a literal — `"a.b".split(".")` splits on every
character and hands back nothing. And by default it drops trailing empty fields:

```java
"a,b,,".split(",");        // ["a", "b"]         — two trailing fields gone
"a,b,,".split(",", -1);    // ["a", "b", "", ""] — a negative limit keeps them
"".split(",");             // [""]  — length 1, not 0
```

That last one catches everyone: splitting the empty string gives you an array
containing the empty string.

`trim` and `strip` are not synonyms. `trim` is the 1995 version: it removes
every character whose code is `U+0020` (the space) or below, and nothing above
it. `strip` is Unicode-aware, using `Character.isWhitespace`. They disagree in
*both* directions:

```java
"\u2003x\u2003".trim().length();     // 3 — an EM SPACE is invisible, but > U+0020
"\u2003x\u2003".strip().length();    // 1
"\u0001x\u0001".trim().length();     // 1 — a control character is not whitespace,
"\u0001x\u0001".strip().length();    // 3   but trim removes it anyway
```

Use `strip`. Note also `isBlank()` (empty or all whitespace) against
`isEmpty()` (length zero) — `"  ".isEmpty()` is false.

## Switching on a String

`switch` accepts Strings, compares with `equals`, and is case-sensitive.

```java
String kind = switch (day) {
    case null          -> "unknown";
    case "sat", "sun"  -> "weekend";
    default            -> "weekday";
};
```

Without that `case null`, a null selector throws `NullPointerException` — a
switch dereferences its selector before matching anything. `case null` is legal
in any switch since Java 21, and is the whole fix.

## What to build

| Method | What it does |
| --- | --- |
| `sameObject(String, String)` | Whether two Strings are the same instance |
| `compareSign(String, String)` | The sign of `compareTo`, normalised |
| `fields(String)` | Split on `,` keeping every empty field |
| `words(String)` | Whitespace-separated words, robust to blanks |
| `repeat(String, int)` | Repeat a unit, built without `+=` in a loop |
| `reverse(String)` | Reverse, without breaking surrogate pairs |
| `glyphCount(String)` | Code points, not code units |
| `firstGlyph(String)` | The first code point, whole |
| `dayKind(String)` | `switch` over Strings, null included |
| `query(String, int)` | A text block with values formatted in |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `sameObject("hi", "hi")` is true today. What would have to change about the
   JVM for it to be false, and why is relying on either answer a bug?
2. `"".split(",")` has length 1 but `",".split(",")` has length 0. Work out the
   single rule that produces both before you look it up.
3. `compareTo` is consistent with `equals` for String. Find a JDK class where it
   is not, and say what breaks when you put such an object in a `TreeSet`.
4. If `length()` counts code units and a code point can be two of them, how many
   `char`s is the flag emoji 🇬🇧, and what does that say about "character" as a
   unit at all?
