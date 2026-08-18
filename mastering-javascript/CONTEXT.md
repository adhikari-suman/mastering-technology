# Mastering JavaScript

An exercise-driven curriculum for learning JavaScript, worked as a personal
learning journal rather than a course handed to others.

## Language

### Curriculum structure

**Part**:
A numbered group of lessons covering one area of the language, e.g. Part 01 —
Fundamentals. The largest unit of the curriculum.
_Avoid_: Module, Chapter, Section, Unit

**Module**:
Reserved exclusively for the JavaScript meaning — an ESM file, the module
graph, `"type": "module"`. Never a curriculum unit.

**Lesson**:
A single numbered folder inside a Part, e.g. `05-arrays`. The smallest unit of
work, and the unit the tooling operates on.
_Avoid_: Chapter, Topic, Drill

### Lesson files

**Exercise**:
`exercise.js` — the stubs and the full spec in JSDoc. Never edited; it is the
reset point a Solution is copied from.
_Avoid_: Template, Starter, Boilerplate

**Solution**:
`solution.js` — the learner's own answers, written from scratch and committed.
The only file in the repo that is not regenerable.
_Avoid_: Answer, Answer key

### Lesson state

**Started**:
A Solution exists and differs from its Exercise — real work is in it.

**Untouched copy**:
A Solution exists but is byte-identical to its Exercise — copied, not begun.
Safe to discard.

**Missing**:
No Solution exists yet; the lesson has not been begun.
