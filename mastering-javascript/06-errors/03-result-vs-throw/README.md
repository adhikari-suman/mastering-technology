# 03 — Returning Errors Instead of Throwing

Not every failure deserves an exception. This lesson is about the alternative,
and about knowing which to reach for.

## The problem with throwing everything

```js
const user = findUser(id);   // might this throw? the signature doesn't say
```

Exceptions are invisible in a function's type. A caller has no way to know what
can fail without reading the implementation, so `try/catch` gets omitted exactly
where it matters. Meanwhile, "user not found" isn't exceptional at all — it's an
ordinary outcome of looking something up.

Throwing is also genuinely slow, because constructing an `Error` captures a
stack trace.

## The Result pattern

Make failure part of the return value, so the caller cannot ignore it:

```js
const ok = (value) => ({ ok: true, value });
const err = (error) => ({ ok: false, error });

function findUser(id) {
  const user = db.get(id);
  return user ? ok(user) : err('not found');
}

const result = findUser(1);
if (!result.ok) return handle(result.error);
use(result.value);
```

This is `Result` in Rust, `Either` in Haskell, and `error` as a second return
value in Go. The shared idea: **expected failures are data, unexpected failures
are exceptions.**

The discriminant (`ok`) is what makes it work — TypeScript narrows on it, and in
plain JavaScript it's a check you can't accidentally skip, because there's no
`.value` to read until you've looked.

## Which to use

**Return a Result** when failure is expected and the caller will act on it:
not found, validation failed, parse failed, unauthorised.

**Throw** when failure means a bug or an unrecoverable state: a broken
invariant, a missing config at startup, out of memory. Things where unwinding to
a top-level handler is the right response.

The test: *would a reasonable caller write `try/catch` around this every single
time?* If yes, it should have been a Result.

## The cost

Results propagate manually. Every layer has to check and forward, where an
exception would have flown past on its own:

```js
const a = step1();      if (!a.ok) return a;
const b = step2(a.value); if (!b.ok) return b;
```

That's the real trade-off, and why languages with this pattern add syntax for it
(Rust's `?`). In JavaScript you write it out, or build small combinators — which
is what you're doing below.

## What to build

| Export | What it does |
| --- | --- |
| `ok(value)` / `err(error)` | Constructors |
| `isOk` / `isErr` | Guards |
| `mapResult(result, fn)` | Transform a success, pass failure through |
| `chainResult(result, fn)` | Sequence Result-returning steps |
| `unwrapOr(result, fallback)` | Get the value or a default |
| `fromThrowing(fn)` | Wrap a throwing function into a Result one |
| `toThrowing(fn)` | The reverse, for boundaries |
| `all(results)` | Collect all, or the first failure |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. `mapResult` and `chainResult` differ only in whether `fn` returns a raw value
   or a Result. Why do you need both? What happens if you use the wrong one?
2. Where in a real app does the Result world end and the throwing world begin?
3. Node's callbacks are `(err, value)` — the same idea, positionally. Which
   shape is harder to misuse, and why?
