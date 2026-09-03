# Mastering Java

Exercise-driven, and built on the assumption that you already program. Nothing
here re-teaches loops or functions — that's what `../mastering-javascript` was
for. This curriculum is about what Java does differently: a static nominal type
system, real threads over shared memory, and a platform that has been keeping
its promises since 1995.

Every lesson is a folder with three files, plus one you make yourself:

| File                | What it is                                                        |
| ------------------- | ----------------------------------------------------------------- |
| `README.md`         | The concept, the traps, and a checklist of what to build           |
| `Exercise.java`     | Stubs + the full spec in javadoc. **Never edited** — your reset point |
| `ExerciseTest.java` | The spec, executable. Red until you implement. Don't edit.         |
| `Solution.java`     | ⬅ **you create this**, by copying `Exercise.java`. Your answers go here |

One dependency: the JUnit console launcher, a single jar that `./mj` fetches for
you. No Maven, no Gradle, no build file.

## Java version

**Temurin JDK 25** — the LTS released September 2025, and the version every
lesson is written against.

```bash
sdk env install     # SDKMAN, reads .sdkmanrc
sdk env             # switch to it, any time after
```

or `brew install --cask temurin@25`. Then:

```bash
./mj doctor         # confirms the JDK and the JUnit jar
```

25 rather than 21 because the things that make modern Java pleasant are only
*final* here: compact source files and instance `main` methods (JEP 512), module
import declarations (JEP 511), flexible constructor bodies, and `ScopedValue`.
Together with records, sealed types, pattern matching and virtual threads from
21, they are most of what this curriculum teaches.

Two features are still **preview** in 25 and are deliberately fenced off:
`StructuredTaskScope` and primitive types in patterns. Exactly one lesson uses
one, and it carries a `java.flags` file saying so — preview class files bind to
the exact JDK that compiled them, which is not a cost worth paying across
forty-eight lessons.

## How to work

Work one lesson at a time, from inside its folder:

```bash
cd 01-foundations/01-values-and-types
cp Exercise.java Solution.java   # your working copy, once per lesson
../../mj watch                   # the main loop; re-runs on save
```

`./mj` scopes itself to wherever you run it from: inside a lesson it acts on
that lesson, inside a Part on that Part, at the root on all forty-eight. To
target something from elsewhere, name it: `./mj test 05-errors`.

The tests compile against `Solution.java`, so until you make that copy the
lesson is skipped rather than reported red — a lesson you haven't opened is not
a failure.

### Why the stub file declares `class Solution`

`Exercise.java` contains `class Solution`, which looks wrong and isn't. Java
only requires a **public** type to match its filename; a package-private one can
live in a file of any name. That is what makes `cp Exercise.java Solution.java`
the entire setup step — the copy lands as `Solution.java` holding
`class Solution`, exactly what the compiler wants, with nothing to rename.

Lessons live in the **default package**, because folder names like
`01-foundations` aren't legal Java identifiers and so can't mirror a package.
Each lesson compiles alone into `.build/`, so forty-eight classes all called
`Solution` never meet.

## Managing your solution files

```bash
./mj setup     # create Solution.java wherever it's missing
./mj status    # which lessons are started / untouched / not begun
./mj test      # compile and run
./mj watch     # the same, re-run on save
./mj reset     # restore Solution.java from Exercise.java   (destructive)
./mj clean     # delete Solution.java                       (destructive)
```

Each takes an optional filter that substring-matches the lesson path:

```bash
./mj test 04-collections-and-streams
./mj reset 01-foundations/03-control-flow --yes
```

`reset` and `clean` throw work away, so they refuse to run if **any** matched
`Solution.java` differs from its stub, and print exactly which ones. Add `--yes`
when you mean it.

### Commit your solutions

`Solution.java` is deliberately **not** gitignored — commit your answers as you
go. They're the only part of this repo that isn't regenerable, and having them
tracked means `git checkout` can undo a `reset` you didn't mean.

## Rules of the road

1. **No copying from the test file into the implementation.** Hardcoding a
   return value to satisfy an assertion teaches you nothing.
2. **Guess before you run.** Predict the output first. The gap between your
   prediction and reality is the entire lesson.
3. **Use `jshell`.** It ships with the JDK and is the fastest way to settle an
   argument with yourself about what an expression does.
4. **The scaffold ships no answer key.** `Exercise.java` only ever contains
   stubs. Any `Solution.java` committed here is my own worked answer, kept as a
   record — if you're doing these lessons yourself, reading one before you've
   tried only cheats you.
5. **Green, and then say why.** A lesson is done when the tests pass **and** you
   can explain out loud why each answer is what it is. Green tests you can't
   explain are not mastery.

## Curriculum

Eight Parts, forty-eight lessons. The arc: learn the vocabulary the compiler
insists on → meet the object model and the modern types that replace most of its
ceremony → parameterise them → put data through the collections and streams
everything else is written in terms of → fail well → share memory between
threads without lying to yourself → find out what a program is once it leaves
your editor → and then the platform underneath it all.

### Part 01 — Foundations ✅

The vocabulary. Nothing here is optional; everything later assumes it.

| #  | Lesson                 | You'll be able to                                                |
| -- | ---------------------- | ----------------------------------------------------------------- |
| 01 | Values and types       | Primitives vs references, boxing, overflow, and why `==` lies      |
| 02 | Strings and text       | Immutability, the pool, text blocks, and code points vs chars      |
| 03 | Control flow           | `switch` expressions, exhaustiveness, and the end of fallthrough   |
| 04 | Methods and parameters | Overload resolution, varargs, and why Java has no reference params |
| 05 | Arrays                 | Fixed length, covariance as a type hole, and `Arrays.*`            |
| 06 | Classes and objects    | Construction order, statics, and the five kinds of nested class    |

### Part 02 — Types and objects ✅

The object model, and the modern tools that replace most of its ceremony.

| #  | Lesson              | You'll be able to                                               |
| -- | ------------------- | ---------------------------------------------------------------- |
| 01 | equals and hashCode | Both contracts, and what breaks in a `HashSet` when you break one |
| 02 | Records             | Compact constructors, validation, and where a record is wrong     |
| 03 | Sealed types        | Closed hierarchies, and algebraic data types in Java              |
| 04 | Pattern matching    | Record deconstruction, guards, `case null`, exhaustiveness        |
| 05 | Interfaces          | Default methods, the diamond, and lambdas as implementations      |
| 06 | Enums               | Constant bodies, `EnumMap`/`EnumSet`, and why `ordinal` is a trap |

### Part 03 — Generics ✅

The type system's hardest corner, and the erasure that explains every odd rule.

| #  | Lesson              | You'll be able to                                               |
| -- | ------------------- | ---------------------------------------------------------------- |
| 01 | Generic types       | Generic classes and methods, inference, and raw-type poisoning    |
| 02 | Bounded types       | `extends` bounds, multiple bounds, recursive generics             |
| 03 | Wildcards           | PECS, capture, and why `List<Dog>` isn't a `List<Animal>`         |
| 04 | Type erasure        | What's thrown away, bridge methods, and casts you never wrote     |
| 05 | Generic API design  | Signatures that don't force casts on your callers                 |
| 06 | Class tokens        | `Class<T>`, type-safe heterogeneous containers, super type tokens |

### Part 04 — Collections and streams ✅

What most Java code is actually made of.

| #  | Lesson                | You'll be able to                                             |
| -- | --------------------- | -------------------------------------------------------------- |
| 01 | Collections framework | Pick the right one; views vs copies; `ConcurrentModification`   |
| 02 | Maps in depth         | `computeIfAbsent`/`merge`, ordering, and sequenced maps         |
| 03 | Comparators           | `comparing`/`thenComparing`, total orders, and subtraction bugs |
| 04 | Streams               | Laziness, short-circuiting, and when a `for` loop is better     |
| 05 | Collectors            | `groupingBy` with downstreams, `teeing`, custom collectors      |
| 06 | Gatherers             | Stateful pipeline steps that `map`/`filter` could never express |

### Part 05 — Errors and robustness ✅

Failure as a design concern — the Java answers to what Part 06 of the
JavaScript curriculum asked.

| #  | Lesson              | You'll be able to                                               |
| -- | ------------------- | ---------------------------------------------------------------- |
| 01 | Exceptions          | Checked vs unchecked, multi-catch, the `finally`-return trap      |
| 02 | Custom exceptions   | Cause chains, structured fields, and wrapping without losing      |
| 03 | try-with-resources  | Reverse-order closing, and the suppressed exception you'd lose    |
| 04 | Optional            | `orElseGet` vs `orElse`, and the three places it doesn't belong   |
| 05 | Validation          | Parse don't validate; collect every error; where the boundary is  |
| 06 | Null safety         | `requireNonNull`, helpful NPEs, defensive copies                  |

### Part 06 — Concurrency ✅

The Part where Java is genuinely unlike JavaScript: real threads, real shared
memory, real races.

| #  | Lesson                 | You'll be able to                                            |
| -- | ---------------------- | ------------------------------------------------------------- |
| 01 | Threads and memory     | happens-before, visibility vs atomicity, and a real race       |
| 02 | Synchronization        | Intrinsic locks, deadlock, atomics, and immutability instead   |
| 03 | Executors and futures  | Pools, `CompletableFuture`, and how it maps to promises        |
| 04 | Virtual threads        | Why blocking got cheap, and why you must not pool them         |
| 05 | Concurrent collections | Check-then-act races, `ConcurrentHashMap`, hand-off queues     |
| 06 | Structured concurrency | `ScopedValue` over `ThreadLocal`, and scopes with a lifetime   |

### Part 07 — Modules and the platform ✅

How Java code becomes a program someone else can run.

| #  | Lesson                    | You'll be able to                                         |
| -- | ------------------------- | ---------------------------------------------------------- |
| 01 | Packages and the classpath| Access levels, jars, and `ClassNotFound` vs `NoClassDefFound` |
| 02 | The module system         | `module-info`, strong encapsulation, module metadata        |
| 03 | Resources and class loading| Initialisation order, `getResourceAsStream`, `ServiceLoader` |
| 04 | Dependency resolution     | Implement nearest-wins and highest-wins over a real graph   |
| 05 | Testing with JUnit        | Lifecycle, parameterized tests, and what not to test        |
| 06 | Files and I/O             | `Path`/`Files`, streams that must be closed, encodings      |

### Part 08 — Advanced ✅

The platform underneath, and a capstone that assembles the whole curriculum.

| #  | Lesson                     | You'll be able to                                        |
| -- | -------------------------- | --------------------------------------------------------- |
| 01 | java.time                  | Instant vs local vs zoned, DST gaps, and a testable clock  |
| 02 | Reflection and annotations | Build the mechanism every framework you'll meet runs on    |
| 03 | The Class-File API         | Read what `javac` actually emitted                         |
| 04 | Foreign function & memory  | Arenas, segments, and calling libc without JNI             |
| 05 | Performance                | Why your benchmark is wrong, and what to measure instead   |
| 06 | Capstone                   | An event-sourced store using every Part at once            |

---

All eight Parts are built: 48 lessons, 624 tests, plus 23 `support/` files that
Lessons compile against and the one `java.flags`.

Every Lesson is verified in three states — no `Solution.java` (skipped cleanly),
a fresh copy (594 of the 624 tests red; the other 30 never call your code, and
are there to demonstrate a JDK behaviour the Lesson argues about), and a worked
solution (green). The pristine `Exercise.java` files all compile as they stand,
so a Lesson never starts from a broken file — and the worked solutions those
figures come from live outside the repo, because no answer key ships here.

Ask for extra drills on any Lesson that didn't stick, or for a new technology
folder alongside this one.
