# 04 — Assertion functions

A type predicate narrows in a branch. An assertion function narrows *everything
after the call*, by promising it throws otherwise:

```ts
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') throw new TypeError('not a string');
}

function f(x: unknown) {
  assertIsString(x);
  x.length;              // string, from here to the end of the scope
}
```

The `asserts` form says: if this returns at all, the claim holds. The checker
takes that literally — code after the call is analysed as though the narrowing
happened, because the only other way out was an exception.

## Two forms

```ts
function assert(condition: unknown): asserts condition;          // narrows the condition
function assertIsString(v: unknown): asserts v is string;        // narrows a parameter
```

The bare `asserts condition` form is the one you'll use most, because it
composes with any expression the checker can already narrow:

```ts
assert(typeof x === 'string');
x.length;    // narrowed, without a dedicated assertIsString
```

## The annotation rule that catches everyone

An assertion function needs an **explicit type annotation on its declaration**.
This is an error:

```ts
const assert = (condition: unknown): asserts condition => { ... };
//    ~~~~~~ Assertions require every name in the call target to be declared
//           with an explicit type annotation.
```

The reason is real rather than arbitrary. `asserts` changes control-flow
analysis at the *call site*, so the checker has to know the assertion signature
from the identifier alone, without inferring it from an initialiser. A
`function` declaration is fine. A `const` needs the type written out:

```ts
const assert: (condition: unknown) => asserts condition = (condition) => { ... };
```

Function declarations are the sane choice, and are what this Lesson uses.

## `asserts` and `never` are the same idea from two directions

`fail(): never` says "control does not continue past here." `assert(c): asserts c`
says "control continues only if `c`." Both work by pruning the control-flow
graph, and both are annotations the checker cannot verify — an assertion
function whose body forgets to throw silently poisons everything after every
call to it.

## Where they earn their place

At boundaries, and in invariants:

```ts
const el = document.getElementById('root');
assert(el !== null, 'missing #root');
el.append(...);                            // no `!`, no `as`
```

That is the honest replacement for the non-null assertion `!`. It costs one
runtime check and buys you an error message at the point of failure instead of
a `TypeError: null is not an object` three frames away.

## What to build

| Export | What it does |
| --- | --- |
| `assert` | The bare form — narrows any condition, throws with a message |
| `assertIsString`, `assertIsNumber` | The typed forms, for `unknown` at a boundary |
| `assertDefined` | Generic — strips `null` and `undefined`, names the value it checked |
| `AssertionError` | The error class all of them throw |
| `parsePort` | The four of them put to work on a real input |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Rewrite `assert` as `export const assert = (...) => {...}` and read the
   error. Then fix it with an explicit annotation. Why does the checker need
   that, when it happily infers everything else?
2. Delete the `throw` from `assertDefined` so it always returns. Which light
   catches it? What does that tell you about where assertion functions sit on
   the trusted/checked line?
3. `assert(x !== null)` versus `x!`. Both get you the same type. Name three
   differences that matter in production.
4. Can an assertion function be `async`? Work out what would go wrong before
   you try it.
