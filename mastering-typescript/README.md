# Mastering TypeScript

Exercise-driven, and built on the assumption that you already know JavaScript.
Nothing here re-teaches closures, `this`, promises or the module graph — that's
what `../mastering-javascript` was for. This curriculum is about the *other*
program in the file: the one the compiler checks and then throws away.

Every lesson is a folder with three files, plus one you make yourself:

| File               | What it is                                                          |
| ------------------ | ------------------------------------------------------------------- |
| `README.md`        | The concept, the traps, and a checklist of what to build             |
| `exercise.ts`      | Stubs + the full spec in JSDoc. **Never edited** — your reset point   |
| `exercise.test.ts` | The spec, executable *and* checkable. Red until you implement.       |
| `solution.ts`      | ⬅ **you create this**, by copying `exercise.ts`. Your answers go here |

Two dependencies: `typescript`, and `@types/node`. No bundler, no test
framework, no build step.

## The two green lights

This is the one structural difference from the JavaScript curriculum, and it is
the subject rather than a detail of the tooling.

A JavaScript lesson has one pass/fail. A TypeScript lesson has two, and they
fail independently:

```
  TYPES     tsc --noEmit   the type tests, and your annotations
  RUNTIME   node --test    the behaviour, with every type stripped off
```

Node 24 executes `.ts` files directly by **erasing** the types — not checking
them, erasing them. So a lesson can be green on RUNTIME and red on TYPES: your
code does the right thing and your types describe a different program. The
reverse happens too, and is worse, because it looks like success.

Neither light alone means done. The gap between them is most of what there is
to learn.

A type test looks like this, and fails by refusing to compile:

```ts
type _ = Expect<Equal<ReturnType<typeof parse>, unknown>>;
```

The other direction — "this must **not** compile" — needs no helper:

```ts
// @ts-expect-error - a string is not a number
const n: number = 'no';
```

That directive is self-checking. If the line ever stops being an error, tsc
reports the *directive* as unused, so a negative assertion can't silently rot.
Both live in `type-tests.ts`, which explains itself; you'll build its contents
from scratch in Part 04.

## Versions

`.nvmrc` pins **`24.19.0`** — an exact version, unlike the `lts/krypton`
codename next door. The difference is deliberate: what Node's type stripper
accepts is a property of a specific release, and this curriculum's rules about
what you may write (see `erasableSyntaxOnly` below) are checked against exactly
that behaviour. A patch bump that quietly widened or narrowed the accepted
syntax would change what a Lesson means.

```bash
nvm install     # first time only
nvm use         # any time after
npm install     # the compiler and Node's types
```

`engines.node` is `>=22.18`, which is a different statement: 22.18 is where
running `.ts` files without a flag became the default. Below it, nothing in here
executes. Everything is verified on 24.19.0 and also passes on Node 26.8.1, so
the floor is real rather than nominal — but the pin is what you should develop
on.

### Decorators cannot run, on any version

Worth knowing up front, because it looks like a version problem and isn't. No
released Node executes decorator syntax. V8 carries a `--js-decorators` flag
marked *in progress*, and on Node 26.8.1 it still cannot parse `@name` — in
plain JavaScript, not just after type stripping. `tsc` accepts decorators
happily, so this is a pure runtime gap.

Part 05 Lesson 05 is therefore built around what a decorator actually *is* — a
function taking a target and a typed context object. You write and type those
functions, the runtime tests apply them by hand, and a `fixtures/` file uses
real `@` syntax so `tsc` checks it without Node ever loading it. That teaches
more than running them would, since applying one manually is exactly what the
syntax does.

`typescript` is on the 7.x line — the native compiler. It type-checks a lesson
in well under a tenth of a second, which is why the watcher just re-runs it
from cold on every save instead of keeping incremental state around.

## How to work

Work one lesson at a time, from inside its folder:

```bash
cd 01-foundations/01-types-and-values
cp exercise.ts solution.ts   # your working copy, once per lesson
npm run watch                # the main loop; re-runs both lights on save
```

`npm run watch` scopes itself to whichever lesson folder you run it from. From
the project root it watches everything. To target a lesson or a Part from
elsewhere, name it: `npm run watch -- 03-generics`.

The tests import `solution.ts`, so a lesson you haven't started is *skipped*
rather than reported as failing — a missing solution isn't a red test, it's a
lesson you haven't opened. Because `exercise.ts` is never edited, that same `cp`
is how you wipe a lesson and start it again later.

From the project root:

```bash
npm test           # both lights, everything you've started
npm run types      # just the checker
npm run run-tests  # just the runtime
```

Splitting the two is worth doing when you're stuck. If RUNTIME is green and
TYPES is red, the code is right and the description is wrong — and that is
exactly the situation this curriculum exists to make you fluent in.

## Managing your solution files

`cp exercise.ts solution.ts` is all you ever strictly need, but there are four
helpers for doing it in bulk:

```bash
npm run setup     # create solution.ts wherever it's missing
npm run status    # which lessons are started / untouched / not begun
npm run reset     # restore solution.ts from exercise.ts   (destructive)
npm run clean     # delete solution.ts                     (destructive)
```

Each takes an optional filter that substring-matches the lesson path, so you can
act on one lesson or one Part instead of all of them:

```bash
npm run reset -- 04-type-level
npm run clean -- 01-foundations
```

`reset` and `clean` throw work away, so they refuse to run if **any** matched
`solution.ts` differs from its stubs, and print exactly which ones. Add `--yes`
when you mean it. Copies you haven't touched yet are removed without fuss, since
there's nothing in them to lose.

### Commit your solutions

`solution.ts` is deliberately **not** gitignored — commit your answers as you
go, exactly as next door. They're the only part of this repo that isn't
regenerable, they show your progress over time, and having them tracked means
`git checkout` can undo a `reset` or `clean` you didn't mean.

## The compiler settings

`tsconfig.json` is at the strict end on purpose, because a curriculum that
teaches you to read `strict` errors is worth more than one that hides them.
`strict` itself is eight flags; these are the ones it leaves off, and every one
of them is here:

| Flag | What it stops |
| --- | --- |
| `noUncheckedIndexedAccess` | `xs[0]` and `dict[k]` pretending they can't miss |
| `exactOptionalPropertyTypes` | `?` quietly meaning "or explicitly `undefined`" |
| `noImplicitOverride` | An override that silently stops overriding |
| `noImplicitReturns` | A branch that forgot to return |
| `noFallthroughCasesInSwitch` | The `break` you didn't write |
| `noPropertyAccessFromIndexSignature` | A guessed key reading like a declared one |

Two more shape what you're allowed to write at all:

| Flag | What it means here |
| --- | --- |
| `erasableSyntaxOnly` | No `enum`, no `namespace`, no parameter properties — if Node can't erase it, you can't write it |
| `verbatimModuleSyntax` | Every type-only import says `import type` |

Both are deliberate. They keep the source to the subset that runs natively, and
they make the erasure boundary visible in the code rather than in your head.
Part 06 pulls all of this apart and asks whether you'd choose it again.

## Rules of the road

1. **No copying from the test file into the implementation.** Reading the
   expected type off an `Expect<Equal<...>>` and pasting it in teaches you
   nothing. If you catch yourself pattern-matching the tests, reread the README.
2. **Guess before you hover.** Predict what a type will be before you look. The
   gap between your prediction and the tooltip is the entire lesson.
3. **Never reach for `any` or `as` to make an error go away.** Both are correct
   sometimes, and Part 08 Lesson 04 is about when. Until then, an error you
   silenced is a lesson you skipped.
4. **The scaffold ships no answer key.** `exercise.ts` only ever contains stubs.
   The solved `solution.ts` files in this repo are my own worked answers,
   committed as a record — if you're doing these lessons yourself, reading them
   before you've tried only cheats you.
5. **Both lights, or it isn't done.** And then say out loud why each answer is
   what it is. Green checks you can't explain are not mastery.

## Curriculum

Eight Parts, forty-eight lessons. The arc: read types → make the checker narrow
them → parameterise them → compute them → attach them to classes → configure the
thing doing the checking → defend the places types stop being true → and then
the parts of the model that only make sense once all of that is in place.

### Part 01 — Foundations: the type layer ✅

TypeScript is two programs sharing one file. One runs; the other is checked and
deleted. Everything later depends on being able to say which is which.

| #   | Lesson                   | You'll be able to                                                 |
| --- | ------------------------ | ------------------------------------------------------------------ |
| 01  | Types and values         | Work in both namespaces on purpose; `typeof`, `keyof`, merging      |
| 02  | Literals and widening    | Predict every inference; `as const`, `satisfies`, `const` params     |
| 03  | Objects and interfaces   | Structural typing, freshness, optional vs `undefined`, index signatures |
| 04  | Arrays and tuples        | Tuples vs arrays, `readonly`, variadic spread, honest indexing      |
| 05  | Unions and intersections | Types as sets; `keyof` over a union; a first taste of narrowing     |
| 06  | `any`/`unknown`/`never`/`void` | The four that describe the checker, not the data              |

### Part 02 — Narrowing and control flow ✅

The checker as an abstract interpreter. This Part is where "but I already
checked that" stops happening to you.

| #   | Lesson                   | You'll be able to                                                 |
| --- | ------------------------ | ------------------------------------------------------------------ |
| 01  | Control-flow analysis    | Follow a narrowing; know what assignment and closures reset         |
| 02  | Discriminated unions     | Model state so that illegal states don't typecheck                  |
| 03  | Type predicates          | Write `x is T` — and know it's an unchecked promise, not a proof    |
| 04  | Assertion functions      | `asserts x is T`, and why it demands an explicit annotation         |
| 05  | Exhaustiveness           | `never` checks and `satisfies`; a switch that breaks when it should |
| 06  | The limits of narrowing  | Aliased conditions, mutation, index access, `in` on a union         |

### Part 03 — Generics ✅

The heart of it. Most bad TypeScript is a generic that should have been a union,
or a union that should have been a generic.

| #   | Lesson                   | You'll be able to                                                 |
| --- | ------------------------ | ------------------------------------------------------------------ |
| 01  | Generic functions        | Infer from arguments; when to annotate; when not to be generic      |
| 02  | Constraints and defaults | `extends`, defaults, and constraint-directed inference              |
| 03  | Generic types and classes | Generic containers, and why a mutable one is invariant             |
| 04  | Inference sites          | Where inference happens, in what priority, and `NoInfer`            |
| 05  | Generics that fight back | The four common mis-designs, diagnosed and fixed                    |
| 06  | Higher-order generics    | Keep a generic alive through a wrapper; type `pipe` for real        |

### Part 04 — Type-level programming ✅

Types computing types. You'll rebuild most of `lib.es5.d.ts` by hand, including
the `Equal` you've been using since Part 01.

| #   | Lesson                   | You'll be able to                                                 |
| --- | ------------------------ | ------------------------------------------------------------------ |
| 01  | Conditional types        | `T extends U ? X : Y`; build `Exclude`, `Extract`, `NonNullable`    |
| 02  | Distribution             | Naked type params, `[T] extends [U]`, and why `Equal` looks so odd  |
| 03  | `infer`                  | Build `ReturnType`, `Parameters`, `Awaited`; recursive extraction   |
| 04  | Mapped types             | Build `Partial`, `Pick`, `Record`; modifiers and key remapping      |
| 05  | Template literal types   | Parse and construct strings in the type system                      |
| 06  | Recursive types          | `DeepReadonly`, a JSON type, tuple recursion, and the depth limit   |

### Part 05 — Classes, objects, and `this` ✅

The object-oriented surface, and the several places it disagrees with the
structural type system underneath it.

| #   | Lesson                   | You'll be able to                                                 |
| --- | ------------------------ | ------------------------------------------------------------------ |
| 01  | Class members            | Initialisation checking, `declare`, and what erasure forbids        |
| 02  | Visibility               | `private` vs `#private`, `protected` — and which one is a lie       |
| 03  | `implements` vs `extends` | Interfaces on classes, abstract members, construct signatures      |
| 04  | `this` types             | Polymorphic `this`, `this` parameters, builders that survive extension |
| 05  | Decorators               | Stage-3 signatures, applied by hand — see the note above            |
| 06  | Mixins                   | The mixin constructor pattern, and the types that make it compose   |

### Part 06 — Modules, declarations, and the compiler ✅

How a `.ts` file becomes a program someone else can import. Four of these
Lessons ship `fixtures/` — real ESM, CommonJS and `.d.cts` modules the exercises
import and resolve against, because module semantics can't be learned from one
file.

| #   | Lesson                   | You'll be able to                                                 |
| --- | ------------------------ | ------------------------------------------------------------------ |
| 01  | `tsconfig`               | Every flag that changes meaning; `strict` unpacked; `lib` vs `target` |
| 02  | Module resolution        | `nodenext` vs `bundler`, ESM/CJS interop, `import type`             |
| 03  | Declaration files        | Write `.d.ts` by hand; ambient and global declarations              |
| 04  | Typing untyped JavaScript | Types for a library that ships none; module augmentation           |
| 05  | Project references       | `composite`, incremental builds, monorepo layouts                   |
| 06  | Erasure and emit         | Type stripping, `erasableSyntaxOnly`, and why `enum` doesn't fit    |

### Part 07 — Types at the boundary ✅

Types are erased, so at every edge of your program they are a claim nobody
checked. This Part is about the edges.

| #   | Lesson                   | You'll be able to                                                 |
| --- | ------------------------ | ------------------------------------------------------------------ |
| 01  | Why `as` lies            | Assertion vs. validation, and the real cost of trusting the wire    |
| 02  | Parse, don't validate    | A schema validator whose types are inferred from the schema         |
| 03  | Branded types            | Nominal typing inside a structural system; a `UserId` that isn't a string |
| 04  | Typed errors             | `Result<T, E>`, exhaustive handling, and typing `catch`             |
| 05  | Async types              | `Promise` variance, `Awaited`, typed cancellation, async narrowing  |
| 06  | End-to-end contracts     | One source of truth; a client typed from a server definition        |

### Part 08 — Advanced ✅

The model underneath the model, and a capstone that needs all eight Parts.

| #   | Lesson                   | You'll be able to                                                 |
| --- | ------------------------ | ------------------------------------------------------------------ |
| 01  | Variance                 | Co-, contra-, in- and bivariance; `in`/`out`; methods vs properties |
| 02  | Soundness holes          | Every unsoundness TypeScript chose on purpose, and how to live with it |
| 03  | Reading the checker      | Decoding enormous errors; `--noErrorTruncation`; minimal repros     |
| 04  | The escape hatches       | `any`, `as`, `!`, `@ts-expect-error` — the right call for each      |
| 05  | Compiler performance     | Why checking gets slow, how to measure it, how to defer work        |
| 06  | Capstone: a typed router | Path strings parsed into typed params, at the type level            |

---

All eight Parts are built: 48 lessons, 450 runtime tests, 404 type assertions
and 101 `@ts-expect-error` negatives, plus 7 fixture modules that Lessons import
for real.

Every Lesson is verified in three states — no `solution.ts` (skipped cleanly), a
fresh copy (438 of the 450 runtime tests red, and type errors in every Part), and
a worked solution (both lights green). The pristine `exercise.ts` files all
compile as they stand, so a Lesson never starts from a broken file.

Ask for extra drills on any Lesson that didn't stick, or for a new technology
folder alongside this one.
