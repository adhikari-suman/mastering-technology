# 01 — Why `as` lies

Types are erased. At every edge of your program — a network response, a file, an
environment variable, a message from another worker — the type is a claim nobody
checked. `as` is how you make that claim without checking it.

```ts
const user = await res.json() as User;
```

That line does nothing at runtime. `res.json()` returns whatever the server
sent; `as User` is a note to the compiler saying "stop asking." If the server
changed a field last Tuesday, every downstream `user.email.toLowerCase()` is a
crash, and the type system is now vouching for it.

## What `as` actually does

It changes how the checker treats an expression, subject to one weak rule: the
two types must be *comparable* — one assignable to the other, in either
direction. So this is rejected:

```ts
const n = 'a' as number;    // error: neither is assignable to the other
```

and this is not:

```ts
const n = 'a' as unknown as number;   // fine. Any two types via unknown.
```

The double assertion is the tell. Once you've written `as unknown as`, the
checker has told you these types have nothing to do with each other and you have
overruled it.

## The other three ways to say the same thing

| Form | What it claims |
| --- | --- |
| `x as T` | this expression is a `T` |
| `<T>x` | the same, older syntax, ambiguous in `.tsx` |
| `x!` | this is not `null` or `undefined` |
| `value is T` (predicate) | when this returns true, treat it as `T` |
| `asserts value is T` | if this returns, it's a `T` |

All five are unchecked. The last two are better only because the check is *right
there* in the function body where a reader can see it — nothing verifies it.

## Where `as` is legitimate

Not never. Three cases:

**Narrowing a literal you just wrote.** `{} as Record<string, number>` when
building an accumulator — you know the invariant because you're three lines from
establishing it. Part 03 hit this repeatedly.

**`as const`.** A different operator that happens to share the keyword. It
widens nothing and asserts nothing.

**Bridging a genuinely-unrepresentable relationship.** Some type-level facts
can't be expressed — a mapped type the checker can't prove preserves a
constraint, for instance. Comment it.

The test: *could this be wrong at runtime, and would anything notice?* If yes,
it needs a check, not an assertion.

## What honest looks like

```ts
function toUser(value: unknown): User {
  if (!isRecord(value)) throw new ParseError('not an object');
  const { id, email } = value;
  if (typeof id !== 'number') throw new ParseError('id must be a number');
  if (typeof email !== 'string') throw new ParseError('email must be a string');
  return { id, email };
}
```

Twelve lines instead of five characters, and the failure arrives at the boundary
with the field name in it rather than three frames deep as
`Cannot read properties of undefined`. Lesson 02 makes this composable so you
stop writing it by hand.

## What to build

| Export | What it is |
| --- | --- |
| `ParseError` | Carries which field failed |
| `parseUser` | The honest version — validate, then return |
| `unsafeParseUser` | The `as` version, kept so a test can prove it lies |
| `assertUser` | The assertion-function spelling of the same check |
| `isUser` | The predicate spelling |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. `unsafeParseUser` and `parseUser` have identical signatures. Write the input
   that makes one throw and the other return a lie. Which light caught it?
2. `x!` and `assert(x !== null)` produce the same type. Name every difference
   that matters at 3am.
3. Search a codebase you work on for `as unknown as`. For each one, decide
   whether it's a bridge or a bug.
4. `JSON.parse` returns `any` in the standard library. What would break if it
   returned `unknown`, and would that breakage be a bad thing?
