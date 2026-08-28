# 01 — Types and values

TypeScript is two programs sharing one file. One of them runs. The other is
checked and then deleted, and never existed by the time Node sees your code.

Everything in this curriculum comes back to that split, so start by being able
to point at which world any given piece of syntax lives in.

## Two declaration spaces

A name can mean one thing as a value and something entirely unrelated as a type,
because they are looked up in separate namespaces:

```ts
type Named = { name: string };          // type space
const Named = { name: 'default' };      // value space — no conflict
```

`Named` in `const x: Named` resolves in type space. `Named` in `Named.name`
resolves in value space. Neither shadows the other. This isn't a curiosity —
it's the pattern behind half of TypeScript's idioms.

Which space you are in is decided by *position*, not by the name:

| Position | Space |
| --- | --- |
| after `:` | type |
| after `as` / `satisfies` | type |
| inside `<...>` on a type | type |
| the body of `type X = ...` | type |
| everywhere else | value |

## `type` vs `interface`

Both describe object shapes and both are structural. The differences that
actually matter:

```ts
type A = { x: number } & { y: number };   // aliases anything: unions, primitives, tuples
interface B { x: number }                 // objects only
interface B { y: number }                 // ...but reopenable — this MERGES into B
```

`interface` supports **declaration merging**: two blocks with the same name in
the same scope combine into one type. That's how the DOM and Node type
definitions let you extend them, and it's why `interface` is the right choice
for a public API surface others may need to augment.

`type` cannot merge — a second `type A` is a redeclaration error. That makes it
the right choice everywhere else, since a type alias can't be changed from a
distance.

Default to `type`. Reach for `interface` when you want it reopenable.

## Crossing from value space to type space

Three operators do the crossing, and they compose:

```ts
const config = { host: 'localhost', port: 5432 };

type Config = typeof config;              // value -> type      { host: string; port: number }
type Key = keyof Config;                  // type -> its keys   'host' | 'port'
type Port = Config['port'];               // indexed access     number
type Any = Config[Key];                   // ...with a union    string | number
```

`typeof` here is **not** the JavaScript `typeof`. Same word, different world:
`typeof config` in an expression gives you the string `"object"`; in a type
position it gives you the type of `config`. Position decides.

Indexed access takes a *type*, not a name, which is why `Config['port']` uses a
string literal type and why `Config[Key]` distributes over the union to give you
a union of the value types.

There is no operator going the other way. You cannot turn a type into a value,
because by the time the program runs the type is gone.

## What to build

Type stubs in `exercise.ts` are written as `unknown` so the file compiles
untouched; each one is independent, so nothing cascades. Replace them.

| Export | What it is |
| --- | --- |
| `Point` | An object type with `x` and `y`, both `number` |
| `PointKey` | Its keys as a union — derived with `keyof`, not typed by hand |
| `PointValue` | The type of any `Point` value — indexed access with a union |
| `Origin` | The type of the given `origin` value, recovered with `typeof` |
| `Vec` | An interface declared in **two** blocks, merging to `{ x; y }` |
| `Named` | One name declared in both spaces at once |
| `makePoint`, `distance` | Ordinary functions, annotated |
| `MakePoint` | `makePoint`'s own type, recovered with `typeof` |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

Two lights, and both must be green. `RUNTIME` is `node --test` with the types
stripped off; `TYPES` is `tsc --noEmit`, which is where the type tests live.
A type test looks like this and fails by refusing to compile:

```ts
type _ = Expect<Equal<PointKey, 'x' | 'y'>>;
```

## Going deeper

1. Delete `type` from `type Named = { name: string }` so both declarations are
   `const`. What error do you get, and what does it tell you about namespaces?
2. `keyof` a type with no keys. What comes back, and why is that the right
   answer rather than an error?
3. Add a third `interface Vec` block declaring `x: string`. Where does the error
   appear — on the block, or on a use site? Explain the difference.
4. Why can `typeof` cross from values to types but nothing crosses back?
