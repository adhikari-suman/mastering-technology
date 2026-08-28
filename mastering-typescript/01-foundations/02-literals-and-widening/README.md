# 02 — Literals and widening

Every value has a most-specific type and a most-general one. `'admin'` is both
the literal type `'admin'` and the type `string`. Which one you get is decided
by rules you can learn in ten minutes and will otherwise fight for years.

## The literal types

Each primitive value is its own type:

```ts
type Yes = true;
type Answer = 42;
type Admin = 'admin';
```

On their own they're useless — a variable that can only ever hold `42` is not a
variable. In a union they become the most useful thing in the language:

```ts
type Role = 'admin' | 'editor' | 'viewer';
```

That's a closed set the checker can reason about exhaustively, and it costs
nothing at runtime because it *is* a string.

## Widening

Inference has to guess how general you meant something to be. The guess is
based on mutability:

```ts
const a = 'admin';        // 'admin'   — can never change, so keep it exact
let   b = 'admin';        // string    — could be reassigned, so widen
const c = { r: 'admin' }; // { r: string } — properties are mutable, so widen
const d = ['admin'];      // string[]  — elements are mutable, so widen
```

The rule: **a value keeps its literal type only where it can't be changed.**
`const` bindings of primitives are the one place that's true by default.

Widening also happens at annotation boundaries. `const e: string = 'admin'` is
`string` — you asked for the wide type, you got it.

## `as const`

`as const` says "nothing in here is mutable, so nothing needs widening." It
applies all the way down:

```ts
const ROLES = ['admin', 'editor', 'viewer'] as const;
//    ^? readonly ['admin', 'editor', 'viewer']
```

Which unlocks the pattern that replaces enums:

```ts
type Role = (typeof ROLES)[number];   // 'admin' | 'editor' | 'viewer'
```

`typeof ROLES` crosses to type space; `[number]` is indexed access with the
number-literal keys `0 | 1 | 2`, giving the union of the elements. One source of
truth, and the array is still iterable at runtime.

## `satisfies`

An annotation checks a value *and replaces its type*. That's usually what you
want, and sometimes it destroys exactly the information you cared about:

```ts
const P: Record<Role, string[]> = { admin: ['read'], editor: ['read'] };
P.admin;   // string[] — the literals are gone, and so is "admin has one entry"
```

`satisfies` checks against a type without adopting it:

```ts
const P = { admin: ['read'], editor: ['read'] } as const satisfies Record<Role, readonly string[]>;
P.admin;   // readonly ['read'] — checked AND exact
```

Use `satisfies` whenever you want the constraint enforced but the inference
kept. It is the single most under-used keyword in the language.

## `const` type parameters

Generic inference widens too. A `const` modifier on the type parameter tells it
not to:

```ts
declare function loose<T>(x: T): T;
declare function keep<const T>(x: T): T;

loose(['a', 'b']);   // string[]
keep(['a', 'b']);    // readonly ['a', 'b']
```

Same effect as making every caller write `as const`, without making them.

## A note on `enum`

TypeScript's `enum` predates literal unions and is the one construct in the
language that emits runtime code — it is not a type, it is an object the
compiler writes for you. That makes it unerasable, which is why this project's
`erasableSyntaxOnly` flag rejects it outright, and why Node cannot strip it.

A union of literals does the same job, needs no import, and produces plain
strings in your logs and on the wire. Reach for `as const` instead.

## What to build

| Export | What it is |
| --- | --- |
| `ROLES` | The three roles, kept as literals rather than `string[]` |
| `Role` | That union, derived from `ROLES` |
| `Permission` | A hand-written literal union |
| `PERMISSIONS` | Role → permissions, checked with `satisfies` and still exact |
| `DEFAULT_ROLE` | Typed as `Role`, not as its own literal |
| `identity` | Generic, and it must *not* widen its argument |
| `can`, `isRole` | The runtime half |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Predict the type of `const x = { a: 1 } as const` and `const y = [1] as const`
   before hovering. Then predict `const z: readonly number[] = [1]`.
2. Add `export enum Color { Red }` to your solution. Read the tsc error, then
   run `node solution.ts` and read that one. Two different tools, one cause.
3. Why does `PERMISSIONS` need `as const` *and* `satisfies`? Remove each in turn
   and describe precisely what you lose.
4. `identity('a')` is `'a'`, but `identity(['a'])` is only `readonly ['a']` with
   a `const` type parameter. Why does the array need help when the string doesn't?
