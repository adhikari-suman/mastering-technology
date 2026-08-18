# 05 — Validation and Boundaries

Where untrusted data enters your program, and what to do about it there.

## Parse, don't validate

The distinction that makes the rest obvious:

```js
// Validate: check, then carry on with the same unproven value
function save(user) {
  if (!isValid(user)) throw new Error('invalid');
  db.save(user);        // `user` is still the same shapeless thing
}

// Parse: check and RETURN a value that has proven its shape
function parseUser(input) {
  if (typeof input?.email !== 'string') return err('email required');
  return ok({ email: input.email, age: Number(input.age) || 0 });
}
```

Validation throws away what it learned — three functions later, someone checks
again "just in case". Parsing preserves it: the returned object is known-good by
construction, and nothing downstream needs to re-check.

The practical test: after your check, is there a *different value* carrying the
guarantee? If not, you validated.

## Boundaries

Every program has an edge where data arrives unproven: HTTP bodies, CLI
arguments, files, environment variables, third-party responses, `JSON.parse`
output. `JSON.parse` returns `any` in the honest sense — it could be anything.

The rule: **parse once, at the boundary. Trust everywhere inside.** Scattering
defensive checks through the interior is how you end up with `if (!user) return`
in forty places and still crash.

## Collect every error

A form that reports one problem at a time is hostile. Gather them:

```js
{ ok: false, errors: [
  { field: 'email', message: 'required' },
  { field: 'age', message: 'must be a number' },
] }
```

That's lesson 03's Result, with a plural error. Fail-fast is right for
programmer errors; collect-all is right for user input.

## Normalise while you're there

Parsing is also the place to coerce and default, so the interior sees exactly
one shape:

```js
{ email: String(input.email).trim().toLowerCase(),
  age: Number(input.age) || 0,
  tags: Array.isArray(input.tags) ? input.tags : [] }
```

Now nothing downstream writes `user.tags?.length ?? 0`.

## What to build

| Export | What it does |
| --- | --- |
| `required` / `isString` / `isNumber` / `minLength` / `matches` | Rules |
| `validate(input, schema)` | Run rules, collect **all** failures |
| `parseUser(input)` | Parse into a normalised, known-good shape |
| `parseConfig(env)` | Environment strings → typed config with defaults |
| `atBoundary(parse, handler)` | Parse once, hand the interior a proven value |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. Your `parseUser` returns a new object. What stops someone passing the raw
   input downstream anyway? Could you make that harder?
2. When is fail-fast right and collect-all wrong? Find a case in your own code.
3. Zod and Valibot do this for a living. Read Zod's `safeParse` signature — how
   close is it to lesson 03's Result?
