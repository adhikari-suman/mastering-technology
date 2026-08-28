# Domain docs live inside mastering-javascript, not at the repo root

## Status

Superseded by [`../../../docs/adr/0001`](../../../docs/adr/0001-curriculum-vocabulary-is-shared-at-the-root.md),
when `mastering-typescript/` arrived and the shared terms were hoisted as this
ADR anticipated.

The repository is named `mastering-technology` and is structured to hold one
folder per technology, but JavaScript is the only one that exists and the only
one being actively built. Its `CONTEXT.md` and ADRs therefore live at
`mastering-javascript/`, leaving the repo root bare, so that everything written
now is free to be JavaScript-specific rather than pre-emptively generalised for
technologies nobody has started.

## Considered options

Root-level `CONTEXT.md` + `docs/adr/` shared across all technologies. Rejected
for now: the curriculum vocabulary (lesson, exercise, solution) would genuinely
be shared by a future `mastering-python`, but hoisting it today means designing
that shared language against a sample size of one.

## Consequences

When a second technology folder lands, the curriculum-wide terms in
`mastering-javascript/CONTEXT.md` will need splitting out — into a root
`CONTEXT-MAP.md` plus per-technology contexts. This ADR is the marker for that
moment; it is a deferral, not a claim that the vocabulary is JavaScript-only.
