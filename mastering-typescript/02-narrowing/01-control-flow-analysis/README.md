# 01 — Control-flow analysis

The checker does not assign one type to a variable. It assigns a different type
to that variable at every point in the program, by walking the control-flow
graph and applying whatever each branch proved. That walk is control-flow
analysis, and understanding it is the difference between fighting the checker
and steering it.

```ts
function f(value: string | number) {
  value;                      // string | number
  if (typeof value === 'string') {
    value;                    // string      — the `if` proved it
  } else {
    value;                    // number      — the `else` proved the negation
  }
  value;                      // string | number  — the branches rejoined
}
```

## What counts as proof

| Guard | Narrows |
| --- | --- |
| `typeof x === 'string'` | primitives, plus `'object'`, `'function'`, `'undefined'` |
| `x === null`, `x == null` | `null`, and with `==` also `undefined` |
| truthiness: `if (x)` | removes `null`, `undefined`, `''`, `0`, `NaN`, `false` |
| `'key' in x` | union members that declare `key` |
| `x instanceof C` | to `C`, using its `prototype` property type |
| `Array.isArray(x)` | a built-in type predicate |
| `x.kind === 'a'` | a union by its literal-typed discriminant |

Truthiness is the one that bites. `if (count)` excludes `0` as well as
`undefined`, so a legitimately zero value takes the wrong branch — a JavaScript
bug the type system will happily agree with, because `0` really was excluded.
When you mean "present", write `!== undefined`.

## Narrowing is a fact about a *point*, not about a variable

Anything the checker can't follow throws the proof away:

```ts
function f(value: string | null) {
  if (value === null) return;
  value;                       // string
  value = maybeNull();
  value;                       // string | null   — reassignment resets it
}
```

The two cases that surprise people:

**Callbacks.** A narrowing established outside a function does not hold inside
it, because the checker cannot know when the callback runs:

```ts
function f(value: string | null) {
  if (value === null) return;
  return () => value.length;   // fine — `value` is a const-like parameter never reassigned
}
```

That one *does* work, because the checker proves `value` is never reassigned. Make
it a `let` that is written to anywhere and the narrowing disappears inside the
closure. Lesson 06 is about exactly where the line falls.

**Properties.** `obj.a` narrows, but any call in between invalidates it, since
the call could have written to `obj`.

## `unknown` and the two-step

`typeof x === 'object'` includes `null`, so narrowing an `unknown` to a record
is always two checks and never one:

```ts
if (typeof x === 'object' && x !== null && 'id' in x) { /* x is object with id */ }
```

Writing that out by hand every time is why Lesson 03 exists.

## What to build

| Export | What it does |
| --- | --- |
| `classify` | Name the kind of a value, by narrowing rather than casting |
| `describeInput` | Handle a `string \| number \| null`, with `0` and `''` treated as real values |
| `firstNonEmpty` | The first non-empty string in a list of maybe-strings |
| `readLength` | The length of an `unknown` that might be a string or an array |
| `getIn` | Read a key off an `unknown`, using `in` |
| `toMessage` | Turn `Error \| string \| number` into a string, via `instanceof` |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Rewrite `describeInput` using `if (value)` instead of an explicit check.
   Which test breaks, and would you have caught it in review?
2. `typeof null` is `'object'`. Whose bug is that, and which of the two systems
   in this file — the checker or the runtime — could still fix it?
3. Why does `x == null` narrow away both `null` and `undefined` while
   `x === null` narrows away only one? Is the loose operator the right tool here?
4. Add `value = 3` inside the `typeof value === 'string'` branch of a function
   and hover `value` after it. Explain the type you get.
