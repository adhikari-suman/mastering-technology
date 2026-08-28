# 03 — `infer`

A conditional type can bind part of the type it matched:

```ts
type ElementOf<T> = T extends (infer E)[] ? E : never;
type A = ElementOf<string[]>;   // string
```

`infer E` declares a new type variable, usable in the true branch only. Read it
as destructuring for types: the pattern on the right of `extends` is matched
against `T`, and `infer` names the holes.

## Where you can put it

Anywhere in the pattern, including several at once:

```ts
type Split<T> = T extends [infer Head, ...infer Tail] ? [Head, Tail] : never;
type Fn<T> = T extends (...args: infer A) => infer R ? { args: A; ret: R } : never;
type Prop<T> = T extends { value: infer V } ? V : never;
type Promised<T> = T extends Promise<infer U> ? U : never;
```

Function patterns are the workhorse — that's how `ReturnType` and `Parameters`
are defined, and the `(...args: infer A)` form gives you a **tuple** you can
then take apart with the variadic machinery from Part 01 Lesson 04.

## Multiple candidates

The same name inferred from several positions collects candidates, exactly like
generic inference:

```ts
type Both<T> = T extends { a: infer U; b: infer U } ? U : never;
Both<{ a: string; b: number }>;   // string | number
```

In a *covariant* position the candidates are unioned. In a contravariant one —
function parameters — they're intersected instead, which is a genuine trap:

```ts
type Args<T> = T extends { f: (x: infer U) => void; g: (x: infer U) => void } ? U : never;
Args<{ f: (x: string) => void; g: (x: number) => void }>;   // string & number = never
```

## Constrained `infer`

Since TypeScript 4.7 you can constrain the inferred variable inline:

```ts
type FirstString<T> = T extends [infer H extends string, ...unknown[]] ? H : never;
```

Without the constraint you'd need a second nested conditional. It also directs
inference toward literal types, the same way a constraint does on a normal
type parameter.

## Recursion

`infer` plus recursion is how you walk a structure:

```ts
type Awaited2<T> = T extends Promise<infer U> ? Awaited2<U> : T;
```

Depth is bounded — TypeScript gives up somewhere around 50 levels of type
instantiation and 1000 for tail-recursive conditionals. Lesson 06 covers the
limits and how to stay inside them.

## A quirk worth knowing now — and fixing

The standard `ReturnType<T>` is `T extends (...args: any) => infer R ? R : any`.
Hand it a function whose *parameter* is `never` and the pattern does not match,
so you silently get the `any` fallback:

```ts
declare function assertNever(v: never): never;
type R = ReturnType<typeof assertNever>;   // any, not never
```

You met this in Part 02 Lesson 05 without an explanation. This is it.

The interesting part is that it is not inherent — it's the `any` in the pattern.
Match with `(...args: never[])` instead and the same function matches fine,
because parameters are contravariant and `never[]` is assignable to any
parameter list:

```ts
type MyReturnType<T> = T extends (...args: never[]) => infer R ? R : never;
type R2 = MyReturnType<typeof assertNever>;   // never. Correct.
```

That is what you're about to write, so your version is strictly better than the
one in `lib.es5.d.ts` on this input. Worth sitting with: the standard library is
a set of choices, not a set of facts.

## What to build

| Export | What it is |
| --- | --- |
| `MyReturnType<T>` | The return type of a function type |
| `MyParameters<T>` | Its parameters, as a tuple |
| `MyAwaited<T>` | Unwrap nested promises, all the way down |
| `ElementOf<T>` | The element type of an array |
| `Head<T>` / `Tail<T>` | The first element, and the rest |
| `Last<T>` | The last element — the one that needs a variadic pattern |
| `unwrap` | The runtime twin of `MyAwaited` |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. `Last<T>` needs `[...infer _, infer L]`. Why can't it be
   `[infer _, ...infer Rest]` recursively? Try it and count the instantiations.
2. Write the contravariant-`infer` example above and confirm you get `never`.
   Then explain why intersecting is the *correct* choice there.
3. `MyAwaited<Promise<Promise<string>>>` should be `string`. What does the
   non-recursive one-level version give you, and why is that the wrong default?
4. Add `extends string` to an `infer` in `Head` and see which inputs stop
   matching. Is a constrained `infer` a filter or a coercion?
