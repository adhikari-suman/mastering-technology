# 02 — Distribution

The single rule that explains most confusing conditional-type behaviour:

> When the checked type of a conditional is a **naked type parameter** and the
> argument is a **union**, the conditional is applied to each member separately
> and the results are unioned.

```ts
type Box<T> = T extends unknown ? T[] : never;
type A = Box<string | number>;   // string[] | number[]   — NOT (string | number)[]
```

"Naked" means the type parameter appears alone as the checked type — `T extends
U`, not `T[] extends U` or `{ v: T } extends U`.

## Why `Exclude` works

```ts
type Exclude<T, U> = T extends U ? never : T;
Exclude<'a' | 'b' | 'c', 'a'>
```

Distribution turns this into three separate questions:

```
'a' extends 'a' ? never : 'a'   ->  never
'b' extends 'a' ? never : 'b'   ->  'b'
'c' extends 'a' ? never : 'c'   ->  'c'
```

then unions the results: `never | 'b' | 'c'`, which is `'b' | 'c'` because
`never` is absorbed by `|`. The matches don't become `never` — they vanish,
which is exactly what you wanted and not at all what the source code looks like.

## Turning it off

Wrap both sides in a one-element tuple:

```ts
type IsUnionOfStrings<T> = [T] extends [string] ? true : false;
```

`[T]` is no longer naked, so the check happens once against the whole union.
This is why `IsNever` is written the way it is:

```ts
type IsNever<T> = [T] extends [never] ? true : false;
```

The naive `T extends never ? true : false` gives `never` for `IsNever<never>` —
because distributing over a union with **zero members** produces zero results,
and the union of nothing is `never`. The conditional never runs at all.

Any wrapper works; tuples are conventional because they're cheap.

## `any` distributes into both branches

```ts
type A<T> = T extends string ? 1 : 2;
type B = A<any>;    // 1 | 2
```

`any` is assignable to `string` and also not, so the checker returns both. This
is what makes `any` detectable:

```ts
type IsAny<T> = 0 extends 1 & T ? true : false;
```

`1 & T` is `never` for any ordinary `T`, and `0 extends never` is false. When
`T` is `any`, `1 & any` is `any`, and `0 extends any` is true. Nothing else
behaves like that.

## And now `Equal`

You've been using this since Part 01:

```ts
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
```

Two generic function types are compared. The checker decides whether they are
identical by comparing their bodies with `A` and `B` still deferred — which
forces an *identity* comparison rather than an assignability one. That is why it
distinguishes things mutual assignability cannot:

| Pair | Naive mutual-assignability check | `Equal`? |
| --- | --- | --- |
| `any`, `string` | `boolean` (!) | **false** |
| `{ a: string }`, `{ readonly a: string }` | `true` | **false** |
| `'a' \| 'b'`, `'b' \| 'a'` | `true` | true |
| `never`, `never` | `true` | true |

The first row is the killer. The naive version doesn't return a wrong answer for
`any` — it returns *both*, because `any extends string` takes both branches and
they get unioned into `boolean`. A predicate that can return `boolean` is no
predicate at all.

It relies on an internal comparison rule rather than anything specified, which
is why it looks like a hack. It is a hack. It is also the only thing that works.

## What to build

| Export | What it is |
| --- | --- |
| `Distribute<T>` | Shows the rule: each member wrapped separately |
| `NoDistribute<T>` | The same written so it doesn't |
| `MyIsNever<T>` | Correct for `never`, which the naive version isn't |
| `MyIsAny<T>` | The `0 extends 1 & T` trick |
| `IsUnion<T>` | True only for a union of two or more |
| `MyEqual<A, B>` | The one you've been handed since Lesson 01 of Part 01 |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Write `NaiveIsNever<T> = T extends never ? true : false` and evaluate it at
   `never`. Explain the answer using "a union of zero members".
2. `IsUnion` needs a second parameter defaulting to `T`. Work out why one
   parameter cannot do it.
3. Does `Equal` distinguish `{ a?: string }` from `{ a: string | undefined }`?
   Predict, then check. Does mutual assignability?
4. Find a pair `Equal` gets *wrong* — reports `true` for types you'd call
   different, or the reverse. (There are some. Intersections are a good hunting
   ground.)
