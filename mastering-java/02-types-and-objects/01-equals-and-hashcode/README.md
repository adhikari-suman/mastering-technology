# 01 — equals and hashCode

`==` compares identity. Everything else in Java — set membership, map lookup,
`List.contains`, `assertEquals` — goes through `equals`, and `equals` only works
if you wrote `hashCode` to match. They are one feature with two method names.

## The default is identity

```java
class Point { final int x, y; /* ... */ }

new Point(1, 2).equals(new Point(1, 2));   // false
```

`Object.equals` is literally `this == other`, so two structurally identical
objects are unequal until you say otherwise. Overriding it is the only way in.
Note the signature: `equals(Object)`, not `equals(Point)`. Write
`equals(Point p)` and you have *overloaded* rather than overridden — it compiles,
the tests fail, and nothing tells you. `@Override` is what tells you, which is
why it goes on every override you write.

## The equals contract

For any non-null `x`, `y`, `z`:

- **reflexive** — `x.equals(x)` is true.
- **symmetric** — `x.equals(y)` iff `y.equals(x)`.
- **transitive** — if `x.equals(y)` and `y.equals(z)` then `x.equals(z)`.
- **consistent** — repeated calls give the same answer while nothing changes.
- **null-false** — `x.equals(null)` is false. Never throws; returns false.

These are not style advice. `HashMap`, `HashSet`, `List.contains`, `distinct()`
and every collection in the JDK assume them, and quietly misbehave when they do
not hold.

## The hashCode contract rides along

- Equal objects **must** have equal hash codes.
- Unequal objects *may* share one (a collision — legal, just slower).
- The hash code must not change while the object sits in a hash structure.

Only the first rule has teeth, and it is one-directional: `equals` implies same
hash, never the other way round.

Here is what a `HashSet` actually does with `add(p)`. It hashes `p`, picks a
bucket from the hash, and compares against what is already in that bucket. If
your `hashCode` is the inherited identity one, two equal objects land in
different buckets, the comparison never happens, and both go in:

```java
Set<Point> seen = new HashSet<>();
seen.add(new Point(1, 2));
seen.add(new Point(1, 2));
seen.size();     // 1 with hashCode overridden, 2 without
```

Same for `HashMap`: you `put` a value under a key, look it up with an equal key,
and get `null` back. Overriding `equals` and forgetting `hashCode` is not a
half-finished job — it is worse than doing neither, because now the object lies.

## `instanceof` vs `getClass`, and where symmetry dies

Two ways to write the type check:

```java
if (!(o instanceof Point p)) return false;      // accepts subclasses
if (o == null || getClass() != o.getClass()) return false;   // exact class only
```

`instanceof` is friendlier right up until someone subclasses you. Both classes
below compare the coordinates, and each starts with its own `instanceof`:

```java
class Loose  { int x, y; }                  // equals: instanceof Loose
class Tagged extends Loose { String tag; }  // equals: instanceof Tagged, + tag

Loose  a = new Loose(1, 2);
Tagged b = new Tagged(1, 2, "red");

a.equals(b);   // true  — b is a Loose with the same coordinates
b.equals(a);   // false — a is not a Tagged
```

Symmetry is broken, and with it every collection holding these. Whether
`set.contains(x)` is true now depends on which object the set happens to compare
first. There is no clever fix: either the class is `final` (a subclass cannot
exist, so `instanceof` is safe — this is why records work), or `equals` uses
`getClass()` and accepts that a subclass instance is never equal to a base one.

## `java.util.Objects` writes most of it

```java
Objects.equals(a, b)         // null-safe: (a == b) || (a != null && a.equals(b))
Objects.hash(x, y, tag)      // varargs combiner, order-sensitive
Objects.hashCode(x)          // 0 for null, x.hashCode() otherwise
Objects.requireNonNull(x, "x")   // throws NPE with a message, at the door
```

`Objects.equals(null, null)` is true — which is what you want inside `equals`
for reference fields. Two notes on `Objects.hash`: it boxes and allocates an
array, so hot code writes `31 * x + y` by hand; and `Objects.hash(x)` is *not*
`x.hashCode()` — it is `31 + x.hashCode()`, because it is really
`Arrays.hashCode(new Object[]{x})`.

`requireNonNull` is Java's fail-fast idiom. A null that is rejected in the
constructor produces a stack trace pointing at the caller who supplied it; a
null stored in a field produces one pointing at some unrelated method, hours
later.

## The trap: a mutable field in a hash key

```java
Set<Mutable> set = new HashSet<>();
Mutable p = new Mutable(1, 2);
set.add(p);
p.moveTo(9, 9);

set.contains(p);   // false — and p is still the only thing in the set
set.remove(p);     // does nothing
set.size();        // 1, forever
```

The set filed `p` in the bucket for hash(1, 2). Nothing tells the set that the
hash changed, so the lookup goes to the bucket for hash(9, 9) and finds an empty
one. The object is now unreachable through the API that contains it — you cannot
find it, cannot remove it, and iterating the set still yields it.

This is the deep reason value types get `final` fields. Anything used as a
`HashMap` key or in a `HashSet` must be immutable in every field that `hashCode`
reads, and the cheapest way to guarantee that is a class where nothing can
change at all.

## What to build

| Method | What it does |
| --- | --- |
| `Point` | A correct value class: final, `getClass` equals, matching hashCode |
| `Sloppy` | The same equals, deliberately **without** hashCode |
| `Loose` | `instanceof`-based equals on a non-final class |
| `Tagged` | Extends `Loose`, adds a field, breaks symmetry |
| `Mutable` | Equality over fields that can change under the set |
| `setSize(Object, Object)` | How many of two objects a `HashSet` keeps |
| `symmetric(Object, Object)` | Whether `a.equals(b)` agrees with `b.equals(a)` |
| `nullSafeEquals(Object, Object)` | Equality that tolerates nulls on both sides |
| `requireName(String)` | Fail-fast null rejection with a message |
| `containsAfterMove(Mutable)` | Add, mutate, then look up again |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `Point` is `final`. If it were not, and `equals` used `getClass()`, is the
   contract still satisfiable by a subclass that adds a field? What would
   `equals` have to give up?
2. A `HashSet` of `Sloppy` keeps duplicates. What does a `TreeSet` do with them,
   and which method does it consult instead?
3. `hashCode` returning a constant is legal — every object collides. What still
   works, what degrades, and to what complexity?
4. If two objects are `equals` and one is mutated so they are no longer equal,
   which of the five rules broke: consistency, or something else?
