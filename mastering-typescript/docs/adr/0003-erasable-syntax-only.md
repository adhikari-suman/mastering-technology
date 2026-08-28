# `erasableSyntaxOnly` is on, so `enum` and friends are unwritable

## Status

Accepted

## Context

Node executes `.ts` by deleting type syntax, which only works if every
TypeScript-only construct in the file *is* type syntax. Four are not: `enum`,
`namespace` with a runtime body, parameter properties (`constructor(private x)`),
and legacy experimental decorators. Each emits real JavaScript, so Node's
stripper refuses the file rather than silently producing something wrong.

`erasableSyntaxOnly` makes tsc reject them too, at the declaration rather than
at the point of confusion.

## Decision

Keep the flag on for the whole curriculum. The constructs it bans are taught,
but as *reading* rather than as writing: Part 01 Lesson 02 explains why a union
of literals beats an `enum`, and Part 06 Lesson 06 covers the emit behaviour
that makes them unerasable.

## Consequences

Part 05 has to teach classes without parameter properties, which is a real cost
— the shorthand is idiomatic in a lot of TypeScript the learner will read. It is
paid deliberately: writing the assignments out is a fair price for never having
a Lesson whose stubs won't run.

If a future Lesson genuinely needs one of the four, it gets its own tsconfig
turning the flag off, and its runtime light needs
`node --experimental-transform-types`. Don't turn the flag off globally to make
one Lesson easier.
