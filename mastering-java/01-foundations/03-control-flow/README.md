# 03 — Control Flow

The shapes are the ones you already know. What is new is that `switch` comes in
two forms with different rules, and that the ternary operator has a type system
of its own.

## Conditions are booleans, and only booleans

```java
if (list.size()) { }        // compile error: int is not boolean
if (name) { }               // compile error: String is not boolean
```

There is no truthiness. A condition is a `boolean` or it does not compile, which
kills a whole family of JavaScript bugs — and creates one of its own:

```java
boolean done = false;
if (done = true) { }        // compiles. assigns, then tests. always true.
```

`=` in a condition is only legal when the variable is a `boolean`, which is
exactly when you meant `==`. Some styles write `if (true == done)` to make the
mistake impossible; most rely on the compiler warning and on review.

`&&` and `||` short-circuit; `&` and `|` on booleans do not, and evaluate both
sides. `null == x` is a legal comparison and never throws — it is `x.equals(…)`
that does.

## Loops

```java
for (int i = 0; i < n; i++) { }
while (more()) { }
do { } while (more());            // body runs at least once
for (String s : list) { }         // the enhanced for
```

`do`/`while` exists for the case where the first iteration is unconditional —
counting digits in a number is the canonical one, because zero has one digit and
a plain `while` would report none.

The enhanced for reads from anything that is an array or an `Iterable`. It gives
you no index and no way to write back, and mutating the collection underneath it
throws `ConcurrentModificationException` on the next step:

```java
for (String s : list) {
    if (s.isEmpty()) list.remove(s);   // ConcurrentModificationException
}
list.removeIf(String::isEmpty);        // what you meant
```

## Labelled break and continue

`break` and `continue` apply to the innermost loop. A label lets them apply to
an outer one, which is the readable way out of a nested search:

```java
boolean anyNegative = false;
outer:
for (int[] row : matrix) {
    for (int value : row) {
        if (value < 0) { anyNegative = true; break outer; }
    }
}
```

A label is not a goto: it can only name an enclosing statement, and `break
outer` can only jump *out*. The alternative — a `done` flag re-tested in both
loop conditions — is longer and easier to get wrong.

## switch statements: labels, fallthrough, no exhaustiveness

The old form uses `:` labels, and execution falls through from one label to the
next until it hits a `break` or the end:

```java
int hits = 0;
switch (2) {
    case 1: hits++;
    case 2: hits++;
    case 3: hits++;
    default: hits++;
}
// hits == 3 — it entered at case 2 and kept going
```

Fallthrough is occasionally what you want — stacking labels that share a body is
the same mechanism — and is otherwise the most-forgotten `break` in the
language. A switch *statement* needs no `default`: if nothing matches, nothing
happens, silently.

## switch expressions: arrows, exhaustiveness, yield

The arrow form is an *expression*: it produces a value, never falls through, and
must cover every possible input.

```java
int days = switch (month) {
    case 1, 3, 5, 7, 8, 10, 12 -> 31;
    case 4, 6, 9, 11           -> 30;
    case 2                     -> leap ? 29 : 28;
    default                    -> throw new IllegalArgumentException("" + month);
};
```

Exhaustiveness is forced because the expression has to hand back a value on
every path — there is no "and otherwise nothing" for a value. Over an `int` or
a `String` that means you always need a `default`. Over an `enum` or a sealed
type the compiler can see every case, so you can and *should* omit `default`:

```java
enum Signal { RED, AMBER, GREEN }

int wait = switch (signal) {
    case RED   -> 60;
    case AMBER -> 5;
    case GREEN -> 0;
};                       // no default, and that is the point
```

Add a fourth constant to `Signal` and this stops compiling, naming the file that
needs updating. Write `default -> 0` instead and it compiles forever, silently
treating the new signal as green. **A `default` on an enum switch throws away
the best check the compiler offers you.**

When a case needs more than one statement, use a block and `yield` the value.
`return` is not allowed — it would return from the enclosing method, not from
the expression:

```java
String label = switch (code) {
    case 200 -> "ok";
    default  -> {
        String text = lookup(code);
        yield text == null ? "unknown" : text;
    }
};
```

## The conditional operator has its own type rules

The ternary looks like sugar for if/else. It is not: it is an expression, so it
has a single static type, computed from *both* branches — and when both are
numeric, the usual binary numeric promotion applies.

```java
Object o = true ? Integer.valueOf(1) : Double.valueOf(2.0);
o;                          // 1.0
o.getClass();               // class java.lang.Double
```

The condition is `true`, the taken branch is an `Integer` holding 1, and the
result is a `Double` holding 1.0. Both branches were unboxed, promoted to the
wider type, and the winner reboxed. Nothing warns you.

The same rule turns a null wrapper into an exception:

```java
Integer maybe = null;
int x = flag ? maybe : 0;   // NullPointerException when flag is true
```

`maybe` and `0` promote to `int`, so the branch is unboxed — and unboxing null
throws. **When the branches of a ternary have different types, work out the
result type before you trust it.** Casting both sides to a common reference type
(`(Object) …`) suppresses the promotion, but the honest fix is usually an
`if`/`else`, which has no type at all.

## What to build

| Method | What it does |
| --- | --- |
| `isLeapYear(int)` | The real rule, with its two exceptions |
| `daysIn(int, int)` | Days in a month, via a `switch` statement |
| `grade(int)` | A letter grade, via a `switch` expression |
| `waitSeconds(Signal)` | An exhaustive `switch` over an enum, no `default` |
| `digitCount(int)` | Digits in a number, including zero and MIN_VALUE |
| `countVowels(String)` | An enhanced for with a `continue` |
| `findPair(int[][], int)` | A nested search that leaves via a labelled break |
| `promote(boolean)` | The ternary promotion, made visible |
| `orDefault(Integer, int)` | A ternary that has to survive null |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `grade` switches on `score / 10`. Which scores collapse into the same case,
   and what does that do to your validation?
2. Why can a `switch` *statement* have no `default` while a `switch`
   *expression* must be exhaustive? State it in one sentence about values.
3. `digitCount(Integer.MIN_VALUE)` is 10. `Math.abs(Integer.MIN_VALUE)` is still
   negative. Why, and what does that mean for every `abs`-then-loop you write?
4. `break outer` leaves a loop. Java has a `goto` keyword reserved and unused.
   What could labelled break not express that a goto could, and is that a loss?
