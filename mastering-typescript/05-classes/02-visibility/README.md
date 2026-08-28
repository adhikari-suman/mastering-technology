# 02 — Visibility

Two private systems, one of which is real.

```ts
class A {
  private a = 1;    // TypeScript private — a compile-time convention
  #b = 2;           // JavaScript private — enforced by the runtime
}
```

## `private` is a lie, and everyone knows

`private` exists only in the type system. It compiles to an ordinary property,
so:

```ts
const a = new A();
(a as any).a;                  // 1
a['a'];                        // 1 — and this doesn't even need a cast in older TS
JSON.stringify(a);             // {"a":1}  — it's right there
Object.keys(a);                // ['a']
```

Three consequences worth having thought about before you rely on it:

- Anything reflective — serialisation, logging, deep-equality, ORM mapping —
  sees it. A `private` password field ships in your logs.
- It provides no encapsulation against code you don't control.
- It *does* provide the thing it was designed for: preventing accidents inside
  a codebase that typechecks.

## `#private` is enforced

`#name` is JavaScript syntax. The field is not a property at all — it lives in
an internal slot keyed by the class:

```ts
JSON.stringify(a);             // {} — invisible
Object.keys(a);                // []
a['#b'];                       // undefined; there is no such property
```

Accessing `#b` from outside the class is a *syntax* error, not a type error, so
no cast gets around it. It also gives you a free `instanceof`:

```ts
static isA(v: unknown): v is A { return #b in v; }
```

The `#x in obj` form is the standard brand check, and it's the only reliable
way to ask "was this made by my constructor" without a prototype walk.

`#private` is fully erasable, so this project can use it. Prefer it.

## `protected`

Visible to subclasses, invisible outside. Also compile-time only — there is no
runtime `protected`. It's the one of the three with no JavaScript equivalent,
so it stays useful precisely because nothing better exists.

A subtlety worth knowing: a subclass can *widen* an inherited member's
visibility (`protected` → `public`) but never narrow it.

## Structural typing and `private`

This is where the two systems collide. Two structurally identical classes are
normally interchangeable — unless one has a `private` or `protected` member, in
which case they aren't:

```ts
class A { private x = 1 }
class B { private x = 1 }
const a: A = new B();   // error — the privates come from different declarations
```

That is TypeScript's only built-in nominal typing. Part 07 Lesson 03 uses the
trick deliberately.

## What to build

| Export | What it is |
| --- | --- |
| `Account` | `#private` balance — genuinely invisible to reflection |
| `LeakyAccount` | The same with `private` — visible, to prove the point |
| `Vehicle` / `Car` | `protected`, and a subclass reading it |
| `isAccount` | A brand check using `#field in value` |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. `JSON.stringify` both accounts. Which one leaks? Now imagine the field were
   an API token.
2. `#x in v` narrows `v`. Why can that be trusted when a hand-written type
   predicate can't?
3. Can a subclass access its parent's `#private`? What about `private`? Explain
   the difference in terms of where each is enforced.
4. Two classes with identical shapes but each with a `private x`. Are they
   assignable? What if you change one to `#x`?
