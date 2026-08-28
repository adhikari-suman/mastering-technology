# 06 — Recursive types

A type that refers to itself. The simple cases have always worked:

```ts
type Json =
  | string | number | boolean | null
  | Json[]
  | { [key: string]: Json };
```

Object and array members defer their contents, so this terminates naturally.
The interesting recursion is the kind that *computes*, and that has budgets.

## Two limits, and which one you hit

**Instantiation depth** — about 50 levels — applies to nested conditional types
that each expand a new instantiation. Exceed it and you get
`Type instantiation is excessively deep and possibly infinite`.

**Tail recursion elimination** — since TypeScript 4.5, a conditional type whose
true branch is *only* a call to itself is optimised into a loop, raising the
budget to around 1000 iterations. This makes the difference between a type that
handles a ten-element tuple and one that handles a thousand:

```ts
// NOT tail-recursive: the result is wrapped, so each level stays on the stack
type Bad<T extends unknown[]> = T extends [infer H, ...infer R] ? [H, ...Bad<R>] : [];

// tail-recursive: the accumulator carries the answer down
type Good<T extends unknown[], Acc extends unknown[] = []> =
  T extends [infer H, ...infer R] ? Good<R, [...Acc, H]> : Acc;
```

The accumulator-parameter shape is the standard rewrite. When a recursive type
blows up, this is almost always the fix.

## Depth-limiting on purpose

Some recursions are genuinely unbounded — a `Paths<T>` over a cyclic type, for
instance. Carry a countdown tuple and stop:

```ts
type Paths<T, Depth extends unknown[] = [0, 0, 0, 0, 0]> =
  Depth extends [unknown, ...infer Rest] ? /* recurse with Rest */ : never;
```

Popping a tuple element per level is how you count in a type system with no
arithmetic. `Depth['length']` is the number remaining.

## `DeepReadonly` and the primitive check

The trap in every deep-mapping type is forgetting that primitives and functions
should stop the recursion:

```ts
type DeepReadonly<T> =
  T extends (infer E)[] ? readonly DeepReadonly<E>[] :
  T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } :
  T;
```

Order matters — arrays are objects, so they must be asked about first. Functions
are objects too, and mapping over one produces `{}`, silently destroying it. If
your deep type is eating callbacks, that's why.

## What to build

| Export | What it is |
| --- | --- |
| `Json` | The type of anything `JSON.parse` can return |
| `DeepReadonly<T>` | Read-only all the way down, arrays and functions intact |
| `DeepPartial<T>` | Optional all the way down |
| `TupleOf<N, T>` | A tuple of `N` copies — the countdown idiom |
| `Reverse<T>` | Tail-recursive, so it handles long tuples |
| `Paths<T>` | Dotted paths into a nested object, depth-limited |
| `deepFreeze` | The runtime twin of `DeepReadonly` |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Write `Reverse` the non-tail-recursive way and find the tuple length where it
   breaks. Then do the same for the accumulator version.
2. `DeepReadonly<(a: string) => void>` — what do you get with the naive
   `T extends object` ordering, and what should you get?
3. `TupleOf<1000, 0>` — does it compile? What about `TupleOf<10000, 0>`? Where
   is the wall, and which limit did you hit?
4. `Paths<T>` on a type containing itself. What happens without a depth limit,
   and what error do you get? Is it the error you expected?
