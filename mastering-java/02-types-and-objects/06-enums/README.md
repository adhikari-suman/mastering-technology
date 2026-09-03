# 06 — Enums

A Java enum is not a list of named integers. It is a class with a fixed set of
instances, created once, at class-load time, and it can do everything a class
can do.

```java
enum Coin {
    PENNY(1), TWO(2), FIVE(5);          // the constants ARE the instances

    private final int pence;            // state

    Coin(int pence) { this.pence = pence; }   // always private

    int pence() { return pence; }             // behaviour
}
```

The constructor cannot be called from anywhere else — `new Coin(3)` does not
compile — so those three constants are the only `Coin` objects that will ever
exist. That is what makes `==` the right comparison for enums, and it is why
`Enum.equals` is `final`: there is nothing to override.

## Constant-specific class bodies

Each constant may carry its own body, overriding methods for itself alone:

```java
interface Calc { int apply(int a, int b); }

enum Op implements Calc {
    PLUS("+")  { public int apply(int a, int b) { return a + b; } },
    MINUS("-") { public int apply(int a, int b) { return a - b; } };

    private final String symbol;
    Op(String symbol) { this.symbol = symbol; }
    public String symbol() { return symbol; }
}
```

This is the strategy pattern with the boilerplate deleted: `Op.PLUS` is a
value, a name, and an implementation at once, and `evaluate(2, "+", 3)` becomes
a lookup plus a call. The alternative — a `switch` on the constant inside a
method — compiles too, but it puts the behaviour somewhere other than the case
it belongs to, and nothing forces you to update it when a constant is added.

There is a consequence worth knowing: a constant with a body is an anonymous
subclass, so `Op.PLUS.getClass()` is `Op$1`, not `Op`. Ask
`getDeclaringClass()` when you want the enum type — that is what `switch`,
`EnumMap` and `values()` all use.

## EnumSet and EnumMap

```java
Set<Day> midweek = EnumSet.of(THURSDAY, TUESDAY);
Map<Day, Integer> hours = new EnumMap<>(Day.class);
```

A `HashSet<Day>` hashes each constant, allocates a node per element and walks
buckets. An `EnumSet` is a **bit vector** — one `long`, for any enum with 64 or
fewer constants — so `contains` is a shift and a mask, `containsAll` is an
`and`, and the whole set fits in a register. An `EnumMap` is an **array indexed
by ordinal**, so `get` is a bounds check and an array read, with no hashing and
no collisions anywhere.

Both iterate in **declaration order**, whatever order you inserted in, which is
usually the order you wanted anyway. Both reject nulls as keys. `EnumSet` has no
public constructor: build them with `of`, `noneOf`, `allOf`, `range` and
`complementOf`.

For an enum key there is no case where `HashMap` or `HashSet` is the better
choice. It is a rare thing in a standard library — a specialised type that is
faster, smaller, better-ordered and no harder to use.

## `values()`, `valueOf`, `ordinal`

```java
Coin.values()           // a NEW array, every call
Coin.valueOf("PENNY")   // exact match, or IllegalArgumentException
Coin.PENNY.name()       // "PENNY"
Coin.PENNY.ordinal()    // 0 — position in the declaration
```

`values()` copies the array before handing it over, because arrays are mutable
and a shared one could be vandalised. That makes it cheap but not free: calling
it inside a loop allocates every time, which is what `EnumSet`/`EnumMap` and a
cached `private static final Coin[] VALUES` are for.

`valueOf` is exact and case-sensitive: `valueOf("penny")` throws
`IllegalArgumentException`, and `valueOf(null)` throws `NullPointerException`.
Parsing user input means catching that, or looking the value up yourself.

## The trap: `ordinal()` is a position, not an identity

```java
enum Coin { PENNY(1), TWO(2), FIVE(5) }        // FIVE.ordinal() == 2
enum Coin { PENNY(1), TWO(2), THREE(3), FIVE(5) }   // FIVE.ordinal() == 3
```

Nothing broke, nothing failed to compile, and every row you wrote to the
database as a `2` now reads back as `THREE`. The ordinal is derived from where
the constant happens to sit in the source, and inserting a constant — the most
natural edit there is — silently renumbers everything after it.

So: **never persist or transmit `ordinal()`**, and never index your own arrays
by it. If a number has to leave the process, give the enum an explicit field
that you control, and write *that* out:

```java
save(coin.ordinal());   // 2 today; 3 the morning after someone inserts THREE
save(coin.pence());     // 5, for as long as a five-pence piece is worth five
```

Reading it back is the mirror image, and it is a *search*, not an index: walk
`values()` looking for the constant whose own field matches the stored number,
and reject the numbers no constant claims.

`name()` has the same problem in weaker form — renaming a constant breaks stored
data — but a rename is at least an edit to the identifier itself, which is
visible in a diff and to a search. A reordering is invisible.

`ordinal()` is there for the JDK's own use: `EnumMap` indexes with it, `EnumSet`
shifts by it, `compareTo` compares it. Inside the process, where the array and
the enum are compiled together, it is exactly right. It is the boundary that
kills you.

## Enums as singletons

```java
enum Counter {
    INSTANCE;
    private int count;
    int next() { return ++count; }
}
```

One constant, therefore one instance, guaranteed by the class loader — which
gets you thread-safe lazy initialisation, and immunity to the two tricks that
break a hand-written singleton: reflection cannot call the constructor, and
deserialisation returns the existing constant rather than making a second one.
It is the shortest correct singleton in Java, and the state inside it is as
mutable and as shared as any other global, so the usual warnings apply.

## What to build

| Method | What it does |
| --- | --- |
| `Coin` | Constants with a field, a constructor and an accessor |
| `total(List<Coin>)` | Sum a handful of coins |
| `fromPence(int)` | Look up by the value you control, not by position |
| `Op` | Constant-specific bodies implementing `Calc` |
| `evaluate(int, String, int)` | Strategy lookup by symbol |
| `weekend()` | An `EnumSet` |
| `workdays()` | The complement of it |
| `hoursFor(List<Day>, int)` | An `EnumMap`, in declaration order |
| `dayOrNull(String)` | `valueOf` without the exception |
| `Counter` | The one-constant singleton |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `Op.PLUS.getClass()` is not `Op.class`, but `switch (op)` still works. What
   is the switch actually comparing?
2. `EnumSet` has two implementations, chosen by the number of constants. What is
   the cut-off, and what does the second one use?
3. An enum can implement an interface but cannot extend a class. Given that a
   constant body is a subclass, why is that restriction there?
4. `Counter.INSTANCE` holds mutable state. What happens to it across a
   serialise/deserialise round trip, and is that what you wanted?
