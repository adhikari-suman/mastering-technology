# 03 — Type predicates

Narrowing works on expressions the checker understands. A function call is not
one of them — the checker won't look inside `isString(x)` to see what it proves.
A type predicate is how you tell it what the call proves:

```ts
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

if (isString(x)) x.length;   // narrowed, because the signature said so
```

`value is string` replaces the `boolean` return type. It means "when this
returns `true`, treat the argument as `string`; when it returns `false`, remove
`string` from it."

## The thing to understand about them

**The body is not checked against the claim.** This compiles:

```ts
function isString(value: unknown): value is string {
  return typeof value === 'number';   // a lie, and tsc is fine with it
}
```

A predicate is an *assertion you are making*, in the same family as `as`. The
checker verifies that `string` is a plausible narrowing of `unknown` and then
takes your word for the rest. Every predicate you write is a small piece of
trusted code, and a wrong one produces exactly the class of runtime error the
type system is supposed to prevent — with the type system now vouching for it.

Write them small, write them obvious, and test them. The runtime tests in this
lesson exist because the type tests structurally cannot catch a lying predicate.

## Generic predicates

The most useful ones are generic, because they narrow *out* rather than *in*:

```ts
function isNonNull<T>(value: T | null | undefined): value is T {
  return value != null;
}

const found: string[] = maybeStrings.filter(isNonNull);
```

`filter` has an overload taking a predicate, which is why that line types
without a cast. Without the predicate you'd get `(string | null)[]` and a cast
on the next line.

## `this is T`

A method can narrow its own receiver:

```ts
class Box<T> {
  hasValue(): this is { value: T } { ... }
}
```

Useful for builders and optional-state classes. Part 05 Lesson 04 returns to it.

## Predicates versus `in` versus discriminants

Reach for a discriminant first — it needs no code and cannot lie. Reach for `in`
when the shapes differ but there's no tag. Reach for a predicate when the check
is genuinely a computation, or when you need to reuse it, or when you're
narrowing `unknown` at a boundary.

## What to build

| Export | What it does |
| --- | --- |
| `isString`, `isNumber` | The primitive narrowings, as reusable predicates |
| `isNonNull` | Generic — removes `null` and `undefined`, keeps `T` |
| `isRecord` | `unknown` → an object you can index, without lying about the values |
| `hasKey` | `unknown` → an object known to carry one named key |
| `isArrayOf` | An array whose every element passes a supplied predicate |
| `compact` | `isNonNull` put to work through `filter` |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Make `isString` return `typeof value === 'number'`. Which light goes red —
   and what does that tell you about which one is checking your reasoning?
2. Why is `isRecord` typed `Record<string, unknown>` rather than
   `Record<string, any>` or `object`? Try all three and see what each lets you do next.
3. `isArrayOf` on a large array is O(n). When is that the wrong trade, and what
   would you do instead at a real boundary?
4. What does `isNonNull` narrow to in the `false` branch? Predict, then check,
   then explain why it isn't `null | undefined`.
