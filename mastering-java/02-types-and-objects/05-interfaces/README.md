# 05 — Interfaces

An interface is a contract: a set of method signatures a type promises to
answer. A class implements as many as it likes, which is Java's answer to
multiple inheritance — many contracts, one superclass.

```java
interface Greeter {
    String name();                                   // abstract: yours to write
    default String greet() { return "Hello, " + name(); }
}
```

## What an interface can hold

- **abstract methods** — implicitly `public abstract`, no body.
- **default methods** — a body, inherited by every implementation.
- **static methods** — called as `Greeter.of(...)`; not inherited.
- **private methods** (Java 9+) — helpers shared by the defaults, invisible
  outside.
- **fields** — implicitly `public static final`. There is no instance state:
  `int MAX = 5` in an interface is a constant, not a field on the object.

`default` exists for one reason: **API evolution**. Adding `stream()` to
`Collection` in Java 8 would have broken every class in the world that
implemented it. A default gives the new method a body, so existing
implementations inherit it and keep compiling. Everything else `default` is used
for — convenience methods, mixins — came afterwards.

## The diamond, and how Java resolves it

Two interfaces, one signature:

```java
interface Loud  { default String hello() { return "HELLO"; } }
interface Quiet { default String hello() { return "hello"; } }

class Both implements Loud, Quiet { }   // error: inherits unrelated defaults
```

Java refuses to guess. Three rules, applied in order:

1. **The class wins.** A method inherited from a superclass beats any interface
   default, always.
2. **The most specific interface wins.** If `Louder extends Loud` and both
   declare `hello()`, `Louder`'s is used — it is the more specific type, so
   there is no ambiguity to report.
3. **Otherwise it is a compile error**, and you must override. Inside the
   override, `Interface.super.method()` names the one you want:

```java
class Both implements Loud, Quiet {
    @Override public String hello() { return Loud.super.hello(); }
}
```

`Loud.super.hello()` is the only syntax in Java that reaches a specific
inherited default, and it works only for an interface the class directly
implements.

## The trap: rule 1 is silent

Rule 3 is loud — the compiler stops you. Rule 1 says nothing at all:

```java
class Base { public String hello() { return "from Base"; } }

class Mixed extends Base implements Loud { }   // compiles

new Mixed().hello();          // "from Base"
((Loud) new Mixed()).hello(); // "from Base" — the cast changes nothing
```

`Mixed` implements `Loud`, `Loud` supplies a `hello()`, and the default is
simply never used. Nothing warns you, because this is exactly what you want when
`Collection` grows a method your class already had — the whole reason defaults
are safe to add.

But it also means adding an interface to an existing class can be a no-op that
looks like a change, and that a superclass you do not own can quietly take over
a default you *were* relying on: someone adds a method to `Base` and your
`Mixed` starts answering differently, with no diamond error to warn anyone.
Defaults are a compatibility mechanism, not a mixin system, and this is the
seam.

## Functional interfaces and lambdas

An interface with exactly one abstract method is a **functional interface**, and
a lambda is an instance of one:

```java
@FunctionalInterface
interface Transform { String apply(String s); }

Transform trim  = s -> s.trim();
Transform upper = String::toUpperCase;    // method reference
```

Default and static methods do not count against the one — `Comparator` has
dozens and is still functional. `@FunctionalInterface` is optional and changes
nothing at runtime; it makes the compiler check the count, so a second abstract
method fails at the declaration instead of at every lambda that used it.

Method references come in four shapes, and knowing which one you are writing
saves a lot of squinting:

```java
Integer::parseInt        // static method
someList::add            // bound: a method on THIS object
String::toUpperCase      // unbound: the receiver becomes the first argument
ArrayList::new           // constructor
```

`String::toUpperCase` is the interesting one: `Transform.apply(String s)` takes
an argument, and the reference supplies it as the receiver — `s.toUpperCase()`.

A lambda captures local variables, and they must be **effectively final** —
assigned once and never reassigned. Java captures the value, not the variable,
so a mutable capture would be a lie. This is the one place a JavaScript closure
and a Java lambda genuinely differ.

## Interface or abstract class?

An abstract class can do two things an interface cannot: hold **instance state**
and declare a **constructor**.

```java
abstract class Animal {
    private final String name;              // state
    Animal(String name) { this.name = name; }   // constructor
    abstract String sound();
    String speak() { return name + " says " + sound(); }
}
```

Everything else is close enough to be a toss-up, so the deciding questions are:
does the type need fields; and does the implementation already have a
superclass? A class extends exactly one class and implements any number of
interfaces, so an interface is always the cheaper thing to ask of a caller. The
modern default is: interface for the contract, abstract class only when there is
real shared state.

One more asymmetry worth knowing: an interface may not declare a `default` for
`toString`, `equals` or `hashCode`. Those come from `Object`, rule 1 would win
anyway, so the language rejects the declaration outright.

## What to build

`Loud`, `Quiet`, `Louder`, `Base`, `Sub` and `Mixed` are given complete — they
are there to be run, not written. Everything below is yours.

| Method | What it does |
| --- | --- |
| `Greeter.greet()` | A default method built on the abstract one |
| `Greeter.punctuation()` | A private helper inside the interface |
| `Greeter.of(String)` | A static factory returning a lambda |
| `Both.hello()` | Resolve the diamond with `Interface.super` |
| `upper()` | A `Transform` written as a method reference |
| `chain(Transform, Transform)` | Compose two, as a lambda |
| `applyAll(Transform, List<String>)` | Run one over a list |
| `Animal` | An abstract class: constructor, state, template method |
| `Dog` | Extends one, implements the other |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `Dog` never declares `name()`, yet it satisfies `Greeter`. Which rule is
   that, and what happens if `Animal.name()` is made `protected`?
2. `Greeter.of` returns a lambda. What is `Greeter.of("x").getClass()`, and why
   is there no `Greeter$1` in the build output the way an anonymous class would
   produce one?
3. Rule 2 says the most specific interface wins. What does "most specific" mean
   when neither of two interfaces extends the other but both extend a third?
4. Adding a `default` method to a published interface is source-compatible. Name
   a case where it still breaks somebody.
