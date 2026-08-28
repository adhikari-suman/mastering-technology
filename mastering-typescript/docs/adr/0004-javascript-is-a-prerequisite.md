# JavaScript is a prerequisite, not a Part

## Status

Accepted

## Context

Most TypeScript teaching material is really JavaScript teaching material with
annotations, because most of its audience is learning both at once. That
audience isn't this one: the JavaScript curriculum next door is finished, all
eight Parts of it.

## Decision

No Lesson explains a JavaScript concept. Closures, `this`, prototypes,
promises, the event loop, the module graph and the iteration protocol are
assumed. Where a Lesson needs one, it links to the JavaScript Lesson that
covered it rather than restating it.

The curriculum is instead organised around the type system as its own subject:
reading types, narrowing them, parameterising them, computing them, and
configuring the thing that checks them.

## Consequences

This makes the curriculum steeper and shorter than a general-audience one, and
unsuitable to hand to someone who doesn't already have the JavaScript. That is
the intended trade.

It also means Part 05 (classes) and Part 07 (async, boundaries) can spend all
their time on typing rather than on semantics, which is why those Parts cover
`this` types and `Promise` variance rather than `this` binding and `await`.
