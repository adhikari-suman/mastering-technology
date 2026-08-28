# 04 — Typing untyped JavaScript

Sooner or later you depend on something with no types, or with types that are
wrong. The skill is describing someone else's runtime behaviour accurately,
from the outside, without touching it.

## The three options, worst to best

**1. `any` at the import.** The dependency's untypedness leaks into every
caller, and nothing tells you when it stops being necessary. This is the
default failure mode and it's how a codebase becomes "TypeScript" in name.

**2. An ambient declaration.** A `.d.ts` describing the module. This is what
DefinitelyTyped is: thousands of hand-written declarations for libraries that
never shipped their own. It works, and it has one flaw — nothing checks it. A
`.d.ts` is a claim, and a stale one is worse than none, because now the checker
is confidently wrong.

**3. A typed facade.** Import the library at its honest (useless) type, then
export a small module of your own that narrows it into precise types, validating
at the boundary. Everything downstream talks to your facade.

The facade costs a file and buys you three things: the assumption lives in one
place, it's checked at runtime, and when the library changes, exactly one thing
breaks.

## Where each belongs

An ambient declaration is right for a stable, well-understood library — most of
DefinitelyTyped. A facade is right when the library is awkward (`null` where you
want `undefined`, options bags, callback-style), when you use a fraction of a
large API, or when you might replace it.

This Lesson does the facade, because it's the one with actual type content.

## The library you're wrapping

`fixtures/legacy-cache.cjs` is an untyped CommonJS module. It ships
`legacy-cache.d.cts` saying `create(options?: unknown): unknown` — true, and no
help at all.

Its real behaviour, which you have to discover from the source:

- `create({ max })` returns an object with `get`, `set`, `del`, `stats`
- `get` returns the value, or **`null`** when absent — not `undefined`
- `set` evicts the oldest entry when full and always returns `true`
- `stats()` returns `{ hits, misses, size, max }`

Your facade turns `null` into `undefined`, gives everything real types, and
checks at construction that the shape is what you claimed.

## Writing declarations you can't verify

The uncomfortable part: nothing checks a `.d.ts` against the JavaScript it
describes. Two habits help.

**Validate at the boundary.** If you're claiming `create` returns an object with
four methods, check that at runtime once, when you build the facade. It costs
one call and turns a silent wrong assumption into a clear error.

**Be pessimistic about nullability.** `T | undefined` costs you a check;
omitting it costs you a production crash. When the source is ambiguous, assume
the wider type.

## What to build

| Export | What it is |
| --- | --- |
| `Cache<V>` | What the library's object actually is, honestly typed |
| `CacheStats` | The `stats()` shape |
| `createCache` | The facade — validates, then adapts |
| `CacheError` | Thrown when the library isn't what you claimed |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Add a fifth method to your `Cache` type that the library doesn't have. Which
   light catches it — and what does the answer tell you about `.d.ts` files?
2. The facade converts `null` to `undefined`. What breaks if the library ever
   legitimately stores `null` as a value? Fix it.
3. When would you send your declaration to DefinitelyTyped rather than keeping a
   facade? What changes about who owns being wrong?
4. Your facade validates at construction. What would it cost to validate every
   call, and when would that be worth it?
