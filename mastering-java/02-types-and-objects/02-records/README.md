# 02 — Records

Lesson 01 was forty lines of `equals`, `hashCode` and `toString` for a class
holding two ints. A record is that class, in one line, with the compiler writing
the forty lines for you.

```java
record Point(int x, int y) {}
```

## What the compiler generates

From that header you get:

- a **canonical constructor** taking `(int x, int y)`,
- two `private final` fields,
- **accessors** named `x()` and `y()` — not `getX()`; a record is not a bean,
- `equals` comparing every component, and a matching `hashCode`,
- `toString` in the form `Point[x=1, y=2]`.

The class is implicitly `final`, extends `java.lang.Record`, and cannot extend
anything else. `Point.class.isRecord()` is true, and
`Point.class.getRecordComponents()` gives you the components with their names
and types — the header survives into the class file, which is what lets
deconstruction patterns work in lesson 04.

You can still add methods, static members, and interfaces (`record Point(int x,
int y) implements Comparable<Point>`). What you cannot add is another instance
field: the header is the complete state.

## Three kinds of constructor

```java
record Money(String currency, long minorUnits) {

    Money {                                  // compact — no parameter list
        currency = currency.toUpperCase(Locale.ROOT);
        if (minorUnits < 0) throw new IllegalArgumentException("negative");
    }

    Money(String currency) {                 // alternative — must delegate
        this(currency, 0);
    }

    static Money parse(String text) { ... }  // static factory
}
```

The **compact** form is the one you will write nine times out of ten. It has no
parameter list and no field assignments: you get the constructor parameters as
mutable locals, you validate and reassign them, and the compiler emits
`this.currency = currency;` for every component after your code runs. Assigning
`this.currency` yourself inside a compact constructor is a compile error — you
adjust the parameter, not the field.

An **alternative** constructor is an ordinary overload, and Java's rule for
records is that it must hand off to another constructor as its first act. That
is worth noticing here: it is the one stub in this lesson that cannot be a
`throw`, because there is nowhere to put one.

`toUpperCase()` with no argument uses the default locale, so the same code turns
`"title"` into `"TİTLE"` on a Turkish machine. Any normalisation that is about
protocol rather than presentation takes `Locale.ROOT`.

## Records are *shallowly* immutable

The fields are final. What they point at is not.

```java
record Roster(String event, List<String> people) {}

List<String> signups = new ArrayList<>(List.of("ada"));
Roster roster = new Roster("launch", signups);
signups.add("bob");
roster.people();    // ["ada", "bob"] — someone else edited your record
```

The reference never changed, so nothing violated immutability; the object on the
end of it did. A record with a collection or array component needs a defensive
copy in the compact constructor, so that what it stores is a snapshot nobody
else holds a handle to.

`List.copyOf` is the one call that both copies and freezes: the caller's later
edits become invisible, and `roster.people().add(...)` throws
`UnsupportedOperationException`. (It also rejects null elements, which is
usually what you want.)

An **array** component cannot be fixed this way, because a record's generated
`equals` compares arrays by reference:

```java
record Packet(byte[] payload) {}
new Packet(new byte[]{1, 2}).equals(new Packet(new byte[]{1, 2}));   // false
```

Copying in the constructor makes the record safe but leaves `equals` broken.
Arrays and records do not mix; use a `List`.

## The trap: `double` components do not compare with `==`

A record's `equals` compares primitives with `==` — except `float` and `double`,
which it compares the way `Double.compare` does. The two disagree in exactly two
places, and both of them show up:

```java
record Weight(double kilos) {}

0.0 == -0.0;                                          // true
new Weight(0.0).equals(new Weight(-0.0));             // FALSE

Double.NaN == Double.NaN;                             // false
new Weight(Double.NaN).equals(new Weight(Double.NaN)) // TRUE
```

This is deliberate, and it is the right choice: it is the rule that makes
`equals` reflexive (`x.equals(x)` must hold, even for NaN) and consistent with
`hashCode`. But it means a record is not a thin wrapper over `==`, and code that
round-trips a measurement through a record can start disagreeing with code that
compares the raw `double`. It is the same rule `Double.valueOf` and `HashMap`
have always used; records just make you meet it sooner.

## When a record is the wrong choice

- **The components are the public API.** A record cannot hide, rename or
  restructure its state later without breaking every caller.
- **Identity matters.** A JPA entity, a cache node, anything you look up by
  reference: structural equality is wrong for those, and you cannot switch it
  off.
- **It has to be mutable**, or built up in stages, or extend a class.
- **Equality is domain-specific** — a `User` equal only by id, say. You can
  override `equals` in a record, but if you are overriding the thing the record
  gave you, you wanted a class.

## What to build

| Method | What it does |
| --- | --- |
| `Point` | The bare header, and everything the compiler adds |
| `Money` | Compact constructor: validate and normalise |
| `Money(String)` | Alternative constructor defaulting the amount |
| `Money.parse(String)` | Static factory over `"GBP 1250"` |
| `plus(Money, Money)` | Add two amounts, rejecting a currency mismatch |
| `Team` | A `List` component, copied defensively |
| `Range` | Validation, a `Range.of` factory, and a derived `length()` |
| `Weight` | One `double` component, and what its `equals` really does |
| `componentNames(Class)` | Read a record's shape back out at runtime |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. The compact constructor gets the parameters as locals. What happens if you
   reassign one *after* validating, and what does that imply about where
   normalisation has to go relative to validation?
2. `Range.of(5, 1)` sorts its arguments; the canonical constructor rejects them.
   Which of the two should a caller reach for, and what does that say about
   static factories versus constructors generally?
3. A record can implement an interface but cannot extend a class. Given lesson
   03, what does that make records good at?
4. `Team` copies its list in. What would it take to make a record deeply
   immutable in general — and why does the JDK not do it for you?
