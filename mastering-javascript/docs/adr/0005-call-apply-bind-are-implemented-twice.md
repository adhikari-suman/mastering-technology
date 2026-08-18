# `call`, `apply` and `bind` are implemented twice in one Lesson

## Status

Accepted

## Context

Part 02 Lesson 03 has the learner implement the three explicit-binding
functions. There are two ways to shape that exercise:

- **Standalone functions** — `callWith(fn, thisArg, ...args)`. No prototype
  knowledge needed, but `this` never appears inside the implementation, so the
  exercise teaches argument plumbing rather than binding.
- **Prototype methods** — `Function.prototype.myCall`. This is how the real
  ones work, and `this` inside the method *is* the function being called, which
  is the insight worth having. But it needs prototypes, which are Part 03.

## Decision

Do both, in that order, in the same Lesson. Stage 1 is standalone so the
borrow-invoke-delete mechanism can be learned without prerequisites. Stage 2
re-implements the same three as non-enumerable properties on
`Function.prototype`, delegating to the stage 1 functions.

The Lesson also forbids using the real `call`, `apply` or `bind` anywhere in the
implementations, since delegating to them answers nothing.

## Consequences

Lesson 03 is the largest in the Part — 23 tests against a typical 15 — and it
previews prototypes before Part 03 formally introduces them. In exchange, Part
03 opens with `Function.prototype` already familiar rather than abstract.

A test asserts the added methods are non-enumerable, which forces
`Object.defineProperty` rather than plain assignment. That is the habit worth
building: a plain assignment to a built-in prototype leaks into every `for...in`
in the program.
