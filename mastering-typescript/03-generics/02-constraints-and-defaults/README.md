# 02 — Constraints and defaults

An unconstrained `T` can be anything, so you can do nothing with it. A
constraint buys back exactly the operations you name:

```ts
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

longest('ab', 'c');        // string
longest([1], [1, 2]);      // number[]
longest(1, 2);             // error: number has no length
```

Note what it returns: `T`, not `{ length: number }`. That's the difference
between a constraint and a parameter type. Write `(a: { length: number })` and
the caller gets the constraint back instead of their own type.

## Constraints direct inference

A constraint is also a hint about how specific the inferred type should be:

```ts
function f<T>(x: T): T;             // f('a') -> string
function g<T extends string>(x: T): T;   // g('a') -> 'a'
```

Constraining to a primitive tells the checker literals are meaningful here, so
it stops widening. `<T extends string>` is the cheap version of `<const T>` for
the string case.

## Defaults

A default is used when inference finds nothing:

```ts
type Box<T = string> = { value: T };
const a: Box = { value: 'x' };        // Box<string>
const b: Box<number> = { value: 1 };
```

Defaults matter most for types nobody instantiates explicitly — error payloads,
event maps, config objects — where the common case should need no angle
brackets. They do **not** kick in when inference produces `unknown`; they only
apply when the parameter is absent.

Order matters: a parameter with a default may not be followed by one without.

## Constraints referring to each other

Parameters are in scope for later parameters, which is what makes the `keyof`
pattern work:

```ts
function pluck<T, K extends keyof T>(obj: T, key: K): T[K];
function groupBy<T, K extends PropertyKey>(xs: T[], f: (x: T) => K): Record<K, T[]>;
```

`PropertyKey` is `string | number | symbol` — the set of things that can index
an object. Use it rather than `string` when the key is computed.

## `object` versus `{}` versus `Record<string, unknown>`

Three constraints that look interchangeable and are not:

- `T extends object` — anything non-primitive. Arrays and functions included.
- `T extends {}` — anything except `null` and `undefined`. Primitives included.
  Almost never what you meant.
- `T extends Record<string, unknown>` — an object whose values you may read by
  string key. Rejects interfaces without index signatures, which surprises people.

Default to `object`.

## What to build

| Export | What it does |
| --- | --- |
| `Box<T>` | A container whose parameter has a default |
| `longest` | The classic constraint, returning `T` rather than the constraint |
| `withDefault` | Two parameters, one of them defaulted |
| `keysOf` | `Object.keys`, typed |
| `merge` | Two objects in, their intersection out |
| `groupBy` | `PropertyKey` as a constraint, `Record` as a result |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Change `longest`'s signature to `(a: { length: number }, b: { length: number })`.
   Which test breaks, and what did the caller lose?
2. `keysOf` is unsound. Find the input that proves it, then decide whether
   `Object.keys` returning `string[]` is the better lie.
3. Why does `Box` need a default at all, when `Box<string>` is four characters
   longer? Find a case where the default is load-bearing rather than cosmetic.
4. Replace `K extends PropertyKey` in `groupBy` with `K extends string`. What
   still compiles, and what stops?
