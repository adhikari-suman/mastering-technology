# 05 — Generics that fight back

Most bad TypeScript is not missing types. It is generics used where they don't
belong, and the symptom is a signature nobody can call without a cast.

Four failure modes, each with a fix. This Lesson is diagnosis: you're given the
broken signature in prose and you write the repaired one.

## 1. The parameter that appears once

```ts
function log<T>(value: T): void { console.log(value); }
```

`T` shows up in one parameter and nowhere else. Nothing is related to anything,
so the generic buys the caller nothing at all — this is `(value: unknown)` with
extra ceremony, and it's *worse*, because `T` silently widens at each call and
the reader has to check whether it mattered.

**Rule:** a type parameter must appear at least twice. Once is a `unknown` you
haven't admitted to.

## 2. The return-only generic

```ts
function parse<T>(json: string): T { return JSON.parse(json); }
const user = parse<User>('...');    // no checking whatsoever
```

Nothing in the arguments determines `T`, so the caller picks it and the function
promises it. This is an `as` wearing a disguise — worse than an `as`, because it
doesn't look like one at the call site and won't be caught by a search.

**Rule:** if the caller supplies `T` and the body can't verify it, return
`unknown` and make them narrow. Part 07 is built on this.

## 3. The missing constraint

```ts
function getProp<T, K>(obj: T, key: K) { return obj[key]; }
```

Without `K extends keyof T`, the body doesn't typecheck and the result is a
union of every property type. The constraint isn't a restriction, it's what
makes the *result* precise.

**Rule:** when a parameter indexes another, constrain it. When it's used with an
operator, constrain it to something supporting that operator.

## 4. The union in disguise

```ts
function setLevel<T extends 'debug' | 'info'>(level: T): void
```

`T` appears once, is constrained to a closed set, and the return type doesn't
mention it. It is `(level: 'debug' | 'info')`, spelled less clearly.

The exception is real and worth knowing: keep the generic when the *return* type
depends on which member was passed — that's when the parameter is earning its
place.

**Rule:** constrained-to-a-union and used once means it wanted to be the union.

## The single test

For each type parameter, ask: **what does the caller learn that they didn't
already know?** If the answer is nothing, delete it.

## What to build

The repaired signatures. Each has a `// TODO` naming which of the four
mistakes the given version makes.

| Export | Fixes |
| --- | --- |
| `logValue` | The parameter that appears once |
| `parseJson` | The return-only generic |
| `getProp` | The missing constraint |
| `setLevel` | The union in disguise |
| `levelValue` | ...and the case where the generic *should* stay |
| `firstOr` | A correct generic, for contrast |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. `levelValue` keeps its generic while `setLevel` loses one. State the
   difference in a single sentence.
2. Find a return-only generic in a library you use. What would it take to make
   it honest, and why do you think they shipped it that way?
3. Is `<T extends unknown[]>` ever different from `unknown[]`? Find the case.
4. Apply the single test to every generic in your Part 03 Lesson 01 solution.
   Do they all pass?
