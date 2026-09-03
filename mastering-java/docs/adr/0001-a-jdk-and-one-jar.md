# A JDK and one jar

## Status

Accepted.

## Context

The two existing curricula have almost no tooling. `mastering-javascript` has
none at all — Node ships a test runner, so a Lesson is three files and
`node --test`. `mastering-typescript` adds exactly two dependencies, the
compiler and Node's types, and a script to run the two green lights.

Java arrives with neither property. There is no test runner in the JDK, and the
ecosystem's answer to running anything is Maven or Gradle: a build file, a
dependency tree, a wrapper script, and a project layout
(`src/main/java`, `src/test/java`) that would bury forty-eight Lessons several
directories deep and put a build tool between the reader and the language on
day one.

Three further frictions are specific to Java:

1. A **public** type must match its filename. The `cp Exercise → Solution` step
   that both sibling curricula are built around would mean renaming a class.
2. Lesson folders are named `01-foundations/02-strings-and-text`. Those are not
   legal Java identifiers, so no package can mirror the directory layout.
3. The language's modern shape — records, sealed types, pattern matching,
   virtual threads — is spread across releases, and two of the features worth
   teaching are still preview even in the current LTS.

## Decision

**A JDK and one jar.** The JUnit Platform console launcher, a single
self-contained file fetched into a gitignored `lib/`. No build tool, no project
layout, no wrapper.

**Stubs declare `class Solution`, package-private.** Java ties only *public*
types to filenames, so `Exercise.java` may declare `class Solution` and the copy
lands correct with nothing to rename. The Lesson state model — Missing,
Untouched copy, Started — keeps working, because it depends on the copy being
byte-identical.

**Lessons live in the default package**, each compiling alone into
`.build/<part>/<lesson>/`. Forty-eight classes named `Solution` never meet.

**`mj` is written in bash, not Java.** Its first job is to tell you your JDK is
the wrong version, which it cannot do if it needs that JDK to run. It targets
bash 3.2, the version macOS ships.

**Temurin 25 is pinned** in `.sdkmanrc`. Preview features are off; the single
Lesson whose subject *is* a preview API carries its own `java.flags`.

## Consequences

A Lesson stays three files and one command, which is the property that makes
this repo work.

The cost is a downloaded jar and a JDK version check, both of which `./mj
doctor` reports. `lib/` being gitignored means a fresh clone needs one network
fetch before the first test run — an acceptable trade against committing three
megabytes of binary.

Choosing the default package trades Java convention for lesson ergonomics. It is
a real deviation from how Java is written professionally, so Part 07 Lesson 01
makes packages and the classpath a subject and names this scaffold as the
exception it is, rather than leaving the reader to assume the default package is
normal.

Pinning 25 means the curriculum cannot be worked on 21, which is still the more
widely deployed LTS. That is deliberate: the alternative was `--enable-preview`
leaking into every Lesson to reach features that are final in 25.
