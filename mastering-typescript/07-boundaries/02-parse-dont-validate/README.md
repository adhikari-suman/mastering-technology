# 02 — Parse, don't validate

A *validator* answers yes or no and hands the value back unchanged. A *parser*
returns a new value whose type carries what was learned. The difference is
whether the knowledge survives the function call.

```ts
function validate(x: unknown): boolean   // caller still holds an unknown
function parse(x: unknown): User         // caller holds a User
```

With a validator you check, then cast, and the cast is unchecked — so the check
and the claim can drift apart. With a parser they cannot: the return type *is*
the claim, and the body is what earns it.

The slogan is Alexis King's, and the point generalises past types: push
uncertainty to the edges and let the interior be certain.

## Building it from combinators

Writing `parseUser` by hand once is instructive (Lesson 01). Writing forty of
them is how boundaries stop getting written. The fix is a small combinator
library where each parser knows its own output type:

```ts
type Parser<T> = (value: unknown, path: string) => T;

const string: Parser<string> = ...;
const number: Parser<number> = ...;
const object = <S extends Record<string, Parser<unknown>>>(shape: S) => ...;
```

Then a schema is a value, and its type falls out:

```ts
const userParser = object({ id: number, email: string });
type User = Infer<typeof userParser>;   // { id: number; email: string }
```

**One source of truth.** The schema is the runtime check *and* the type. They
cannot disagree, because one is derived from the other. That is the whole
argument for Zod, Valibot, ArkType and everything like them, and it's worth
building the two-hundred-byte version so the libraries stop being magic.

## `Infer` is a conditional type

```ts
type Infer<P> = P extends Parser<infer T> ? T : never;
```

Everything from Part 04 shows up: `infer` to extract, a mapped type to walk the
shape, and optionality expressed by remapping keys. The `object` combinator's
return type is where the real work is:

```ts
Parser<{ [K in keyof S]: Infer<S[K]> }>
```

A mapped type over the schema object, each value replaced by what its parser
produces.

## Error paths

A parser nested three levels deep needs to say *where* it failed. Thread a path
string through every call and append at each step:

```
user.addresses.0.postcode: expected string
```

That one string is the difference between a usable boundary and a support
ticket. It costs one parameter.

## What to build

| Export | What it is |
| --- | --- |
| `Parser<T>` | The one-function interface everything else is built from |
| `Infer<P>` | The type a parser produces |
| `string`, `number`, `boolean` | The leaves |
| `optional`, `array`, `object` | The combinators |
| `ParseError` | Carrying the path |
| `parse` | Run a parser at the root |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. `Infer<typeof userParser>` and the hand-written `User` must be the same type.
   What would it take for them to drift? Try to make it happen.
2. `optional` has to make the KEY optional, not just the value type. Which Part
   04 mechanism does that, and what does the naive version get wrong under
   `exactOptionalPropertyTypes`?
3. Add a `union` combinator. What does its `Infer` look like, and where does the
   error message go when every branch fails?
4. This collects the first error and stops. Real validators collect all of them.
   What changes in `Parser<T>`'s signature, and what does that cost every leaf?
