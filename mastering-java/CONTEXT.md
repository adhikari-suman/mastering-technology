# Mastering Java

An exercise-driven curriculum for learning Java, worked as a personal learning
journal rather than a course handed to others. It assumes programming fluency
and no Java.

The curriculum-wide vocabulary — Part, Lesson, Exercise, Solution, and the three
lesson states — is defined once at [`../CONTEXT.md`](../CONTEXT.md). This file
holds only the terms specific to Java; the decisions behind them are argued in
[`docs/adr/`](docs/adr/).

## Language

**Module**:
Reserved exclusively for the Java meaning — a JPMS module, `module-info.java`,
the module path. Never a curriculum unit; that is a Part.
_Avoid_: using it for Part, or for a source file.

**Class file**:
The `.class` artifact `javac` emits, never the `.java` source. When you mean the
source, say Exercise, Solution, or source file.

### Verification

**Green**:
A Lesson whose tests all pass. Java has one light, not two — unlike
[`../mastering-typescript`](../mastering-typescript/CONTEXT.md), where TYPES and
RUNTIME fail independently. Here the compiler runs first and nothing executes
until it is satisfied, so a type error is a red Lesson, not a separate verdict.

**Red**:
Either a compile failure or a failing assertion. `mj` prints `COMPILE FAILED`
for the first, because the distinction matters while you're working even though
it doesn't change the verdict.

**Skipped**:
A Lesson with no `Solution.java`. Not a failure — a Lesson you have not opened.

### Files

**`Exercise.java`**:
The pristine stub. Declares `class Solution`, package-private, which is legal
because Java only ties *public* types to filenames. That is what makes `cp` the
whole setup step. Never edited.

**`ExerciseTest.java`**:
The spec, executable. Declares `class ExerciseTest`. JUnit 5 (Jupiter), run
through the console launcher. Never edited.

**`Solution.java`**:
The learner's own answers. The only file in the Lesson that is not regenerable.

**`support/`**:
Optional per-Lesson folder of extra types the learner does not write — fixtures,
a pre-provided interface, a resource to load. Compiled automatically.

**`java.flags`**:
Optional per-Lesson file, one flag per line, passed to both `javac` and `java`.
Exists for the Lessons that need `--enable-preview`. Kept rare on purpose:
preview class files bind to the exact JDK that compiled them.

### Tooling

**`mj`**:
The single entry point — `doctor`, `setup`, `status`, `test`, `watch`, `reset`,
`clean`. Written in bash rather than Java because its first job is to tell you
your JDK is the wrong version, which it cannot do if it needs that JDK to run.
Targets bash 3.2, the version macOS ships.

**Scope**:
The subset of Lessons a command acts on, inferred from the directory it was
typed in or given as a filter — the same rule as the sibling curricula.
