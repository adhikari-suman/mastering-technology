# 06 — Higher-order generics

A wrapper that takes a function and returns a function has to carry the inner
signature through untouched. Doing that badly is how `memoize` turns a typed API
into `(...args: any[]) => any`.

## Capturing a whole signature

The idiom is two parameters — the argument tuple, and the return type:

```ts
function once<Args extends unknown[], R>(fn: (...args: Args) => R): (...args: Args) => R
```

`Args` is inferred as a **tuple**, so parameter count, order, optionality and
labels all survive. Compare the two shortcuts you'll see in the wild:

```ts
function once<F extends Function>(fn: F): F              // F is opaque; can't call it
function once(fn: (...args: any[]) => any): typeof fn    // everything is any
```

The first can't be implemented; the second can't be trusted.

## `unknown[]` versus `any[]` in the constraint

`Args extends unknown[]` is right for the ordinary case. You'll also see
`Args extends never[]`, which is a trick for making the wrapper accept functions
with *any* parameter types under `strictFunctionTypes` — parameters being
contravariant, `never` is assignable to everything in that position. Reach for
it only when `unknown[]` actually rejects a caller you need.

## Variadic tuples do partial application

`[...A, ...B]` from Part 01 Lesson 04 is what types `partial`:

```ts
function partial<Bound extends unknown[], Rest extends unknown[], R>(
  fn: (...args: [...Bound, ...Rest]) => R,
  ...bound: Bound
): (...rest: Rest) => R
```

Given `(a: number, b: string, c: boolean) => symbol` and one bound argument,
`Bound` infers as `[number]` and `Rest` as `[string, boolean]`. The split is
decided by how many arguments were actually passed — the type system doing
arithmetic without any arithmetic.

## Currying and composition

`curry2` is the fixed-arity version and needs no variadics. `pipe` is the one
that gets ugly: with an unbounded number of steps there is no way to express
"each output feeds the next input" in one signature, so every library ships a
stack of overloads. Writing two or three of them by hand is worth doing once.

## What to build

| Export | What it does |
| --- | --- |
| `once` | Calls through the first time, returns the cached result after |
| `memoize` | Caches per argument list, keyed by JSON |
| `curry2` | `(a, b) => r` becomes `(a) => (b) => r` |
| `partial` | Binds leading arguments; the rest keep their types |
| `pipe` | Two- and three-step composition, via overloads |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Give `once` the signature `<F extends Function>(fn: F): F` and try to
   implement it. What exactly stops you?
2. `memoize` keys on `JSON.stringify(args)`. Name three inputs where that is
   wrong, and say what you'd do at a real call site.
3. Write the four-step overload for `pipe`. At what point would you give up and
   change the API instead?
4. `partial` infers the split from the arguments passed. What happens if the
   wrapped function has an optional parameter, and is the answer defensible?
