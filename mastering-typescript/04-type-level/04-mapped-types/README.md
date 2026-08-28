# 04 — Mapped types

A `for` loop over the keys of a type:

```ts
type MyPartial<T> = { [K in keyof T]?: T[K] };
```

`K in keyof T` iterates the union of keys, and the body is what each property
becomes. Everything in `lib.es5.d.ts` that reshapes an object is one of these.

## Modifiers

`readonly` and `?` can be added with `+` (the default) or removed with `-`:

```ts
type Mutable<T>  = { -readonly [K in keyof T]: T[K] };
type Required<T> = { [K in keyof T]-?: T[K] };
type Readonly<T> = { +readonly [K in keyof T]: T[K] };   // + is implied
```

Removal is the interesting direction, because there's no other way to get it.
Note that `-?` also strips `undefined` from the property type — it's not purely
a modifier change, which surprises people:

```ts
type A = Required<{ a?: string }>;              // { a: string }
type B = Required<{ a: string | undefined }>;   // { a: string | undefined }
```

## Homomorphic mapped types

When the body is exactly `[K in keyof T]`, the mapping is *homomorphic*: it
preserves the original's modifiers, and it passes arrays and tuples through as
arrays and tuples rather than flattening them to objects.

```ts
type A = MyPartial<string[]>;    // (string | undefined)[]  — still an array
```

Break the pattern — `[K in keyof T as ...]`, or `[K in Keys]` with `Keys`
computed elsewhere — and you lose that, getting a plain object with numeric-ish
keys. This is why `Pick` needs writing carefully.

## Key remapping with `as`

The clause that turns a mapped type from reshaping into renaming:

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
};
// { name: string }  ->  { getName: () => string }
```

Mapping a key to `never` **removes** it, which is how you filter:

```ts
type OnlyStrings<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K]
};
```

That single idiom replaces most hand-written `Omit`-chains.

## Why `Pick` and `Omit` behave differently

```ts
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
```

`Pick` iterates `K`, not `keyof T`, so it is *not* homomorphic and drops
modifiers. `Omit` is defined in terms of it and inherits that. It's also why
`Omit` accepts keys that don't exist — `Exclude` doesn't care — which is a
long-standing complaint and a good exercise in Lesson 06.

## What to build

| Export | What it is |
| --- | --- |
| `MyPartial` / `MyRequired` / `MyReadonly` | The three modifier maps |
| `Mutable` | `readonly` removed |
| `MyPick` / `MyRecord` | Iterating a key set rather than `keyof T` |
| `Getters` | Key remapping with a template literal |
| `PickByType` | Filtering by mapping unwanted keys to `never` |
| `mapKeys` | The runtime twin of remapping |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. `MyPartial<string[]>` — array or object? Now write a non-homomorphic version
   and check again. What exactly did the `keyof T` buy?
2. `Required<{ a?: string }>` gives `{ a: string }`. Where did the `undefined`
   go, and is removing it the right call under `exactOptionalPropertyTypes`?
3. `PickByType<T, string>` on a type with a `string | number` property —
   included or not? Justify the answer you get.
4. Can a mapped type add a key that wasn't in `T`? Try it. What does that tell
   you about what `in` is iterating?
