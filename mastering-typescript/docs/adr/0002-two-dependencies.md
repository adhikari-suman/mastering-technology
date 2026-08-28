# Two dependencies: the compiler and Node's types

## Status

Accepted

## Context

The JavaScript curriculum ships zero dependencies. TypeScript cannot: type
checking requires the compiler. The question is only how many *more* than one.

The obvious candidates were a test framework with type-level assertions
(`vitest` + `expect-type`, or `tsd`) and a runner (`tsx`, `ts-node`).

## Decision

`typescript` and `@types/node`, and nothing else. Node's built-in test runner
executes the `.ts` files directly; the type-assertion kit is thirty lines in
`type-tests.ts`.

## Consequences

`@types/node` is not optional despite looking like it — without it `"types":
["node"]` fails outright, and every `import 'node:test'` is unresolved.

Rejecting `expect-type` costs the nicer `expectTypeOf(x).toEqualTypeOf<Y>()`
surface and its better failure messages: a failed `Expect<Equal<A, B>>` reports
only `Type 'false' does not satisfy the constraint 'true'`, which names neither
side. That is accepted, because the alternative hides `Equal` behind a library
at exactly the point where Part 04 asks the learner to write it — and because
decoding an unhelpful checker error is itself Part 08 Lesson 03.

Node's type stripping is what removes the need for a runner. It also constrains
what the curriculum may use; see ADR 0003.
