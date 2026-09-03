# 06 — Classes and Objects

A class is a template for state plus the operations that keep that state
truthful. Most of this lesson is about the order things happen in when an object
comes into existence, and about the four different things Java means by
"a class inside a class".

## Fields, constructors, and the one that disappears

```java
class Point {
    final int x;
    final int y;

    Point() { this(0, 0); }
    Point(int x, int y) { this.x = x; this.y = y; }
}
```

A class with no declared constructor gets a no-argument one for free. **Write
any constructor and that free one is gone** — which is why adding
`Point(int, int)` to a published class breaks every `new Point()` in the world.

`this.x = x` is not a style choice: the parameter `x` shadows the field, so the
qualified form is the only way to reach it. `this(0, 0)` calls a sibling
constructor and `super(...)` calls the superclass one; exactly one of the two
runs, you may not write both, and if you write neither the compiler inserts
`super()` for you.

That call used to have to be the literal first statement. **Flexible constructor
bodies** — a preview since 22 and final in 25 — allow a *prologue* in front of
it, so an argument can be rejected before a half-built object exists:

```java
Range(int high) {
    if (high < 0) throw new IllegalArgumentException("negative: " + high);
    this(0, high);            // a compile error before Java 22
}
```

The prologue runs in a *pre-construction context*, where `this` does not yet
exist: you may not name `this`, read an instance field, or call an instance
method, and the compiler says so in those words. (Assigning a field of the class
being constructed is the one exception it does allow.) What changed is only that
a guard no longer has to be smuggled into a static helper on the argument list;
putting the delegation first is still the ordinary shape.

A `final` field must be assigned exactly once, by the end of every constructor,
and never again. That is how you get an immutable object, and immutable objects
are the ones you never have to reason about twice.

## Initialisation order

Four kinds of code can run when an object is created, and they run in a fixed
order rather than the order you would guess:

```java
class Trace {
    static { note("static"); }          // once, when the class is first used
    String name = note("field");        // per instance
    { note("block"); }                  // per instance, an instance initialiser
    Trace() { note("constructor"); }    // per instance, last
}

new Trace();     // logs: static, field, block, constructor
```

The static initialiser runs once, at class initialisation, long before any
instance exists. Then, for each instance: **field initialisers and instance
initialiser blocks run in source order, interleaved, and only then does the
constructor body run**. Move the `{ }` block above the field and the log
changes.

This matters because a constructor that calls an overridable method can observe
a subclass's fields *before they are initialised* — the subclass's field
initialisers have not run yet. Do not call overridable methods from a
constructor.

## static means "belongs to the class"

```java
static final List<String> LOG = new ArrayList<>();
static String note(String stage) { LOG.add(stage); return stage; }
```

One copy, shared by every instance and reachable with no instance at all. Static
initialiser blocks run once, when the class is first actively used — not at JVM
startup, and not at load. `static final` on a compile-time constant
(`static final int MAX = 10`) is inlined into callers at compile time, which is
why changing one without recompiling its users is a classic stale-value bug.

## Encapsulation is about invariants, not about getters

```java
class Account {
    private long balance;                            // nobody else may write this

    void withdraw(long amount) {
        if (amount <= 0 || amount > balance) throw new IllegalArgumentException();
        balance -= amount;
    }
}
```

`private` is enforced by the compiler and exists so that the class can promise
something — here, "the balance is never negative". A field with a public getter
and setter is not encapsulated; it is a field with extra steps. Java's access
levels are `private`, package-private (the default, and genuinely useful),
`protected`, and `public`.

## toString

`Object.toString` returns the class name, `@`, and the identity hash —
`Point@1b6d3586`. It is never what you want in a log line:

```java
@Override
public String toString() { return "Point[" + x + ", " + y + "]"; }
```

`@Override` is optional and you should always write it: it turns a typo'd
signature from a silently-ignored new method into a compile error. (A `record`
writes this method, plus `equals` and `hashCode`, for you — that is the next
Part.)

## Four kinds of class-inside-a-class

```java
class Outer {
    private String label;

    static class Nested { }        // static nested: just a namespaced class
    class Inner { }                // inner: holds a hidden Outer reference

    void method() {
        class Local { }            // local: visible only inside this method
        Runnable r = new Runnable() {   // anonymous: a class + one instance
            @Override public void run() { }
        };
    }
}
```

A **static nested** class is an ordinary class that happens to live inside
another's namespace. It has no access to the outer instance's fields, because
there need not be one.

An **inner** class has a hidden `Outer.this` field, so it can read `label`
directly — and so it cannot be created without an outer instance:

```java
Outer outer = new Outer();
Outer.Inner inner = outer.new Inner();     // the syntax nobody guesses
```

That hidden reference is a real one: an inner class instance keeps its outer
instance alive, which is the classic accidental memory leak. **Make nested
classes `static` unless they genuinely need the outer instance.**

An **anonymous** class is a class body with no name, instantiated on the spot.
It can hold fields and override several methods, which is exactly what a lambda
cannot do:

```java
IntSupplier counter = new IntSupplier() {
    private int next = 0;              // a lambda has no place to put this
    @Override public int getAsInt() { return next++; }
};
```

Anonymous and local classes can capture local variables only if those are final
or *effectively* final — assigned once and never reassigned. The capture is by
value, so there is no way for the class to write back to the enclosing method's
variable.

## Why `java Solution.java` works at all

Since Java 25, a source file may skip the class declaration entirely and declare
an instance `main` (JEP 512, compact source files):

```java
void main() {
    IO.println("no class, no static, no String[] args");
}
```

The compiler wraps that in an implicit class for you. It is meant for scripts and
first programs; everything in this curriculum is written out in full, because the
class is the unit that the rest of the language is about. What it does explain is
why `java Whatever.java` runs a single file with no build step: the launcher
compiles it in memory and calls `main`, instance or static, with or without args.

## What to build

| Member | What it does |
| --- | --- |
| `Solution(String)` | The outer constructor, storing a label |
| `Badge.render()` | An inner class reading the outer instance's field |
| `Point()` / `Point(int, int)` | Two constructors, one delegating |
| `Point.toString()` | An override, replacing `Point@1b6d3586` |
| `Account(long)` | Rejects a negative opening balance |
| `Account.balance()` | An accessor over a private field |
| `Account.deposit(long)` | Guards the invariant |
| `Account.withdraw(long)` | Guards it harder |
| `Trace` | Four initialisers, whose order you must predict |
| `initOrder()` | Creates one `Trace` and reports what ran |
| `counterFrom(int)` | An anonymous class with state of its own |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. Move `Trace`'s instance initialiser block above its field initialiser and
   predict the new log before you run it. What rule did you just use?
2. `outer.new Inner()` requires an instance. What does that imply about writing
   an inner class that is used from a `static` method?
3. `counterFrom` returns an anonymous class. Rewrite it as a lambda, notice why
   you cannot, and name the one capability you lost.
4. A constructor must not call an overridable method. Construct the two-class
   example where doing so reads a subclass field that is still zero.
