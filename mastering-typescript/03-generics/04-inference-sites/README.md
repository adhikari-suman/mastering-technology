# 04 — Inference sites

Inference is not magic and not global. For each type parameter, the checker
collects *candidates* from the places that parameter appears in the arguments,
then picks one. Knowing where candidates come from tells you why an inference
went wrong, and which parameter to move.

## Candidates and how one wins

```ts
declare function f<T>(a: T, b: T): T;
f(1, 2);        // candidates: number, number      -> number
f(1, 'x');      // candidates: number, string      -> string | number
```

Two candidates that don't match produce their union — TypeScript does not error,
it widens. That's usually helpful and occasionally the source of a mystery:
somewhere you passed a second argument that silently widened `T`.

Candidates from a **return type** position have lower priority than candidates
from parameters, and candidates inside a callback's parameters are inferred
*after* the outer ones, which is why this works:

```ts
declare function map<T, U>(xs: T[], fn: (x: T) => U): U[];
map([1, 2], (x) => String(x));   // T from the array, then x: number, then U: string
```

`x` is typed without you annotating it. That's **contextual typing**: the
parameter type flows in from the signature, in the opposite direction to
inference.

## `NoInfer`

Sometimes you want a parameter to be a *consumer* of the inference rather than a
source of it:

```ts
declare function withFallback<T>(value: T | undefined, fallback: T): T;
withFallback<string>(undefined, 42);        // error, good
withFallback(someString, 42);               // T = string | number. Not what you meant.
```

The second call was supposed to be an error. `fallback` contributed a candidate
and widened `T` to cover its own mistake. `NoInfer<T>` marks a position as
non-inferring:

```ts
declare function withFallback<T>(value: T | undefined, fallback: NoInfer<T>): T;
withFallback(someString, 42);               // error, as intended
```

Reach for it whenever one parameter is meant to be checked *against* another
rather than to help decide it — defaults, initial values, expected values in a
test helper.

## Inference does not run backwards from the return type

```ts
declare function parse<T>(input: string): T;
const n: number = parse('1');    // T = number, purely from the annotation
```

This compiles and is a lie: nothing checked that the string held a number. A
type parameter that appears *only* in the return position is an `as` with extra
steps. Lesson 05 is about that family of mistakes.

## What to build

| Export | What it does |
| --- | --- |
| `createStore` | Infers its state type from an initial value |
| `withFallback` | Uses `NoInfer` so the fallback is checked, not consulted |
| `fromEntries` | `Object.fromEntries`, typed through two parameters |
| `reduce` | The accumulator inferred from the seed, not from the callback |
| `firstMatching` | Contextual typing making the predicate's parameter free |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Remove `NoInfer` from `withFallback` and find the call in the tests that
   stops being an error. Explain what `T` became.
2. `reduce`'s accumulator could be inferred from the callback's return type
   instead of the seed. Try it, and describe the error message a caller gets
   when they get it wrong under each version.
3. Why is contextual typing "inference running the other way"? Draw the arrows
   for `map([1,2], x => String(x))`.
4. `fromEntries` on `[['a', 1], ['b', 'x']]` — what key type do you get, and is
   it what you wanted? What would you need for `{ a: number; b: string }`?
