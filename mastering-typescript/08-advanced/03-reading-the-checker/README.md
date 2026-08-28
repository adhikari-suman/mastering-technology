# 03 — Reading the checker

TypeScript's errors are long because the types are. The skill is not patience —
it's knowing which three lines of a forty-line message carry the information.

## The anatomy of an assignability error

```
Type 'A' is not assignable to type 'B'.
  Types of property 'x' are incompatible.
    Type 'C' is not assignable to type 'D'.
      Type 'string' is not assignable to type 'number'.
```

Read it **bottom-up**. The last line is the actual mismatch; everything above is
the path the checker took to reach it. `A`/`B` tell you *where* the error is,
the deepest line tells you *what* is wrong, and the property names in between
tell you *how to get there*.

For a big error, delete the middle. Line one and the last line usually contain
the whole problem.

## The messages worth recognising on sight

| Message | What it actually means |
| --- | --- |
| `Object literal may only specify known properties` | Freshness. Assign through a variable and it goes away. |
| `Type 'X' is not assignable to type 'never'` | An exhaustiveness check caught a case you didn't handle. |
| `Type instantiation is excessively deep` | A recursive type isn't tail-recursive, or has no base case. |
| `... is not assignable to ... Two different types with this name exist` | Two copies of a package in `node_modules`. |
| `Property 'x' does not exist on type 'never'` | Narrowing eliminated every member — usually a wrong discriminant. |
| `Argument of type 'X' is not assignable to parameter of type 'never'` | Inference found no candidates. Often a missing constraint. |
| `Excessive stack depth comparing types` | Two mutually recursive types, comparing forever. |

## `--noErrorTruncation`

By default, tsc replaces long types with `...` at around 160 characters. That
elision lands exactly where the useful part is, most of the time:

```
Type '{ a: string; b: number; c: ... 12 more ...; }' is not assignable to ...
```

`tsc --noErrorTruncation` prints the whole thing. Turn it on the moment an error
is unreadable; nobody sets it permanently because the output is enormous.

## The minimal repro

The one technique that works on everything. Copy the failing expression into a
scratch file and delete, in this order:

1. every unrelated import
2. every generic parameter, replaced with a concrete type
3. every branch not on the path

If it stops erroring, the last deletion mattered — put it back and delete
elsewhere. Ten minutes of this beats an hour of staring, and the result is
either an understanding or a bug report.

## Hovering is a debugger

Intermediate types are the thing to inspect, not the final error. Bind the
subexpressions:

```ts
const step1 = parse(input);      // hover: what did this actually produce?
const step2 = transform(step1);  // hover: and this?
```

The `Simplify<T>` trick from Part 07 Lesson 02 exists for this: it flattens an
intersection into one object so the tooltip is readable.

## What to build

An error-message reader — the thing you do in your head, made explicit.

| Export | What it is |
| --- | --- |
| `Diagnostic` | A message plus its nested causes |
| `parseDiagnostic` | Indented tsc output into that tree |
| `rootCause` | The deepest line — what is actually wrong |
| `pathTo` | The property names between the top and the bottom |
| `summarise` | Top line plus root cause, which is usually the whole story |
| `classify` | Recognise the messages in the table above |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Cause a `not assignable to type 'never'` error on purpose, three ways. What
   do they have in common?
2. Take the longest error you can produce and run `summarise` on it by hand.
   Did you lose anything you needed?
3. `--noErrorTruncation` exists because the default elision is unhelpful. What
   would a better default look like — what should it elide?
4. Write down the last TypeScript error that cost you more than ten minutes.
   Which line of it did you eventually need?
