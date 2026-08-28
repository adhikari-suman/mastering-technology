# Negative type assertions live inside a function that is never called

## Status

Accepted

## Context

`@ts-expect-error` silences the *checker*. It does not remove the line, which is
still executable JavaScript after erasure. A test file containing

```ts
// @ts-expect-error - a void result has no properties
runAll([]).toString();
```

passes TYPES and crashes RUNTIME on module load, taking every unrelated test in
the file with it. The same is true of `declare const x: T` followed by a use:
`declare` erases to nothing, so the use is a `ReferenceError`.

Both were written into the first draft of Part 01 and both were caught only by
running it.

## Decision

Every assertion that is an executable statement — anything under a
`@ts-expect-error`, and anything needing a typed binding to point at — goes
inside a function that is never called. Typed bindings come from the function's
*parameters* rather than from `declare const`.

Assertions that are pure `type` aliases stay at module scope, since they erase
completely.

## Consequences

Test files gain a `_typeOnly(...)` function whose parameters look arbitrary
until you know why. It is commented in every file, and the convention is named
in `CONTEXT.md` as the Type-only block.

A related trap, worth stating because it looks like the same thing and isn't:
`noUncheckedIndexedAccess` rewrites *element access expressions*, not
indexed-access *types*. `counts['a']` is `number | undefined` while
`Counts[string]` stays `number`. Assertions about that flag must therefore be
made about a local bound to an expression — which they can only be inside a
function anyway.
