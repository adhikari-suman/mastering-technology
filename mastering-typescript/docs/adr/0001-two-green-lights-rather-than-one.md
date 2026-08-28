# A Lesson passes on two independent lights, not one

## Status

Accepted

## Context

The JavaScript curriculum has one verdict per Lesson: `node --test` is green or
it isn't. TypeScript does not fit that shape. Node 24 runs `.ts` files by
*erasing* types rather than checking them, so the runtime tests pass or fail
without reference to whether a single annotation is correct. Meanwhile most of
what a TypeScript Lesson teaches is only observable to the compiler.

## Decision

`npm test` runs both `tsc --noEmit` and `node --test`, reports them as two
separately-labelled lights, and fails if either does. `npm run types` and
`npm run run-tests` isolate them.

## Consequences

The split is presented to the learner as subject matter rather than as tooling
detail, because the state it makes visible — RUNTIME green, TYPES red — is the
central fact about TypeScript: the code does one thing and its description says
another. Collapsing the two into a single pass/fail would hide exactly the
signal the curriculum exists to teach.

`tsc` is driven by a tsconfig rather than a file list, so scoping a run to one
Lesson means generating `.tsconfig.scope.json` at the package root (where its
relative paths resolve) and removing it afterwards. That file is gitignored and
must not be hand-edited.

Lessons with no `solution.ts` are excluded from the scope rather than reported
as failures. Unlike the JavaScript scaffold, a test file here imports its
Solution statically — type tests need static imports — so an unstarted Lesson
would otherwise produce module-resolution noise in both lights.
