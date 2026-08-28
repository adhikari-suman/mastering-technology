# 04 — Arrays and tuples

Same runtime object, two very different types. An array is "any number of `T`";
a tuple is "exactly these positions, with these types."

```ts
const xs: number[] = [1, 2, 3];        // length unknown to the checker
const p: [number, number] = [1, 2];    // exactly two
```

## `readonly`

`readonly T[]` (or `ReadonlyArray<T>`) removes every mutating method from the
type. The array is not frozen — this is a compile-time guard, and a `readonly`
array passed to untyped code can still be pushed to.

The assignability is one-directional, and worth getting straight:

```ts
declare const mutable: number[];
declare const frozen: readonly number[];

const a: readonly number[] = mutable;   // fine — you're promising less
const b: number[] = frozen;             // error — you'd be promising more
```

**Default your parameters to `readonly T[]`.** It costs callers nothing (a
mutable array is accepted), and it stops you mutating an argument by accident.
Reserve `T[]` for the cases where you really do intend to write.

## Tuples

Fixed length, per-position types, and three modifiers:

```ts
type Pair    = [number, number];
type Labeled = [x: number, y: number];        // names are documentation only
type Opt     = [number, number?];             // length 1 or 2
type Rest    = [string, ...number[]];         // one string, then any numbers
```

Labels change nothing about the type — `[x: number]` and `[number]` are the same
type — but they show up in editor hints and in error messages, so use them.

## Variadic tuple types

Tuples can be spread inside other tuples, which lets you compose them the same
way you compose values:

```ts
type Concat<A extends readonly unknown[], B extends readonly unknown[]> = [...A, ...B];
type C = Concat<[1, 2], [3]>;   // [1, 2, 3]
```

That's the machinery behind typing `bind`, `curry`, and every "take a function
and add an argument" helper you'll write in Part 03.

## `noUncheckedIndexedAccess`, again

The flag that made object lookups honest does the same for arrays:

```ts
const xs = [1, 2, 3];
const first = xs[0];       // number | undefined
```

Which is uncomfortable and correct — the checker does not track lengths, and
`xs[0]` on an empty array really is `undefined`. It changes how you write:
destructuring, `.at()`, and explicit guards instead of blind indexing.

Tuples are exempt for their known positions, because there the length *is* known:

```ts
const p: [number, number] = [1, 2];
const x = p[0];            // number — no undefined
```

That difference is the clearest single demonstration of what a tuple buys you.

## A first taste of generics

`first<T>(xs: readonly T[]): T | undefined` needs a type parameter to say "the
element type, whatever it was". Use them here; Part 03 is where you'll learn to
design them, including why the constraint you didn't write is usually the bug.

## What to build

| Export | What it is |
| --- | --- |
| `Pair<A, B>` | A two-element tuple |
| `Coord` | A labelled `[x, y]` of numbers |
| `Concat<A, B>` | Two tuples spliced into one, at the type level |
| `NonEmpty<T>` | An array type that guarantees at least one element |
| `first`, `last` | Reads that admit an empty array |
| `head` | The same read on a `NonEmpty`, which cannot miss |
| `swap`, `zip`, `chunk` | The runtime half |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. `zip([1,2], ['a'])` — should it return one pair or two, and should the type
   say which? What would you need to express the answer?
2. Why is `first` typed `readonly T[]` rather than `T[]`? Which callers does
   that let in, and what does it stop you doing inside?
3. `const xs = [1, 2] as const` then `xs.push(3)`. Which of the two errors you
   could imagine do you actually get, and from what?
4. Write `type Last<T>` for a tuple. You'll need something from Part 04 that you
   haven't met yet — work out what's missing rather than looking it up.
