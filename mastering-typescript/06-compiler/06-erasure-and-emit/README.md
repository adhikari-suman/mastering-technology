# 06 — Erasure and emit

Almost all of TypeScript disappears. Four constructs don't, and knowing which
four explains this project's rules, Node's type stripper, and why `enum` is a
mistake you can measure.

## The four that emit code

| Construct | Why it can't be erased |
| --- | --- |
| `enum` | Compiles to an object literal and an IIFE. It is a *value*. |
| `namespace` with a body | Compiles to an object and an IIFE. Also a value. |
| Parameter properties | `constructor(private x)` emits `this.x = x` |
| Legacy `experimentalDecorators` | Emits `__decorate` helper calls |

Everything else — annotations, interfaces, type aliases, generics, `as`,
`satisfies`, `implements`, `abstract`, `declare`, `override`, `public`/`private`/
`protected` modifiers, `import type` — is deleted and leaves nothing behind.

Note what *is* erasable and surprises people: `#private` fields (that's
JavaScript), `abstract` (the check is compile-time only), static blocks
(JavaScript again), and accessor `get`/`set` (JavaScript).

## Type stripping

Node 22.18+ runs `.ts` directly by **deleting** type syntax and replacing it
with whitespace, preserving byte offsets so stack traces and source maps stay
correct. It does no type checking, no transformation, and no whole-program
analysis.

That last point is why `verbatimModuleSyntax` matters. A stripper looking at one
file cannot know whether `import { Foo } from './x.ts'` is a type or a value, so
it must keep the import. If `Foo` was type-only, you get a runtime import of a
module you didn't need — or a crash, if the export doesn't exist at runtime.
`import type` removes the guesswork.

`erasableSyntaxOnly` makes `tsc` reject the four constructs above, so the
compiler and the runtime agree about what is legal. Without it you can write
code that typechecks and won't load.

## `enum`, specifically

```ts
enum Color { Red, Green }
```

becomes a real object with a *reverse mapping* — `Color[0] === 'Red'` as well as
`Color.Red === 0`. Consequences:

- It exists at runtime, in your bundle, unshakeable by tree-shaking.
- Numeric enums are not type-safe: any `number` is assignable to a numeric enum
  member in many positions.
- `const enum` avoids the emit by inlining, and breaks under `isolatedModules`
  and every bundler that compiles file-by-file.

A union of literals does the same job, costs nothing, and shows up in logs as
the string you wrote. Part 01 Lesson 02 made the case; this is the mechanism
behind it.

## What to build

A model of the erasure rules, plus a stripper for the easy cases.

| Export | What it is |
| --- | --- |
| `Construct` | The TypeScript constructs this Lesson knows about |
| `ERASABLE` / `EMITS_CODE` | The two lists |
| `isErasable` | The classification |
| `checkErasable` | Report every non-erasable construct in a list |
| `stripAnnotations` | Remove `: type` annotations from a single-line signature |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Write an `enum` in a scratch `.ts`, run `tsc --noEmit` on it and then
   `node` it. Two tools, two errors, one cause. Which message is clearer?
2. Node's stripper replaces types with **whitespace** rather than deleting them.
   Why does that matter, and what would break otherwise?
3. `const enum` is inlined, so it emits nothing. Why is it still banned under
   `isolatedModules`? What does a per-file compiler not know?
4. `#private` is erasable and `private` is too — but only one is enforced at
   runtime. Restate why, in terms of what each compiles to.
