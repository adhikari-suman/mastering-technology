# 01 — Generic functions

A type parameter is a *relationship*. `<T>(x: T) => T` doesn't say "takes
anything" — it says "whatever comes in, the same thing comes out." That link
between positions is the entire value; a type parameter appearing exactly once
in a signature is almost always a mistake, and Lesson 05 is about spotting it.

```ts
function identity<T>(value: T): T { return value; }
identity('a');        // 'a' flows in, 'a' comes out
```

Compare `(value: unknown) => unknown`, which accepts the same calls and tells
the caller nothing.

## Inference happens per call

You almost never write the type argument. TypeScript infers each parameter from
the arguments at the call site:

```ts
function pair<A, B>(a: A, b: B): [A, B] { return [a, b]; }
pair(1, 'x');            // [number, string]
pair<1, 'x'>(1, 'x');    // the same, said the long way
```

Inference keeps literal types, and then ordinary widening decides whether they
survive:

```ts
const a = identity('x');       // 'x'      — a const has nowhere to widen to
let   b = identity('x');       // string   — a mutable binding does
```

So `identity('x')` is `'x'` more often than people expect. `<const T>` from
Part 01 Lesson 02 is for the containers, where inference itself widens.

## `keyof` and indexed access make generics useful

The pattern that shows up everywhere:

```ts
function pluck<T, K extends keyof T>(obj: T, key: K): T[K] { return obj[key]; }

pluck({ a: 1, b: 'x' }, 'a');   // number
pluck({ a: 1, b: 'x' }, 'z');   // error: 'z' is not 'a' | 'b'
```

`K extends keyof T` does two jobs: it rejects keys that don't exist, and it
keeps `K` narrow enough that `T[K]` is the specific property type instead of a
union of all of them. Drop the constraint and you lose both.

## When *not* to be generic

Three checks before adding `<T>`:

1. **Does it appear more than once?** Once in a parameter and never in the
   return type means you wanted `unknown`.
2. **Does the caller learn anything?** If every call gets the same type back, a
   plain parameter is clearer.
3. **Is it a union in disguise?** `<T extends 'a' | 'b'>(x: T)` is usually just
   `(x: 'a' | 'b')` unless the return type mentions `T`.

## What to build

| Export | What it does |
| --- | --- |
| `identity` | The relationship in its simplest form |
| `pair`, `swap` | Two parameters, and the order they come back in |
| `pluck` | `keyof` + indexed access, the workhorse pattern |
| `pickMany` | The same idea over a list of keys |
| `mapValues` | Transform every value, keeping the keys |
| `tap` | A side effect that doesn't disturb the type flowing through |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Remove `K extends keyof T` from `pluck` and see what `T[K]` becomes. Which of
   the constraint's two jobs did you notice losing first?
2. `mapValues` keeps the key type. What would break if it were typed to return
   `Record<string, B>` instead?
3. `tap` returns its input. Why can't it be `(value: unknown, fn) => unknown`?
   Write the call site that proves the difference.
4. Is `<T>(xs: T[]) => number` a good signature for `length`? What should it be?
