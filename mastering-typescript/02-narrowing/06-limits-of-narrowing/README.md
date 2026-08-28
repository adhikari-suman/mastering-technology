# 06 — The limits of narrowing

Control-flow analysis is a static approximation of a dynamic language. Knowing
where the approximation stops — and where it deliberately overshoots — is what
stops you writing `as` out of frustration.

Every claim below was checked against the compiler this project pins. Don't take
them on faith; the "Going deeper" questions are there to make you re-derive them.

## Aliased conditions

Since TypeScript 4.4, storing a guard in a variable still narrows:

```ts
function f(v: string | number) {
  const isStr = typeof v === 'string';
  if (isStr) v.length;              // narrowed
}
```

The condition has to be stored in a variable the checker can prove is constant.
`const` qualifies. So does a `let` that is never written to anywhere in the
function — the analysis is about assignment, not about the keyword.

## One assignment poisons the whole function

This is the rule people find least intuitive:

```ts
function f(v: string | null) {
  let x = v;
  if (x !== null) {
    const g = () => x.length;       // ERROR — x is string | null in here
  }
  x = null;                         // ...because of THIS, further down
}
```

Delete the last line and the closure narrows fine. The checker asks "is `x` ever
assigned after its declaration?" over the entire function, not "has it been
assigned yet at this point", because it cannot know when the closure runs. A
write that happens later, or in a branch never taken, counts the same.

Outside a closure the narrowing does hold up to the assignment and resets after
it. It is specifically *captured* variables that need the stronger guarantee.

## Element access

`xs[i]` narrows, provided `i` is effectively constant:

```ts
function f(xs: (string | undefined)[], i: number) {
  if (xs[i] !== undefined) {
    const got = xs[i];              // string
  }
}
```

Reassign `i` anywhere in the function and both reads go back to
`string | undefined`. Same rule as above, same reason.

This is also, quietly, unsound: nothing stops the array being mutated between
the two reads. Which brings us to the real point.

## Property narrowing outlives function calls — on purpose

```ts
function f(o: { a: { b?: string } }) {
  if (o.a.b !== undefined) {
    sideEffect();                   // could set o.a.b = undefined
    o.a.b.length;                   // still `string`. No error.
  }
}
```

The checker does not invalidate property narrowing when an opaque call happens
in between, even though the call could plainly have written to the object. This
is a deliberate unsoundness: invalidating on every call would make narrowed
property access nearly unusable, and the bug it prevents is rare in practice.

Recognise it for what it is — a place where the type system has chosen ergonomics
over correctness, and where a genuine mutation bug will not be caught. Part 08
Lesson 02 collects the rest of these.

## Type queries don't always follow the flow

A `typeof` in *type* position reads the declared type of an optional property
path rather than the narrowed one. When you want to assert about a narrowed
value, bind it first:

```ts
const got = o.a.b;                  // narrowed
type T = typeof got;                // and now the query sees it
```

The tests in this Lesson do exactly that, which is why they all go through
locals.

## What to build

| Export | What it does |
| --- | --- |
| `pick` | An element read that survives `noUncheckedIndexedAccess` |
| `makeGreeter` | A closure over a narrowed value — the assignment rule, felt |
| `describeServer` | Optional chaining down a nested config |
| `totalKnown` | An aliased condition doing real work |
| `firstPresent` | Index-signature reads across a list of candidate keys |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. In `makeGreeter`, add `name = null` as the last statement of the function.
   Which line breaks, and why is it not the line you changed?
2. Write the mutation bug the property-narrowing section describes, run it, and
   watch it throw with both lights green. Was TypeScript wrong to allow it?
3. Change `pick`'s index parameter to be reassigned inside the function. Predict
   the new error before you look.
4. Is there any way to get the checker to re-verify a narrowing after a call,
   short of re-checking by hand? What would that feature cost?
