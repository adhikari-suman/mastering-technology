# 04 — Dependency Resolution

The module system checks *names*. Nothing in the JDK checks *versions* — that
is entirely the build tool's job, and the two build tools everyone uses do it
differently. This lesson builds the resolver so the difference stops being
folklore.

## Why Maven and Gradle exist

Java has no `node_modules`. A jar is a flat archive with no dependency
information a class loader can act on, and the classpath is one ordered list
with room for exactly one copy of any class (lesson 01). So something has to
decide, before the JVM starts, which jars go on that list.

That something reads a declaration:

```xml
<!-- pom.xml -->
<dependency>
  <groupId>org.slf4j</groupId>
  <artifactId>slf4j-api</artifactId>
  <version>2.0.9</version>
</dependency>
```

```kotlin
// build.gradle.kts
dependencies { implementation("org.slf4j:slf4j-api:2.0.9") }
```

Same three fields either way. `group:artifact:version` is a **coordinate**, and
it maps directly to a path in a repository:

```
org/slf4j/slf4j-api/2.0.9/slf4j-api-2.0.9.jar
org/slf4j/slf4j-api/2.0.9/slf4j-api-2.0.9.pom     <- its own dependencies
```

Every artifact ships its own dependency list, so resolution is a graph walk:
start at your project, read each `.pom`, follow the edges, repeat.

## Transitive dependencies and the diamond

```
      app
     /   \
  web     db
     \   /
     core        ...at two different versions
```

`web` wants `core:2.0`; `db` wants `core:1.0`. Both end up on one classpath
where only one `core` can exist. Something has to choose, and — this is the
part people miss — **the choice is not "install both"**. There is no version
isolation. One version wins for the whole process.

The two tools choose differently.

**Maven: nearest definition wins.** Depth from the root decides. The version
declared closest to your project beats one further away, regardless of which is
newer. Ties at equal depth go to whichever was declared first.

**Gradle: highest version wins.** Depth is irrelevant; the largest version
number in the graph is selected, on the theory that libraries are backwards
compatible and the newest satisfies everyone.

## The trap: Maven's rule downgrades things

```
app
├── core:1.0        <- you added this directly, a year ago
└── web:2.0
        └── core:2.0    <- what web actually needs
```

`core:1.0` is at depth 1 and `core:2.0` is at depth 2, so Maven ships
`core:1.0` and `web` runs against a version older than the one it was compiled
against. Nothing warns you. The symptom arrives much later as a
`NoSuchMethodError` — the linking failure from lesson 03 — pointing at a method
that exists perfectly well in the source you are reading.

Gradle's rule has the opposite failure: it silently *upgrades* you into a
version whose behaviour changed. The upgrade is at least visible in
`gradle dependencies`, which prints `1.0 -> 2.0` on the line it moved.

Neither tool is wrong. What is wrong is not knowing which one you are running.

```bash
mvn dependency:tree           # shows "omitted for conflict with 1.0"
gradle dependencies           # shows "core:1.0 -> 2.0"
```

Both tools let you pin the answer: Maven's `<dependencyManagement>` (and BOM
imports) fix a version for the whole tree at depth zero; Gradle has
`constraints` and `strictly`. Pinning the versions that matter is cheaper than
diagnosing a `NoSuchMethodError` on a Friday.

## Cycles

A dependency graph is meant to be acyclic, and Maven refuses cyclic module
graphs outright. Real graphs still contain them — two artifacts released as a
pair, each depending on the other — so a resolver has to detect a cycle rather
than recurse into a `StackOverflowError`. Detection is the same trick either
way: depth-first, with the current path on a stack, and a node already on the
stack means you have arrived back where you started.

Topological order is what the cycle check buys you: an ordering in which every
artifact comes after everything it depends on. That is the order a build must
compile modules in, and it is exactly the order a cycle makes impossible.

## What to build

A graph here is a `Map<String, List<String>>` from a coordinate to the
coordinates it depends on, in declared order. A coordinate missing from the map
has no dependencies. `Dep` (in `support/`) is a parsed coordinate.

| Method | What it does |
| --- | --- |
| `parse(String)` | `"g:a:1.0"` → `Dep`, or reject it |
| `compareVersions(String, String)` | Dotted numeric versions, ordered |
| `depths(Map, String)` | Shortest distance from the root to each node |
| `conflicts(Map, String)` | The `group:artifact` keys wanted at two versions |
| `nearestWins(Map, String)` | Maven's resolution |
| `highestWins(Map, String)` | Gradle's resolution |
| `topologicalOrder(Map, String)` | Dependencies before dependents |
| `findCycle(Map, String)` | A cycle, as the path back to itself |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `compareVersions` here handles digits and dots. Real versions carry
   qualifiers: `1.0-SNAPSHOT`, `2.0-rc1`, `33.0-jre`. Sort those four by hand,
   then look up what Maven actually does with them.
2. Nearest-wins depends on depth, so *adding* a dependency can change the
   version of something you never mentioned. Construct the smallest graph where
   adding one edge downgrades an unrelated artifact.
3. Neither strategy can ship two versions of one artifact. What would have to
   be true of the class loader for that to be possible, and which JVM
   ecosystems actually do it?
4. `provided` and `compileOnly` dependencies are on the compile classpath and
   absent at run time. Which of lesson 03's three failure families does getting
   that wrong produce?
