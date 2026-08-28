# 03 — Branded types

TypeScript is structural, so a `UserId` that is a `string` is a `string`, and
every `string` is a `UserId`:

```ts
type UserId = string;
type PostId = string;
declare function getUser(id: UserId): User;

getUser(somePostId);        // fine. It's all strings.
getUser('literally anything');
```

That's the whole class of bug: identifiers, units, sanitised strings, validated
inputs — values whose *type is the same* but whose *meaning is not*. Branding
gets nominal typing back inside a structural system.

## The technique

Intersect with something nothing else has:

```ts
declare const brand: unique symbol;
type Brand<T, B> = T & { readonly [brand]: B };

type UserId = Brand<string, 'UserId'>;
type PostId = Brand<string, 'PostId'>;
```

`UserId` is still a `string` at runtime — the brand property does not exist and
is never read. But no plain `string` is assignable to it, and `UserId` and
`PostId` are mutually unassignable because their brand values differ.

`unique symbol` for the key matters: a string key like `__brand` can be
accidentally produced by an object literal, and it shows up in `keyof`. A
`unique symbol` declared and never exported can be produced by nothing.

## Making one

Since no value *is* branded, there is exactly one way in, and you should make it
the only one:

```ts
export function userId(value: string): UserId {
  if (!/^u_[0-9]+$/.test(value)) throw new TypeError(`bad user id: ${value}`);
  return value as UserId;
}
```

The `as` is the point. Branding concentrates every unchecked claim about a value
into one function you can read in ten seconds, instead of scattering them across
every call site. That's the trade: one honest assertion in exchange for
compile-time safety everywhere else.

## Branding is free

`UserId` erases to `string`. There is no wrapper object, no allocation, no
`.value` to unwrap. It serialises as a string, compares as a string, and goes
into a `Map` as a string. The only cost is the constructor call, and you were
validating there anyway.

That's what makes it different from the newtype-by-wrapping approach
(`class UserId { constructor(readonly value: string) {} }`), which is real at
runtime and costs you an unwrap at every boundary.

## The other use: proof-carrying types

The brand doesn't have to name a domain concept. It can record that something
*happened*:

```ts
type Sanitised = Brand<string, 'Sanitised'>;
type Positive = Brand<number, 'Positive'>;
type NonEmpty<T> = Brand<readonly T[], 'NonEmpty'>;
```

Now `render(html: Sanitised)` cannot be called with unsanitised input, and the
compiler enforces an ordering constraint that no amount of code review reliably
does.

## What to build

| Export | What it is |
| --- | --- |
| `Brand<T, B>` | The mechanism |
| `UserId`, `PostId` | Two brands over `string`, mutually unassignable |
| `userId`, `postId` | The only ways in, validating as they go |
| `Positive` | A brand over `number` |
| `positive`, `divide` | A constructor and a use that cannot divide by zero |
| `NonEmptyArray<T>` | A brand carrying a proof about length |
| `nonEmpty`, `firstOf` | ...and a `first` that cannot return `undefined` |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Use a string key `__brand` instead of a `unique symbol`. Write the object
   literal that accidentally satisfies it.
2. `firstOf` returns `T`, not `T | undefined`. What did the type system learn,
   and where exactly did it learn it?
3. Branded types serialise as their base type. What happens when one comes back
   from `JSON.parse`, and what does that tell you about where brands live?
4. Compare branding to a wrapper class for `Positive`. Write both and list what
   each costs at the boundary of a hot loop.
