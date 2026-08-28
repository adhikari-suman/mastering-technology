# Mastering TypeScript

An exercise-driven curriculum for learning TypeScript, worked as a personal
learning journal rather than a course handed to others. It assumes JavaScript is
already fluent and teaches only what TypeScript adds.

The curriculum-wide vocabulary — Part, Lesson, Exercise, Solution, and the three
lesson states — is defined once at [`../CONTEXT.md`](../CONTEXT.md). This file
holds only the terms specific to TypeScript.

## Language

### Verification

**Green light**:
One of the two independent verdicts on a Lesson. There are exactly two, and a
Lesson is done only when both are green.
_Avoid_: Check, Pass (unqualified — always say which light)

**TYPES**:
The `tsc --noEmit` verdict. Covers the Type tests and the annotations in the
Solution itself.

**RUNTIME**:
The `node --test` verdict. Node erases types without checking them, so this
light says nothing about whether the types are right.

**Type test**:
An assertion that fails by not compiling, written as
`type _ = Expect<Equal<A, B>>` or as a `@ts-expect-error` directive. Lives in
`exercise.test.ts` alongside the runtime tests.
_Avoid_: Type assertion — that phrase means `as` in TypeScript, which is a
different thing entirely and one the curriculum spends a Lesson warning about.

**Scope**:
The subset of Lessons a command acts on, inferred from the directory it was
typed in or given as a filter. `tsc` is driven by a tsconfig rather than a file
list, so a scoped run generates `.tsconfig.scope.json` and deletes it after.

### Files

**Exercise**:
`exercise.ts`. Type stubs in it are written as `unknown` and function stubs
`throw`, so the pristine file always compiles and every stub is independent —
filling one in never breaks another.

**Type-only block**:
The section of a test file holding assertions that need a value to point at.
It is a function that is never called, because `@ts-expect-error` silences the
checker but leaves the line as real code that Node would still run.

**`type-tests.ts`**:
The assertion kit — `Equal`, `Expect`, `IsNever` and friends — shared by every
Lesson. Handed over on day one and rebuilt from scratch in Part 04.

**Fixture**:
A file under a Lesson's `fixtures/`, shipped by the scaffold and imported by the
Exercise or the test. Used where a single file cannot carry the lesson: real ESM
and CommonJS modules in Part 06, an untyped library to describe from outside,
and Part 05's decorator syntax that `tsc` checks and Node never loads.
_Avoid_: Helper, Support file
