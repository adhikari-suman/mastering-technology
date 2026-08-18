# 01 — `throw`, `catch`, `finally`

The control flow of failure. Simple mechanics, several genuinely surprising
rules.

## `throw` accepts anything

```js
throw new Error('proper');
throw 'a string';     // legal, and a mistake
throw { code: 42 };   // legal, and a mistake
```

Only an `Error` carries a stack trace. Throw a string and you lose where it came
from, permanently. **Always throw an `Error`** — and when catching, remember
anyone might not have:

```js
catch (err) {
  const error = err instanceof Error ? err : new Error(String(err));
}
```

## `finally` always runs — and can eat your result

`finally` runs on success, on throw, and on early `return`. That's why it's the
right place for cleanup.

But a `return` inside `finally` **overrides** whatever the `try` was going to do,
including swallowing an in-flight exception:

```js
function bad() {
  try { throw new Error('boom'); }
  finally { return 'swallowed'; }   // the error vanishes entirely
}
bad();   // 'swallowed' — no error escapes
```

Never `return` or `throw` from a `finally` unless you mean exactly that. It's
one of the few places JavaScript will silently discard an exception.

The evaluation order is also worth knowing: `try`'s return **value** is computed
before `finally` runs, so mutating a variable in `finally` doesn't change an
already-computed primitive return.

## Optional catch binding

```js
try { risky(); } catch { fallback(); }   // no parameter needed
```

## Rethrowing and wrapping

Catching an error you can't handle and swallowing it is how bugs become
invisible. Either handle it, or rethrow:

```js
catch (err) {
  if (!isRetryable(err)) throw err;    // not mine — pass it on
  ...
}
```

When you rethrow with more context, keep the original as `cause` (ES2022):

```js
throw new Error('Failed to load config', { cause: err });
```

`err.cause` preserves the whole chain. Without it, wrapping destroys the
original stack — the most common way debugging information is lost.

## Errors are expensive

Constructing an `Error` captures a stack trace, which costs real time. Using
exceptions for ordinary control flow — "not found", "invalid input" — is both
slow and semantically wrong. Lesson 03 covers what to do instead.

## What to build

| Export | What it does |
| --- | --- |
| `attempt(fn)` | Run and report `[error, value]`, never throwing |
| `normaliseError(value)` | Anything thrown → a real `Error` |
| `withCleanup(fn, cleanup)` | `finally` used correctly |
| `swallowsError()` | Demonstrate the `finally`-return trap |
| `rethrowWithContext(fn, message)` | Wrap, preserving `cause` |
| `causeChain(error)` | Walk `cause` to the root |
| `isErrorLike(value)` | Duck-type an error across realms |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. `try { return 'a'; } finally { return 'b'; }` — which wins? Now make the
   `try` throw instead. Same answer?
2. Does `finally` run if the `try` block calls `process.exit()`? What does that
   tell you about what "always" means?
3. `err instanceof Error` fails across realms (a worker, a vm context). What's
   the robust check, and what does `Object.prototype.toString` give you?
