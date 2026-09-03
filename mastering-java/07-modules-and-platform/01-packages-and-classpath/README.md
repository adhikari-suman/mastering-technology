# 01 — Packages and the Classpath

Before Java can run your code it has to find it. Two mechanisms do that: a
package system that turns type names into paths, and a classpath that turns
paths into files. Almost every "it works on my machine" story lives here.

## A package is a namespace that must mirror a directory

```java
package com.example.util;   // must be the first statement in the file

public class Text { }       // binary name: com.example.util.Text
```

The compiler and the runtime both derive a *file path* from the name by
replacing every dot with a separator and appending `.class`:

```
com.example.util.Text   ->   com/example/util/Text.class
```

That mapping is the whole reason the folder layout is not optional. Unlike a JS
module, a Java type has no path of its own — it has a name, and the name *is*
the path.

Nested types keep the dollar sign the compiler gave them:

```
com.example.Outer$Inner  ->  com/example/Outer$Inner.class
```

Package names are flat labels, not a tree. `com.example` and
`com.example.internal` look nested and are, as far as the language is
concerned, two unrelated packages. Neither can see the other's package-private
members.

## The four access levels

| Modifier    | Same class | Same package | Subclass elsewhere | Anywhere |
| ---         | ---        | ---          | ---                | ---      |
| `private`   | yes        | no           | no                 | no       |
| *(none)*    | yes        | yes          | no                 | no       |
| `protected` | yes        | yes          | yes                | no       |
| `public`    | yes        | yes          | yes                | yes      |

The row with no keyword is **package-private**, and it is the default — leave a
member unmarked and you have chosen it. It does not mean "private to this
file"; it means any class in the same package can reach in, including a class
compiled by someone else and dropped onto the classpath in another jar.

Read the `protected` row again. In Java `protected` is *wider* than
package-private, not narrower: it grants subclass access **on top of** package
access. If you wanted "subclasses only", Java does not offer it.

## The classpath is an ordered search path

```bash
java -cp build/classes:lib/guava.jar:lib/legacy.jar com.example.App
```

To load `com.example.util.Text`, the loader tries
`build/classes/com/example/util/Text.class`, then looks inside `guava.jar` for
the same path, then `legacy.jar`, and stops at the first hit. A jar is a zip
file with a `META-INF/MANIFEST.MF` in it, so "look inside the jar" is exactly
"look inside the zip".

**First wins, silently.** Two jars containing the same class is not an error —
the earlier one shadows the later one, and you find out when a method you can
see in the source does not exist at runtime. That is "jar hell", and it is the
problem Part 07's later lessons exist to solve.

Duplicate *packages* across entries are called **split packages**. They are
legal on the classpath and merely dangerous: because package-private is a real
access level, a class you did not write, in a jar you did not audit, can join
your package and read your internals. The module system bans them outright.

## The default package

Leave the `package` line off and the type lands in the unnamed default package.
Everything in this curriculum does that, because the folder names here
(`07-modules-and-platform`) are not valid Java identifiers.

Real code never does. A type in the default package **cannot be imported** —
there is no name to import — so no packaged class can ever refer to it, and a
module cannot contain one at all.

## The trap: `ClassNotFoundException` vs `NoClassDefFoundError`

They sound like the same event. They are not, and the difference tells you
where to look.

```java
Class.forName("no.such.Clazz");   // ClassNotFoundException — checked
```

`ClassNotFoundException` is a *checked exception*, thrown by code that went
looking for a class **by name** — `Class.forName`, `loadClass`, a service
loader, a JDBC driver string in a config file. It means the search happened and
found nothing. Your classpath is wrong.

`NoClassDefFoundError` is an `Error`, thrown by the JVM when code that was
*compiled against* a class cannot link it now. Two very different causes end up
here:

- the class was on the compile classpath and is missing from the run classpath;
- the class is present, but its static initialiser already blew up. The first
  use throws `ExceptionInInitializerError`; every use after that throws
  `NoClassDefFoundError: Could not initialize class X`.

The second case is the cruel one: the message says "not found" about a class
that is sitting right there on the disk. Lesson 03 makes it happen on purpose.

Loading is also not the same as *access*. Today,
`Class.forName("jdk.internal.misc.Unsafe")` succeeds — the class loads fine —
even though `import jdk.internal.misc.Unsafe` will not compile. Finding a class
and being allowed to use it are separate questions, decided by separate
machinery.

## What to build

`ClasspathEntry` (in `support/`) is one entry of a classpath: a name, and the
binary names it holds. A `List<ClasspathEntry>` is a classpath, in order.

| Method | What it does |
| --- | --- |
| `classFilePath(String)` | `com.example.Foo` → `com/example/Foo.class` |
| `packageOf(String)` | The package part of a binary name, or `""` |
| `findClass(List, String)` | The first entry that provides a class |
| `shadowedBy(List, String)` | The later entries that lost |
| `splitPackages(List)` | Packages declared by more than one entry |
| `loadOrNull(String)` | `Class.forName`, `null` instead of throwing |
| `accessLevel(int)` | Reflection modifiers → the level's name |
| `canAccess(String, boolean, boolean)` | The access table above, as code |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `-cp lib/*` works, but `-cp lib/*.jar` does not. Who expands that `*` — the
   shell, or `java`? What does the answer imply about quoting it?
2. A jar's manifest can carry its own `Class-Path:` header pointing at sibling
   jars. Given that the classpath is ordered, where do those entries land?
3. `accessLevel` reads an `int` of bit flags. What is `Modifier.PUBLIC`'s
   value, and why is package-private the only level with no bit of its own?
4. If a split package lets a stranger's class read your package-private state,
   why was the classpath ever designed this way? What did jars cost before
   anyone had a module system?
