# 03 — Sealed types

An interface says "anyone may implement me". A sealed interface says "these
three types implement me, and there will never be a fourth". That single
restriction is what turns a type hierarchy into a data model the compiler can
reason about.

```java
sealed interface Shape permits Circle, Square, Rectangle {}

record Circle(double radius) implements Shape {}
record Square(double side) implements Shape {}
record Rectangle(double width, double height) implements Shape {}
```

A TypeScript reader has met this before: it is a discriminated union, written
`type Shape = Circle | Square | Rectangle`. The difference is that Java's
version is enforced by the class file, not by a structural check at the seam.

## The permits clause, and the three forms

Every permitted subtype must (a) be in the same module — or the same package,
outside a module — and (b) declare how far the opening goes:

```java
final class Circle implements Shape {}          // stops here
sealed interface Compound extends Command       // continues, still closed
        permits Repeat, Then {}
non-sealed interface Custom extends Command {}  // reopened to the world
```

There is no fourth option and no default; leave the modifier off and it is a
compile error. That is the point — the hierarchy is closed unless someone says
otherwise *in writing*.

`permits` can be omitted when every subtype is declared in the same file, and
records are implicitly `final`, which is why `sealed interface` + `record` is
the pairing you see everywhere: the leaves need no modifier at all.

## Sealed + records = algebraic data types

A record is a product — a fixed bundle of fields, `and`. A sealed interface is a
sum — a fixed set of alternatives, `or`. Together they describe a domain as a
closed set of shapes, with no room for an object that is half of one and half of
another:

```java
sealed interface Command permits Move, Custom, Compound {}
record Move(int steps) implements Command {}
sealed interface Compound extends Command permits Repeat, Then {}
record Repeat(Command body, int times) implements Compound {}
record Then(Command first, Command second) implements Compound {}
```

Note that `Repeat` holds a `Command`, so the type is recursive: this is a tree,
and a whole little language, in five lines. Compare it with the shape most
codebases reach for — an abstract class with an `int type` field, or a string
tag, and a `switch` on the tag that nobody can prove is complete.

## Exhaustiveness without a default

```java
static String label(Shape s) {
    return switch (s) {
        case Circle c    -> "circle";
        case Square sq   -> "square";
        case Rectangle r -> "rectangle";
    };                                  // no default — and it compiles
}
```

Each label there is a **type pattern**: `case Circle c` matches when the
selector is a `Circle`, and binds `c` to it already narrowed, so the arm can
call `c.radius()` with no cast. That is the whole of what you need here; lesson
04 is where patterns get taught properly, including what they do about `null`.

A `switch` **expression** must produce a value on every path, so it must be
exhaustive. Over an unsealed type that means writing `default`. Over a sealed
one the compiler enumerates the permitted subtypes itself and, seeing all three
covered, accepts the switch with no `default` at all.

That is not a cosmetic saving. Add `record Triangle(...) implements Shape` to
the permits clause and every such switch in the codebase stops compiling, each
error pointing at a place that now has a decision to make. **A `default` branch
throws that away**: it silently absorbs the new case, and your triangle gets
whatever the fallback said. The moment a hierarchy is sealed, `default` becomes
a liability rather than good hygiene.

Exhaustiveness sees through nesting, too. Covering `Move`, `Custom`, `Repeat`
and `Then` is exhaustive for `Command`, because `Repeat` and `Then` are all that
`Compound` permits. So is covering `Move`, `Custom` and `Compound`. Pick the
level you want to work at.

## `non-sealed` is where the reasoning stops

```java
non-sealed interface Custom extends Command { int cost(); }
```

Anybody, anywhere, may now implement `Custom`, and every switch over `Command`
still compiles — because `case Custom c ->` covers whatever they wrote. You have
traded knowledge for extensibility at exactly one point in the hierarchy, and
you can see where: `getPermittedSubclasses()` on a `non-sealed` type returns
nothing, because there is nothing left to promise.

## The trap: a sealed switch is still not null-safe

```java
area(null);   // NullPointerException
```

Sealing tells you about *types*, and `null` has no type. A `switch` throws NPE
on a null selector before it looks at any case — the behaviour predates pattern
matching and it was kept so that adding patterns to a `switch` could not change
what an existing one did.

So exhaustive does not mean total. `switch` over a sealed interface handles
every value the type system admits, plus one it does not, and that one is the
value your callers are most likely to pass. Lesson 04 has the cure (`case
null`); until then, decide deliberately whether each entry point rejects null at
the door or accepts it.

## What to build

| Method | What it does |
| --- | --- |
| `Shape`, `Circle`, `Square`, `Rectangle` | A closed set of three cases |
| `area(Shape)` | An exhaustive switch with no `default` |
| `scale(Shape, double)` | A total function: every case in, the same case out |
| `Command`, `Move`, `Compound`, `Repeat`, `Then` | A recursive sealed hierarchy |
| `Custom` | The `non-sealed` escape hatch, with a method of its own |
| `cost(Command)` | Walk the tree, including whatever implements `Custom` |
| `script(Command)` | Render the same tree as text |
| `permittedNames(Class)` | What the class file remembers about the seal |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. Sealing also works on classes: `sealed abstract class Temperature permits
   Celsius, Fahrenheit`. Given that a record cannot extend anything, when would
   you reach for the class form?
2. `permits` requires the subtypes to be in the same package (outside a module).
   Why can that not be relaxed — what would an attacker do with a permitted
   subclass in a package they control?
3. `area` has no `default`, so adding a fourth shape breaks the build. What
   breaks instead if the switch was compiled against three shapes and then runs
   against a library that has four?
4. `Custom` is `non-sealed`, so `cost` cannot know what it is adding up. What
   have you actually gained over an ordinary unsealed interface at that point?
