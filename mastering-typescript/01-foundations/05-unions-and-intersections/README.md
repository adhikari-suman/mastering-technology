# 05 — Unions and intersections

Think of a type as a *set of values*. Then `|` is union and `&` is intersection,
and everything else follows from that one idea.

```ts
type A = 'x' | 'y';           // the set { 'x', 'y' }
type B = { a: number } & { b: string };   // values that are in BOTH sets
```

## Unions are "one of", and that costs you access

A value of type `A | B` is one or the other, and the checker doesn't know which,
so it only lets you touch what is guaranteed either way:

```ts
type Cat = { name: string; meow(): void };
type Dog = { name: string; bark(): void };

declare const pet: Cat | Dog;
pet.name;   // fine — both have it
pet.bark(); // error — it might be a Cat
```

This is not the checker being unhelpful. It is the entire value proposition: to
call `bark` you must first establish that you have a `Dog`, and once you have,
the checker will let you. That establishing step is narrowing, and Part 02 is
about nothing else.

`keyof` follows the same logic, which surprises people:

```ts
type Keys = keyof (Cat | Dog);   // 'name' — only what's on BOTH
```

The keys you can safely read from "one of these" are the keys they share. An
intersection of the keyof's, from a union of the types.

## Intersections are "all of", and they merge

```ts
type WithId<T> = T & { id: string };
type User = WithId<{ name: string }>;   // { name: string } & { id: string }
```

For object types this behaves like a merge. For primitives it usually doesn't
behave at all:

```ts
type Never = string & number;   // never — no value is both
```

`never` here is not an error, it's the answer: the empty set. You'll see it
appear whenever you intersect things that can't coexist, and recognising it as
"you asked for the impossible" saves a lot of confused staring.

When properties collide, the intersection is taken property-wise:

```ts
type Odd = { a: string } & { a: number };   // { a: never }
```

The object type isn't `never` — only that property is, which is why the error
shows up at the assignment rather than the declaration.

## Discriminated unions

A union where every member carries a shared, literal-typed tag:

```ts
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number };
```

Checking the tag tells the checker exactly which member you have:

```ts
if (shape.kind === 'circle') shape.radius;   // narrowed
```

This is the highest-leverage pattern in the language, and Part 02 Lesson 02 is
devoted to it. Here you just need to build one and use it — a first taste of
narrowing, the way Part 01 of the JavaScript curriculum took a first taste of
closures. The subtleties come later.

## Unions distribute — sometimes

Unions have a habit of spreading through generic operations in ways that are
either exactly what you want or deeply confusing, depending on whether you knew
it was going to happen. Part 04 covers the rule. For now, notice that
`(A | B)[]` and `A[] | B[]` are different types, and think about why.

## What to build

| Export | What it is |
| --- | --- |
| `Circle`, `Square`, `Rect` | Three shapes, each tagged with a `kind` |
| `Shape` | The union of them |
| `Kind` | The tags, derived with `keyof`-adjacent machinery, not retyped |
| `WithId<T>` | Anything, plus an `id` |
| `Impossible` | An intersection with no inhabitants |
| `SharedKeys` | The keys common to two object types |
| `area`, `describe`, `totalArea` | The runtime half, narrowing by tag |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. `keyof (Cat | Dog)` is an intersection and `keyof (Cat & Dog)` is a union.
   Say why in terms of sets, out loud, until it sounds obvious.
2. What is `{ a: string } & { a: string }`? What about `{ a: string } | { a: string }`?
3. Add a fourth shape to `Shape` but not to `area`. Where does the error appear,
   and where would you *want* it to appear? (Part 02 Lesson 05 is the answer.)
4. Is `never[]` a useful type? Is `never` in a union — as in `string | never` —
   the same as `string`? Why is one of those absorbed and the other not?
