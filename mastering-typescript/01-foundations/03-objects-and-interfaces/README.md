# 03 — Objects and interfaces

TypeScript's type system is **structural**: a type is a description of a shape,
and anything with that shape fits. There is no declaration linking a value to a
type, which is why you can pass an object literal to a function expecting an
`interface` you've never imported.

```ts
interface Named { name: string }
function greet(n: Named) { return `hi ${n.name}`; }

greet({ name: 'ada', age: 36 } as object as Named);  // fine — shape is what counts
greet(new Date());                                    // not fine — no `name`
```

Coming from Java or C#, this is the adjustment: `implements` is a *check*, not a
requirement. Part 07 covers getting nominal behaviour back when you need it.

## Excess property checking

Structural typing says extra properties are harmless — an object with more than
you asked for still has everything you asked for. So this is legal:

```ts
const user = { id: 1, name: 'ada', nickname: 'a' };
const n: Named = user;    // fine
```

But this isn't:

```ts
const n: Named = { id: 1, name: 'ada', nickname: 'a' };
//                                     ~~~~~~~~ Object literal may only specify known properties
```

The difference is **freshness**. An object literal written directly at an
annotation is "fresh", and freshness triggers an extra check that has nothing to
do with assignability — it exists purely to catch typos, because a literal
you're writing right now is one you meant to match the target exactly. Assign it
to a variable first and the freshness is gone.

This is the single most confusing rule for newcomers, and it is not a soundness
rule. It's a usability one.

## Optional, versus a property that may be undefined

These are different types, and under `exactOptionalPropertyTypes` they behave
differently:

```ts
interface A { email?: string }              // may be absent
interface B { email: string | undefined }   // must be present, may be undefined

const a: A = {};                             // fine
const b: B = {};                             // error — `email` is required
const a2: A = { email: undefined };          // error under exactOptionalPropertyTypes
```

Without the flag, `?` quietly means "or `undefined`", and `{ email: undefined }`
is accepted — which erases the difference between "no email" and "email
explicitly cleared". That difference matters the moment you `JSON.stringify` or
diff two objects, so this project keeps the flag on.

Reach for `?` when absence is meaningful. Reach for `| undefined` when the key
must always be there.

## `readonly`

A per-property modifier, checked only at compile time:

```ts
interface Config { readonly host: string }
```

It stops assignment through *that* type. It does not freeze the object, and it
does not propagate — `readonly user: User` protects the `user` binding, not
`user.name`. And because it is only a check, a `readonly` object is still
assignable to a mutable one in most positions. It's a guard rail, not a lock.

## Index signatures

For objects whose keys you don't know ahead of time:

```ts
interface Counts { [key: string]: number }
```

Two flags change how this behaves, and both are on here:

**`noUncheckedIndexedAccess`** adds `| undefined` to every read, because
`counts['nope']` really can be missing:

```ts
const n = counts['a'];   // number | undefined
```

That is simply the truth, and the flag's absence is the largest lie in the
default configuration.

**`noPropertyAccessFromIndexSignature`** requires bracket syntax for keys that
come from the index signature, keeping `counts.total` (a declared property)
visually distinct from `counts['total']` (a guess):

```ts
counts.a;      // error — `a` isn't declared
counts['a'];   // fine
```

`Record<K, V>` is the same thing with a nicer name, and lets you close the key
set: `Record<Role, number>` requires exactly the roles.

## What to build

| Export | What it is |
| --- | --- |
| `User` | `id`, `name`, and an *optional* `email` |
| `MaybeEmailUser` | The other spelling — `email` present, possibly `undefined` |
| `FrozenUser` | Every property of `User`, read-only |
| `Counts` | An index-signature type mapping `string` to `number` |
| `lookup` | A read that admits it can miss |
| `lookupOr` | The same read, with a fallback |
| `increment` | A non-mutating bump of one key |
| `rename`, `hasEmail` | Ordinary work on a `User` |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Write `const u: User = { id: 1, name: 'a', nickanme: '' }` and read the error.
   Now split it across two statements so it compiles. What did the checker stop
   protecting you from, and was it right to?
2. Is `readonly string[]` assignable to `string[]`? Is the reverse? Predict, then
   check, then explain which direction is the unsound one.
3. Under `noUncheckedIndexedAccess`, `for (const k of Object.keys(c)) c[k]` is
   still `number | undefined`. Is the checker wrong? What would it have to know?
4. `counts['a']` is `number | undefined`, but the *type* `Counts[string]` is
   plain `number`. The flag governs one and not the other. Once you've confirmed
   that, work out which of the two a `Partial<Counts>` would change.
5. When is `Record<string, number>` the wrong type for a lookup table, and what
   would you use instead?
