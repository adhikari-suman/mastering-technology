# 03 — Resources and Class Loading

A class becomes usable in three steps, and knowing where the boundaries are is
the difference between reading a stack trace and guessing at one.

## Loading, linking, initialisation

1. **Loading** — a class loader finds the bytes for `com/example/Foo.class` and
   hands the JVM a `Class` object. Failure here is `ClassNotFoundException` (if
   someone asked by name) or `NoClassDefFoundError` (if the JVM was linking).
2. **Linking** — verify the bytecode, prepare static fields with their default
   values (`0`, `null`, `false`), resolve symbolic references. Failure here is
   `VerifyError`, `NoSuchMethodError`, `IncompatibleClassChangeError` — the
   family that means "you compiled against a different version of this jar".
3. **Initialisation** — run `<clinit>`: the static field initialisers and
   `static { }` blocks, in **textual order**, exactly once, thread-safely.

Step 3 is lazy, and the JVM specifies precisely what wakes it: creating an
instance, calling a static method, reading or writing a non-constant static
field, `Class.forName(name)`, or initialising a subclass.

```java
class Config {
    static final String NAME = "config";                // compile-time constant
    static final String PATH = System.getenv("CONFIG"); // not a constant
    static { System.out.println("Config initialised"); }
}

Config.NAME;   // prints nothing — the literal was inlined into your class file
Config.PATH;   // prints "Config initialised"
```

`NAME` is a compile-time constant, so `javac` copies the value into every
call site and no reference to `Config` survives. Change the constant and
recompile only `Config`, and callers keep the old value — the single most
confusing stale-build symptom in Java.

## The failing static initialiser

```java
class Registry {
    static final Map<String, Handler> ALL = load();   // throws
}

Registry.ALL;   // 1st: ExceptionInInitializerError, caused by the real problem
Registry.ALL;   // 2nd: NoClassDefFoundError: Could not initialize Registry
```

A class is marked *erroneous* after its initialiser fails, and every later use
gets `NoClassDefFoundError` with the original cause gone. If you only see the
second message in the log, the first one happened somewhere you were not
looking, and it is the only one with the real reason in it.

## The loader hierarchy delegates upward

```
bootstrap  (null)      java.base and friends, built into the JVM
   ^
platform               the rest of the JDK: java.sql, java.xml.crypto, ...
   ^
application ("app")    your -cp, and everything on it
```

Ask any loader for a class and it asks its **parent first**, only searching
itself if the parent has nothing. That is why you cannot shadow
`java.lang.String` with your own copy, and why a `getClassLoader()` of `null`
means "the bootstrap loader" rather than "no loader":

```java
String.class.getClassLoader();          // null — bootstrap
java.sql.Driver.class.getClassLoader(); // platform
Solution.class.getClassLoader();        // app (or whatever launched you)
```

`Class.forName(name)` uses the caller's loader and **initialises** the class.
The three-argument form does not have to:

```java
Class.forName("Registry");                       // loads, links, initialises
Class.forName("Registry", false, myLoader);      // loads and links only
```

## The trap: the leading slash means opposite things

There are two `getResourceAsStream` methods and they do not agree.

```java
// Class: a name with no slash is relative to the CLASS'S PACKAGE
List.class.getResourceAsStream("List.class");             // found, java/util/
List.class.getResourceAsStream("/java/util/List.class");  // found, absolute
List.class.getResourceAsStream("/List.class");            // null

// ClassLoader: names are ALWAYS absolute, and a leading slash breaks it
loader.getResourceAsStream("config/app.properties");      // found
loader.getResourceAsStream("/config/app.properties");     // null, always
```

`Class.getResourceAsStream` prefixes a relative name with its own package and
then strips the leading slash before delegating.
`ClassLoader.getResourceAsStream` does no such thing: the slash becomes part of
the path it searches for, nothing matches, and you get a silent `null`. Nobody
throws. You find out when
`new BufferedReader(new InputStreamReader(null))` produces a
`NullPointerException` four frames away from the mistake.

The same search order from lesson 01 applies — first entry wins — which is why
`getResources` (plural) exists and returns an `Enumeration`. Two jars each
carrying `logback.xml` is not an error; it is a coin toss.

Resources live *beside* classes on the classpath, not on the filesystem. In a
Maven or Gradle project `src/main/resources/config/app.properties` is copied
into the build output next to the `.class` files, and reading it as
`new File("src/main/resources/...")` works right up to the moment you ship a
jar. This lesson builds its own classpath directory in a temp folder, because
the runner here compiles `.java` and nothing else.

## `ServiceLoader`

The JDK's built-in plugin mechanism: an interface, some implementations, and a
declaration of which is which.

```java
public interface Codec { String name(); }

// classpath form: META-INF/services/com.example.Codec  contains
//   com.example.JsonCodec
//   com.example.XmlCodec

// module form: in module-info.java
//   provides com.example.Codec with com.example.JsonCodec;
//   uses com.example.Codec;   // in the consuming module

for (Codec c : ServiceLoader.load(Codec.class)) { ... }
```

Providers must be public with a public no-argument constructor, and they are
instantiated lazily as you iterate. `ServiceLoader.load(Class, ClassLoader)`
pins the search to one loader, which is what makes it testable — and what
frameworks use to keep plugins from leaking between contexts.

## What to build

`support/` supplies `InitLog`, `Lazy`, `Eager`, `Boom`, and a `Plugin`
interface with two implementations. Read them first.

| Method | What it does |
| --- | --- |
| `load(String, boolean)` | `Class.forName`, with initialisation optional |
| `touchConstant()` | Read a compile-time constant, return the init log |
| `touchField()` | Read a real static field, return the init log |
| `initFailure(Runnable)` | Run it, name whatever came out |
| `loaderChain(ClassLoader)` | A loader and its parents, ending at `bootstrap` |
| `readResource(ClassLoader, String)` | Loader-relative lookup, text or null |
| `classResourceExists(Class, String)` | Class-relative lookup, present or not |
| `countResources(ClassLoader, String)` | How many entries provide this path |
| `pluginNames(ClassLoader)` | `ServiceLoader`, sorted |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `<clinit>` is guaranteed to run exactly once even with twenty threads
   racing. What happens to thread B while thread A is inside it, and what does
   that imply about calling into other classes from a static block?
2. Parent-first delegation is the default. Application servers invert it for
   deployed applications. What breaks either way?
3. `getResource` returns a `URL`. Inside a jar that URL starts `jar:file:`, and
   inside a `jlink` image it starts `jrt:`. Which of your file-handling code
   assumed otherwise?
4. `ServiceLoader` iteration instantiates providers lazily and wraps any
   failure in `ServiceConfigurationError`. Why an `Error` and not an exception?
