# Mastering technology

One folder per technology, each an exercise-driven curriculum worked as a
personal learning journal rather than a course handed to others.

This file holds the vocabulary shared by all of them. Terms specific to one
technology live in that folder's own `CONTEXT.md`:

- [`mastering-javascript/CONTEXT.md`](mastering-javascript/CONTEXT.md)
- [`mastering-typescript/CONTEXT.md`](mastering-typescript/CONTEXT.md)

## Language

### Curriculum structure

**Part**:
A numbered group of Lessons covering one area of a technology, e.g. Part 01 —
Fundamentals. The largest unit of a curriculum.
_Avoid_: Module, Chapter, Section, Unit

**Lesson**:
A single numbered folder inside a Part, e.g. `05-arrays`. The smallest unit of
work, and the unit the tooling operates on.
_Avoid_: Chapter, Topic, Drill

### Lesson files

**Exercise**:
The pristine stub file — `exercise.js`, `exercise.ts`. Carries the full spec in
JSDoc and never contains a worked implementation. Never edited; it is the reset
point a Solution is copied from.
_Avoid_: Template, Starter, Boilerplate

**Solution**:
The learner's own answers, written from scratch and committed. The only file in
the repo that is not regenerable.
_Avoid_: Answer, Answer key

### Lesson state

**Started**:
A Solution exists and differs from its Exercise — real work is in it.

**Untouched copy**:
A Solution exists but is byte-identical to its Exercise — copied, not begun.
Safe to discard.

**Missing**:
No Solution exists yet; the Lesson has not been begun.
