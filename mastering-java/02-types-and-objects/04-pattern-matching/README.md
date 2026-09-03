# 04 — Pattern matching

Java spent twenty years writing this:

```java
if (o instanceof String) {
    String s = (String) o;      // say String three times, then cast
    ...
}
```

A pattern says it once, and binds:

```java
if (o instanceof String s) { ... }
```

`instanceof` with a pattern is still `instanceof` — false for null, false for
the wrong type — but on success it declares `s` for you, already cast.

## Flow scoping

`s` is in scope exactly where the compiler can prove the pattern matched. That
is not "the block after the if"; it is computed from the control flow, so all
three of these are legal:

```java
if (o instanceof String s && s.length() > 3) { ... }     // && only
if (!(o instanceof String s)) return 0;
return s.length();                                        // s lives on

if (!(o instanceof String s)) throw new IllegalArgumentException();
```

The second is the one that surprises people: the *negated* test, with an early
return, leaves the binding in scope for the whole rest of the method — because
the only way to reach that code is for the pattern to have matched. This is why
the guard-clause style reads so well in modern Java.

`||` does not work the same way (`o instanceof String s || s.isEmpty()` does not
compile), for the same reason: on the right of `||` the pattern has *failed*.

## switch over patterns

```java
String kind(Object o) {
    return switch (o) {
        case null                   -> "absent";
        case Integer i when i > 99  -> "big number";
        case Integer i              -> "number";
        case CharSequence cs        -> "characters";
        default                     -> "something else";
    };
}
```

The selector can be any reference type now, not just `int`/`String`/enum. Arrow
labels do not fall through and no `break` is needed. As an expression, every arm
must produce a value.

`when` adds a **guard**: an ordinary boolean expression that can use the
bindings. It is not part of the type test, and that has a consequence worth
remembering — a guarded case never counts towards exhaustiveness, because the
compiler cannot evaluate your condition. A switch whose arms are all guarded
needs a `default`, however obviously total the guards look.

## `case null`, and why the default does not catch it

Before patterns, `switch (s)` on a null String, Integer or enum threw
`NullPointerException` — always, and before any label was considered. Pattern
switches kept that behaviour so adding patterns could not silently change an
existing switch, and gave you one way out:

```java
case null -> "nothing";           // opt in explicitly
case null, default -> "unknown";  // or fold it into the fallback
```

Only the presence of a `null` label changes anything. A lone `default` does
**not** match null; a switch with a `default` and no `case null` still throws.
Since `case null` is the only label that matches null, dominance never applies
to it, and by convention it goes first.

## Record patterns

A record's header is in its class file, so a pattern can take one apart:

```java
case Point(int x, int y) -> "point " + x + ", " + y;
```

`x` and `y` are bound to the components. Nest them as deep as the data goes:

```java
case Line(Point(int x1, int y1), Point(int x2, int y2)) when y1 == y2
        -> "horizontal";
case Circle(Point centre, int r) -> "circle around " + render(centre);
```

`var` infers a component's type (`Point(var x, var y)`), and `_` — the unnamed
pattern — matches a component you do not need:

```java
o instanceof Circle(Point(int cx, _), _) && cx == 0
```

Combined with lesson 03, this is the pay-off: a sealed hierarchy of records, a
switch with one arm per case, no `default`, and the compiler checking that the
set is complete.

## The trap: a nested pattern refuses a null component

```java
record Line(Point from, Point to) {}
Line partial = new Line(null, new Point(3, 4));

case Line(Point(int x1, int y1), Point(int x2, int y2)) -> "full";
case Line l                                             -> "partial";
```

`partial` lands on the second arm. A nested *deconstruction* has to call
`from.x()` to get at the components, so it cannot match null and simply does not
— the match fails and the switch moves on. But a plain type pattern in the same
position, `Line(Point from, Point to)`, matches happily and binds `from` to
null, because a type pattern whose type is the component's own type is
unconditional.

So `Circle(Point centre, int r)` will hand you a null `centre`, and
`Line(Point(int x, int y), ...)` never will. Two patterns that look equally
"safe" differ on exactly the value that breaks things, and nothing warns you.
When a component can be null, deconstruct one level and check, or reject the
null in the record's compact constructor — which is the real fix.

## Dominance: order is checked, not just used

A case that can never be reached is a compile error, not dead code:

```java
case Object o -> "any";        // error on the next line:
case String s -> "text";       //   this case label is dominated by a preceding one
```

The same applies to a guarded label after its unguarded twin: `case Integer i`
covers everything `case Integer i when i < 0` could, so the guarded one must
come first. The practical rule is simply **most specific first**, and if you get
it wrong the compiler tells you — which is the opposite of an `if/else` chain in
the wrong order, where the unreachable branch is silent.

## What to build

| Method | What it does |
| --- | --- |
| `describe(Object)` | An `instanceof`-pattern chain with `&&` guards |
| `lengthOrZero(Object)` | The negated pattern, and where the binding lives |
| `classify(Object)` | A switch with `case null`, guards, and order that matters |
| `tag(Object)` | The combined `case null, default` label |
| `Figure`, `Point`, `Line`, `Circle` | A sealed hierarchy to take apart |
| `render(Figure)` | Nested record patterns, guards, and null components |
| `translate(Figure, int, int)` | Deconstruct and rebuild |
| `isHorizontal(Object)` | Unnamed patterns inside a record pattern |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. Swap the two `Integer` arms in `classify` and read the compile error. Now
   swap the `String` arms in `render` — why is that one *not* an error?
2. `case null, default` is legal; `case null, String s` is not. What would the
   second one have to mean, and why did they refuse to pick an answer?
3. `render` has no `default`. If `Figure` gains a fourth case, how many files
   fail to compile, and is that the same set that would have been wrong at
   runtime under an `if/else` chain?
4. A record pattern reads the components by calling the accessors. What does
   that mean for a record whose accessor is overridden to compute something?
