# 02 — The Module System

The classpath answers "where is this class?" and nothing else. Modules answer
two questions it never could: what does this code *need*, and what is anyone
else allowed to *touch*. Java 9 added them, and the JDK itself was the first
thing rewritten to use them.

## `module-info.java`

One file at the root of a source tree, compiled to `module-info.class`, and it
is not a class — `module`, `requires`, `exports` and the rest are restricted
keywords that only mean anything inside it.

```java
module com.example.app {
    requires java.sql;                       // I need it
    requires transitive com.example.api;     // and so does anyone who needs me
    requires static com.example.annotations; // needed to compile, not to run

    exports com.example.app.model;                       // public to everyone
    exports com.example.app.spi to com.example.plugin;   // public to one module

    opens com.example.app.entity;            // deep reflection allowed here

    uses com.example.api.Codec;                          // I look this up
    provides com.example.api.Codec with com.example.app.JsonCodec;
}
```

Read the directives as answers:

- **`requires`** — dependencies, by module name, not by version. Versions are
  the build tool's job (lesson 04); the module system only checks names.
- **`requires transitive`** — *implied readability*. If your API returns a type
  from another module, your callers must be able to name that type. Make the
  dependency transitive and they get it for free; forget, and every caller has
  to `requires` it themselves.
- **`requires static`** — present at compile time, optional at run time. This
  is how a library depends on an annotation processor without dragging it into
  production.
- **`exports`** — a package's *public* types become visible outside the module.
  A public class in a package you did not export is not visible to anyone. This
  is the change: in the classpath world, `public` meant public to the world.
- **`opens`** — permits *deep reflection*: `setAccessible(true)` on private
  members. Frameworks that populate your objects by reflection (JPA, Jackson,
  most dependency injection) need this, and only this.

`exports` and `opens` are independent. `exports` without `opens` is
"compile against my API, do not rummage in my fields". `opens` without
`exports` is "you cannot name my types, but a framework may reflect on them" —
which is exactly what an entity package wants.

## The module path is not the classpath

```bash
javac -d out --module-path lib  $(find src -name '*.java')
java  --module-path out:lib  --module com.example.app/com.example.app.Main
```

`--module-path` (`-p`) reads each jar's `module-info.class` and resolves a
graph before anything runs. A missing dependency is a startup failure with a
name in it, not a `NoClassDefFoundError` an hour into production. `--class-path`
still works and always will; the two can be mixed, which is how everyone
actually migrates.

Three kinds of module exist:

- **Named modules** — a jar with a `module-info.class`, on the module path.
- **Automatic modules** — a plain jar on the *module path*. It gets a module
  name (from `Automatic-Module-Name` in the manifest, or derived from the file
  name), exports everything, opens everything, and reads everything. It is the
  bridge that lets you modularise before your dependencies do.
- **The unnamed module** — everything on the classpath, lumped together. It
  reads every other module and exports all its packages, so classpath code
  keeps working. Each class loader has its own.

The derived name is worth knowing because it is *load-bearing and it comes from
a filename*: `commons-lang3-3.12.0.jar` becomes module `commons.lang3`. Rename
the jar and you have renamed the module.

## The trap: strong encapsulation broke reflection

This compiled and ran for twenty years, and now it does not:

```java
Field f = String.class.getDeclaredField("value");
f.setAccessible(true);
// java.lang.reflect.InaccessibleObjectException:
//   Unable to make field private final byte[] java.lang.String.value
//   accessible: module java.base does not "opens java.lang" to
//   unnamed module @5fbe4146
```

`java.base` **exports** `java.lang` — you can call `String`'s public methods all
day. It does not **open** it, so private members are sealed off from reflection
no matter who you are. Half the "upgrade to Java 17" horror stories are this
exception coming out of an old library.

The escape hatch is a command-line flag, applied to the *whole* JVM:

```bash
java --add-opens java.base/java.lang=ALL-UNNAMED   ...
java --add-exports jdk.compiler/com.sun.tools.javac.api=ALL-UNNAMED ...
```

Use it to unblock yourself today and to date the code you should be deleting.

Note what did *not* change: `Class.forName("jdk.internal.misc.Unsafe")` still
returns a class. Loading and reading metadata are not restricted. Calling
members and reflecting into privates are.

## Reading the graph at run time

Every class knows its module, and every module has a descriptor:

```java
String.class.getModule().getName();          // "java.base"
Solution.class.getModule().isNamed();        // false — you are on the classpath
String.class.getModule().isExported("java.lang");        // true
String.class.getModule().isOpen("java.lang");            // false
ModuleLayer.boot().findModule("java.sql");   // Optional<Module>
```

`ModuleDescriptor` is the parsed form of a `module-info.class`, and you can
build one in memory with `ModuleDescriptor.newModule(...)`. That is what this
lesson uses: this curriculum runs on the classpath, so instead of shipping a
module you will *parse* module declarations and reason about them.

One thing the builder does behind your back: every module except `java.base`
gets `requires mandated java.base` added whether you wrote it or not. It shows
up in `requires()` and it will surprise you in a test.

## What to build

| Method | What it does |
| --- | --- |
| `parse(String)` | `module-info.java` source → `ModuleDescriptor` |
| `transitiveRequires(ModuleDescriptor)` | The names marked `transitive` |
| `exportedTo(ModuleDescriptor, String)` | Packages one named module can see |
| `readableFrom(Map, String)` | Implied readability, resolved |
| `automaticModuleName(String)` | `guava-33.0.0-jre.jar` → `guava` |
| `moduleNameOf(Class)` | The module of a type, or `"<unnamed>"` |
| `canUse(Module, Module, String)` | Read edge *and* export, both required |
| `tryDeepReflect(Class, String)` | `setAccessible`, and what it throws |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `readableFrom` follows `transitive` edges but not plain ones. Write down the
   graph where that distinction changes the answer, then explain why the
   designers made implied readability opt-in rather than the default.
2. A module cannot contain a class in the default package, and two modules
   cannot both contain package `com.foo`. Which of the classpath's failure
   modes does each rule kill?
3. `--add-opens` takes `ALL-UNNAMED` as a target. What would it mean to pass a
   real module name there instead, and why is the flag a per-JVM decision
   rather than a per-library one?
4. `jlink` builds a runtime image containing only the modules you resolved.
   What does that buy over shipping a jar and a full JDK, and what does it cost
   the moment you want to load a plugin nobody knew about at link time?
