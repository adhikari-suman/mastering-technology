# 05 — Validation

There are two ways to deal with input you do not trust. Check it and carry on
with the same untrusted type, or **turn it into a different type that cannot be
wrong**. The second one is strictly better, and Java has the pieces for it.

## Parse, don't validate

```java
void register(String email) {
    if (!isValid(email)) throw new IllegalArgumentException(email);
    send(email);            // and inside send, is email still valid?
}
```

`isValid` returns a `boolean` and then evaporates. Two calls down, `send`
receives a `String` and has no way to know anything was checked, so it checks
again, or it doesn't and is wrong. The knowledge lived in the control flow, and
control flow does not survive a method boundary.

```java
void register(Email email) {   // it is an Email. it was checked. once.
    send(email);
}
```

The check now lives in a **type**. `Email` can only be built by a constructor
that refuses malformed input, so possessing one is proof. Nothing downstream
re-checks, because there is nothing left to check — `domain()` has no failure
case, and it needs no `if`.

This is the same instinct as a TypeScript branded type, except the guarantee is
real: there is no cast that produces an `Email` from an arbitrary `String`.

## Records validate in the compact constructor

```java
record Email(String value) {
    Email {
        Objects.requireNonNull(value, "email must not be null");
        value = value.trim().toLowerCase(Locale.ROOT);   // NORMALISE
        if (value.isBlank()) throw new IllegalArgumentException("email must not be blank");
        …
    }
}
```

The compact form has no parameter list and no field assignments — javac appends
`this.value = value;` after your body. Two consequences worth knowing:

- **Assign to the parameter, not the field.** `value = value.trim()` is how you
  normalise, and it works because the implicit assignment happens afterwards.
  `this.value = ...` does not compile: the field is not assignable yet.
- **Throwing leaves nothing half-built.** The object never exists, so there is
  no invalid instance for anyone to get hold of.

Records are shallowly immutable and final, so the invariant your constructor
establishes holds forever. Put the guard as close to the data as it goes: on
`Signup`, `requireNonNull` on the reference components means the parser is not
the only thing standing between you and a null.

## Collect every error, not the first

Throwing on the first bad field is fine for a programming error and hostile for
a form:

```
> submit
"email is invalid"
> submit
"name is required"
> submit
"you must be 18"
```

Three round trips for three mistakes. The fix is a return type that holds a
*list* of problems, so one pass over the input reports all of them:

```java
sealed interface Validated<T> permits Valid, Invalid { }
record Valid<T>(T value)            implements Validated<T> { }
record Invalid<T>(List<String> problems) implements Validated<T> { }
```

Sealed plus records means a `switch` over it is exhaustive with no `default`:

```java
boolean succeeded = switch (validated) {
    case Valid<?> valid     -> true;
    case Invalid<?> invalid -> false;
};
```

If a third implementation ever appears, every switch like this one stops
compiling and tells you where to go. A `default` branch would have silently
swallowed it.

This is Java's answer to `Result` / `Either`, without the library. It stays
readable up to about this size; past it you want a real validation library
(`jakarta.validation`, Vavr's `Validation`) rather than a hand-rolled applicative.

## Where the boundary belongs

`Validated` is not a replacement for exceptions — it is a replacement for
exceptions **at one layer**: the edge, where untrusted data arrives and a human
or another system is waiting for a list of what to fix.

Inside the boundary, everything is already a parsed type and the only remaining
failures are bugs and infrastructure. Those are exceptions, and they should be:
`Validated<Connection>` would be absurd, because no caller can act on
"the database is down" as a field-level message.

So the shape of a program is:

```
untrusted input  ->  parse into types  ->  everything downstream is total
      ^                     |
      |                     +-- Validated: every problem, at once
      |
      +-- exceptions from here inward: bugs and infrastructure only
```

One conversion in the other direction is normal and belongs at the same edge —
`orThrow`, joining every problem into one message for a caller that only wants
to fail. Do that once, at the boundary, not in every method.

## The trap: `if (!x.isValid()) throw` is not validation

The failure mode of check-then-use is not that the check is wrong; it is that
the check does not *travel*. A `String` that was valid on line 4 is the same
type as a `String` that was never checked at all, so every subsequent method has
to choose between trusting its caller and repeating the work. Both choices are
wrong somewhere in a large enough program, and the bug that eventually appears
is a malformed value in a place with no check.

Ask of every validation you write: what does the caller *hold* afterwards that
they did not hold before? If the answer is "the same thing, plus a good feeling",
it is not parsing.

## What to build

| Method | What it does |
| --- | --- |
| `Email` | Normalise then validate, in the compact constructor |
| `Email.domain()` | Total, because the type is already correct |
| `Signup` | `requireNonNull` on the reference components |
| `parseEmail(String)` | The constructor's rule, reported instead of thrown |
| `parseAge(String)` | Not-a-number and out-of-range as distinct problems |
| `parseSignup(…)` | Every problem, in field order, from one call |
| `problems(Validated)` | The list, empty when valid |
| `orThrow(Validated)` | The boundary conversion, losing nothing |
| `describe(Validated)` | Exhaustive switch, no `default` |

`Validated`, `Valid` and `Invalid` are provided — there is nothing to implement
in them.

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `parseSignup` collects problems as plain strings. What breaks when the same
   API needs to serve a translated UI, and what would the `Invalid` payload have
   to become?
2. The reference `Email` uses `toLowerCase(Locale.ROOT)` rather than
   `toLowerCase()`. Look up what the no-argument version does to the letter `I`
   in a Turkish locale, and decide whether it matters here.
3. `orThrow` needs an unchecked cast or a switch to get the value out of a
   `Valid<T>`. What would a `map`/`flatMap` pair on `Validated` look like, and
   which of the two can combine problems from both sides?
4. `Email` is a record wrapping one `String`, so every address costs an extra
   object. When does that matter, and what would Valhalla's value classes change
   about the answer?
