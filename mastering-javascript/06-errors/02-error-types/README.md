# 02 — Error Types

The built-in hierarchy, and how to add your own so callers can tell your
failures apart.

## The built-ins

All inherit from `Error`:

| Type | Thrown when |
| --- | --- |
| `TypeError` | Wrong type — `null.x`, calling a non-function |
| `RangeError` | Valid type, impossible value — `new Array(-1)` |
| `SyntaxError` | Unparseable code — `JSON.parse('{oops}')` |
| `ReferenceError` | Undeclared identifier, or TDZ access |
| `AggregateError` | Several at once — `Promise.any` |

Every one has `name`, `message` and `stack`. `stack` is non-standard but
universal.

## Subclassing

```js
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = 'ValidationError';   // ← without this, name stays 'Error'
    this.field = field;
  }
}
```

Two details people miss:

**Set `name` yourself.** It's inherited from `Error.prototype`, so it reports
`'Error'` unless you assign it. Anything logging `err.name` will lie.

**`super(message)` must come first**, exactly as in Part 03 — a derived
constructor has no `this` until it runs.

## Why subclass at all

So callers can branch on the *kind* of failure without parsing strings:

```js
try { await save(user); }
catch (err) {
  if (err instanceof ValidationError) return show(err.field);
  if (err instanceof NetworkError) return retry();
  throw err;                          // unknown — not mine to swallow
}
```

Matching on `err.message.includes('not found')` is the alternative, and it
breaks the moment someone rewords a message.

## `instanceof` and its limits

Works fine for your own classes in one realm. It fails across realms — a worker,
a `vm` context, an iframe — where `Error` is a different object entirely. For
library code crossing those boundaries, a `code` property is more robust:

```js
if (err.code === 'ERR_NOT_FOUND') { }
```

That's why Node's own errors carry `code`, and why matching on it is the
documented approach rather than `instanceof`.

## `AggregateError`

Holds several errors in `.errors`. You built one in Part 04's `any`. Use it
whenever a batch fails and every failure matters.

## Serialising

`JSON.stringify(new Error('x'))` gives `'{}'` — `message` and `stack` are
non-enumerable. Logging errors as JSON silently produces nothing, which is a
memorable outage. Extract the fields explicitly.

## What to build

| Export | What it does |
| --- | --- |
| `ValidationError` | With `field`, and `name` set correctly |
| `NotFoundError` | With `code`, for realm-safe matching |
| `HttpError` | With `status`, plus `isClientError` |
| `serialiseError(err)` | JSON-safe, including custom fields |
| `classify(err)` | Which built-in type is it? |
| `collectErrors(fns)` | Run all, gather failures into an `AggregateError` |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. Subclass `Error` and check `err.stack`. Does it include your subclass name?
   What does `Error.captureStackTrace` change?
2. `class E extends Error {}` with no constructor — is `name` `'E'` or
   `'Error'`? Why?
3. Node errors have `code`. Find three in the docs and explain why matching on
   `code` beats matching on `message`.
