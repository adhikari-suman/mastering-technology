# Curriculum vocabulary lives at the repo root

## Status

Accepted. Supersedes the deferral in
[`mastering-javascript/docs/adr/0001`](../../mastering-javascript/docs/adr/0001-docs-live-inside-mastering-javascript.md).

## Context

That ADR put `CONTEXT.md` inside `mastering-javascript/` because JavaScript was
the only technology in the repo, and hoisting shared terms would have meant
designing a shared language against a sample size of one. It named the arrival
of a second technology folder as the moment to revisit.

`mastering-typescript/` is that second folder, and it uses Part, Lesson,
Exercise and Solution to mean exactly what they mean next door — along with the
three Lesson states the scripts in both folders compute identically.

## Decision

The terms genuinely shared by every curriculum move to a root `CONTEXT.md`.
Each technology folder keeps its own for what is specific to it: the reserved
meaning of "Module" in JavaScript, the two green lights and Type test in
TypeScript.

## Consequences

A third technology folder inherits the vocabulary rather than restating it, and
divergence in the shared terms becomes a root-level change that has to be
argued for.

The split is by *audience of the term*, not by file size. A term belongs at the
root only if changing it would change both curricula; anything else stays local
even when it looks generic.
