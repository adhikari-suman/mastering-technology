# 02 — Soundness holes

A *sound* type system never says a program is fine when it isn't. TypeScript is
not sound, and this is not a bug list — every hole here was chosen, and the
alternative was rejecting a large amount of correct code.

Knowing them changes how you read a green build: these are the places where
"it typechecks" carries less weight than usual.

## The list

**1. Array covariance.** `Dog[]` is assignable to `Animal[]`, and you can then
push a `Cat` into it. Rejecting this would break most code that passes arrays to
functions.

**2. Method bivariance.** Covered in Lesson 01. `Array<T>`'s own methods force
it.

**3. `any`.** Assignable both ways, to and from everything. One `any` disables
checking along a whole call chain, silently.

**4. Type assertions.** `as` and `!`. Unchecked by construction; that's the
feature.

**5. Type predicates and assertion functions.** The body is not checked against
the claim. Part 02 Lessons 03 and 04.

**6. Property narrowing outliving calls.** Part 02 Lesson 06. `o.a.b` stays
narrowed across an opaque call that could have cleared it.

**7. Optional-property reads with `noUncheckedIndexedAccess` off.** `xs[999]` is
`T`, not `T | undefined`. This project turns the flag on; almost nobody does.

**8. `Object.keys` returning `string[]`.** Sound, actually — the *unsound* part
is the `keysOf<T>(o): (keyof T)[]` helper everyone writes, since an object with
extra properties is assignable.

**9. Class field initialisation order.** A base-class constructor can call an
overridden method that reads a subclass field before it is initialised. The
field's type says it is there; at that moment it is `undefined`.

**10. `declare` and `.d.ts`.** An ambient declaration is a promise nothing
checks. Part 06 Lesson 04.

## The two that surprise people most

**Excess property checking is not soundness.** Freshness (Part 01 Lesson 03) is
a *usability* feature that catches typos. Assigning through a variable bypasses
it entirely, and that's not a hole — structural typing genuinely permits it.

**Field initialisation order** is the one nobody expects, because it needs no
assertion, no `any`, and no cast:

```ts
class Base { constructor() { this.describe(); } describe(): void {} }
class Child extends Base {
  name = 'child';
  override describe(): void { console.log(this.name.length); }   // TypeError
}
```

`name` is typed `string` and is `undefined` when `describe` runs, because base
constructors finish before subclass field initialisers begin. Every type is
correct; the program crashes.

## What to do about it

Not "avoid TypeScript". The holes are narrow and mostly avoidable:

- Prefer `readonly T[]` in parameters — closes hole 1 at the boundary.
- Write callbacks as properties — closes hole 2 where you control it.
- Turn on `noUncheckedIndexedAccess` — closes hole 7.
- Treat assertions and predicates as trusted code: small, tested, few.
- Never call an overridable method from a constructor — closes hole 9.

## What to build

A model of the holes, plus two working demonstrations you can run.

| Export | What it is |
| --- | --- |
| `Hole` | The holes this Lesson knows |
| `HOLES` / `describeHole` | The catalogue |
| `isClosedBy` | Which flag or habit closes which hole |
| `demonstrateArrayCovariance` | Get a `Cat` into a `Dog[]`, with no casts |
| `demonstrateFieldOrder` | Read a `string` field that is `undefined` |
| `safeSum` | The `readonly` habit, in a signature |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. `demonstrateArrayCovariance` uses no `as` and no `any`. Convince yourself of
   that, then decide whether TypeScript should have rejected it.
2. Hole 9 needs no unsafe feature at all. Would a sound system reject the class,
   or reject the constructor call? What would that cost?
3. Which of the ten does `strict` close? Which does this project's config close?
   Which can no flag close?
4. Pick the hole you think is most dangerous in code you actually write, and
   write the lint rule or habit that would have caught it.
