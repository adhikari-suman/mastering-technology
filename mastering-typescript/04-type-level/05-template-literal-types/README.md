# 05 — Template literal types

String manipulation, in the type system:

```ts
type Greeting = `hello ${string}`;
type Event = `on${'Click' | 'Focus'}`;   // 'onClick' | 'onFocus'
```

Interpolating a union produces the cross product of every combination. Two
unions of four members each give sixteen types — which is fine, and four unions
of ten members give ten thousand, which is not. TypeScript caps the result at
100,000 members and errors past it.

## The four intrinsics

`Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize` are implemented in the
compiler, not in `.d.ts`:

```ts
type A = Capitalize<'name'>;   // 'Name'
```

They pass non-literal `string` through unchanged, so `Capitalize<string>` is
`string`. That matters when a mapped type's key is `string | symbol` — intersect
with `string` first, as Lesson 04 did.

## Matching, with `infer`

The real power is on the left of `extends`, where a template is a *pattern*:

```ts
type Split<S extends string, D extends string> =
  S extends `${infer Head}${D}${infer Tail}` ? [Head, ...Split<Tail, D>] : [S];

type P = Split<'a/b/c', '/'>;   // ['a', 'b', 'c']
```

Matching is **non-greedy from the left**: `infer Head` takes as little as
possible. That is what makes recursive splitting terminate, and it is the
opposite of what a regex would do.

## Extracting route parameters

The canonical application, and Part 08's capstone in miniature:

```ts
type Params<S extends string> =
  S extends `${string}:${infer P}/${infer Rest}` ? P | Params<`/${Rest}`> :
  S extends `${string}:${infer P}` ? P :
  never;

type A = Params<'/users/:id/posts/:postId'>;   // 'id' | 'postId'
```

Once you have the parameter names as a union, a mapped type turns them into an
object, and suddenly `router.get('/users/:id', (req) => req.params.id)` typechecks
with no annotation anywhere.

## Constrained `infer` for numbers

`infer N extends number` doesn't parse a string into a number by itself — the
constraint filters, it doesn't convert. To actually convert you match against
the numeric literal type:

```ts
type ToNumber<S extends string> = S extends `${infer N extends number}` ? N : never;
type A = ToNumber<'42'>;   // 42
```

This works because `${...}` in a *pattern* position will match a numeric literal
type when the constraint says to. It is a genuine parse, and one of the odder
corners of the language.

## What to build

| Export | What it is |
| --- | --- |
| `Split<S, D>` | A string into a tuple, on a delimiter |
| `Join<T, D>` | The inverse |
| `Trim<S>` | Leading and trailing spaces removed |
| `Replace<S, From, To>` | The first occurrence |
| `EventName<T>` | `'click'` → `'onClick'`, over a union |
| `PathParams<S>` | `'/users/:id'` → `{ id: string }` |
| `splitPath` | The runtime twin |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. `Split<'a/b', '/'>` is `['a', 'b']`, but what is `Split<string, '/'>`? Should
   it be? What would you want it to be?
2. Matching is non-greedy from the left. Write a `LastSegment<S>` that needs the
   opposite, and work out how to get it.
3. `PathParams` gives every parameter the type `string`. What would it take to
   support `/users/:id<number>`, and is that a good idea?
4. Interpolating two four-member unions gives sixteen types. Where is the line
   between "expressive" and "a compiler that takes ten seconds"? Part 08 Lesson
   05 measures it.
