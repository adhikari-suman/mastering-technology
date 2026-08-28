# 01 — `tsconfig`

The compiler has around a hundred flags. Perhaps fifteen change what your code
*means*; the rest change what gets emitted or where files are found. Knowing
which is which is the difference between a config you inherited and one you
chose.

## `strict` is eight flags

Turning it on turns on all of these. Turning one off individually still leaves
`strict: true` in the file, which is how projects end up claiming to be strict
and not being:

| Flag | What it does |
| --- | --- |
| `noImplicitAny` | An un-annotated parameter is an error, not `any` |
| `strictNullChecks` | `null` and `undefined` are not members of every type |
| `strictFunctionTypes` | Function-typed **properties** check parameters contravariantly |
| `strictBindCallApply` | `bind`/`call`/`apply` are checked against the signature |
| `strictPropertyInitialization` | Class fields must be definitely assigned |
| `noImplicitThis` | An untyped `this` is an error |
| `useUnknownInCatchVariables` | `catch (e)` gives `unknown`, not `any` |
| `alwaysStrict` | Emit `"use strict"`, parse in strict mode |

`strictNullChecks` is the one that matters most and the one that is hardest to
adopt later, because it changes the type of every optional thing in the program
at once.

## The ones `strict` leaves off

All of these are on in this project, and each one closes a hole `strict` doesn't:

`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`,
`noImplicitReturns`, `noFallthroughCasesInSwitch`,
`noPropertyAccessFromIndexSignature`, `noUnusedLocals`, `noUnusedParameters`,
`allowUnreachableCode: false`.

They're off by default for adoption reasons, not because they're wrong.

## `target` versus `lib`

`target` decides what syntax is *emitted* — how far down `async`/`await`,
optional chaining and class fields get compiled. `lib` decides what *type
declarations* are loaded, and therefore what globals you're allowed to reference.

Setting `target` implies a matching `lib`, which is why raising `target` can
suddenly make `Object.groupBy` typecheck. But you can set them independently,
and you should when the runtime and the syntax level differ — a browser bundle
targeting ES2017 syntax that still runs somewhere with modern built-ins.

Getting `lib` wrong produces the most confusing class of error in the language:
`Property 'at' does not exist on type 'string[]'` for a method that plainly
exists at runtime.

## `moduleResolution`

Lesson 02's whole subject. In brief: `nodenext` models what Node actually does
(extensions required, `exports` respected, ESM/CJS distinction real);
`bundler` models what bundlers do (extensions optional, `exports` respected, no
CJS/ESM distinction). `node10` is the legacy algorithm and should be treated as
a migration state.

## What to build

A resolver for the flag set itself. Given a partial config, work out what's
actually on — which is what the compiler does before it checks a single line.

| Export | What it does |
| --- | --- |
| `STRICT_FLAGS` | The eight, as a readonly tuple |
| `EXTRA_STRICT_FLAGS` | The ones `strict` leaves off |
| `resolveFlags` | Expand `strict`, then apply explicit overrides |
| `isStricterThan` | Compare two configs |
| `describeConfig` | A human summary of what a config actually enables |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. `{ strict: true, strictNullChecks: false }` — is that project strict? What
   would you say in a code review?
2. Set `target: 'es5'` in a scratch config and try to use a `Map`. Now set
   `lib: ['es2015']` as well. Which error went away, and which stayed?
3. Which of the flags in `EXTRA_STRICT_FLAGS` would break the most code in a
   large existing project? Which would find the most real bugs? Are they the same?
4. `noUnusedLocals` is deliberately NOT on in this project. Work out why, given
   what an unfinished Lesson looks like.
