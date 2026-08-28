# 04 — Typed errors

A thrown value has no type. `throw` is invisible in a signature, `catch` gives
you `unknown`, and nothing makes a caller handle anything. For failures that are
part of your API rather than bugs, that's the wrong tool.

## `catch` is `unknown`, and anything can be thrown

Under `strict` (via `useUnknownInCatchVariables`):

```ts
try { risky(); } catch (err) {
  err.message;                    // error — you don't know what this is
  if (err instanceof Error) err.message;   // fine
}
```

`err instanceof Error` is a necessary check and an insufficient one. Across a
realm boundary — a worker, a `vm` context, some bundler configurations — an
`Error` from elsewhere fails `instanceof`. That's why library code checks
structurally, or checks a `code` property, rather than relying on the prototype
chain.

## `Result<T, E>` — failure as a value

```ts
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

A discriminated union from Part 02. What it buys:

- **The failure is in the signature.** `parse(s): Result<User, ParseError>` says
  what can go wrong. `parse(s): User` says nothing.
- **The caller must handle it.** They can't reach `.value` without checking
  `.ok`, and the exhaustiveness machinery from Part 02 Lesson 05 covers the
  error cases too.
- **It composes.** `map`, `flatMap` and `all` chain without a single `try`.

What it costs: ceremony at every call, and it doesn't unwind. Deep call stacks
where only the top cares about the failure are exactly what exceptions are for.

## Which to use

**Result** for expected failures: parsing, validation, a lookup that can miss, a
request that can 404. These are outcomes, not emergencies.

**Throw** for bugs and for the unrecoverable: a broken invariant, a missing
config at startup, an assertion. If every caller would rethrow, throwing was
right.

The smell that you chose wrong: a `try/catch` whose `catch` immediately turns
the error into a return value, or a `Result` that every caller unwraps with a
throw.

## Typed error unions

The `E` slot should be a discriminated union, not `Error`:

```ts
type FetchError =
  | { kind: 'network'; cause: unknown }
  | { kind: 'notFound'; id: string }
  | { kind: 'invalid'; field: string };
```

Now the compiler tells a caller when you add a case, which is the thing
exceptions can never do.

## What to build

| Export | What it is |
| --- | --- |
| `Result<T, E>` | The union |
| `ok`, `err` | Constructors |
| `isOk`, `isErr` | Predicates that narrow |
| `map`, `mapErr`, `flatMap` | The combinators |
| `unwrapOr`, `unwrap` | Getting out, safely and not |
| `all` | Many results into one, failing on the first error |
| `tryCatch` | Bridge a throwing function into a Result |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. `unwrap` throws. Isn't that just exceptions again? When is it the right call,
   and what should its error message contain?
2. `all` stops at the first error. Write the version collecting every error.
   What changes in the return type, and which do you want for a form?
3. `flatMap` is where `Result` composes. Chain three fallible steps with it and
   then with `try/catch`. Which reads better, and does that depend on the count?
4. `tryCatch` turns a `throw` into a `Result`. What type should the error slot
   be, given anything can be thrown? Defend your choice.
