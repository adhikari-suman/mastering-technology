# 02 — Reflection and Annotations

Spring, Jackson, JUnit, Hibernate, Micronaut: every framework you will meet in
Java is, underneath, a loop over `getDeclaredFields()` reading annotations. Once
you have written the loop yourself, the magic stops being magic.

## Class, Field, Method, Constructor

`Class<?>` is the entry point, and every Java object can hand you one.

```java
Class<?> c = customer.getClass();          // from an instance
Class<?> d = Customer.class;               // from the type, no instance needed
Class<?> e = Class.forName("Customer");    // from a name, at runtime
```

Then four families of accessors, and the naming is the first thing to get right:

```java
c.getFields()          // public only — including inherited ones
c.getDeclaredFields()  // everything declared HERE — private included, nothing inherited
c.getMethods()         // public, including inherited (so: everything on Object too)
c.getDeclaredMethods() // declared here, any visibility
```

`getDeclaredFields()` also hands back `static` fields and compiler-generated
synthetic ones, so a mapper almost always has to filter:

```java
Arrays.stream(c.getDeclaredFields())
      .filter(f -> !Modifier.isStatic(f.getModifiers()))
      .filter(f -> !f.isSynthetic())
```

The array order is not specified by the JDK. Sort it if the result matters.

## setAccessible, and the wall the module system put up

Reflection can read a private field — but only after you say so:

```java
Field f = Customer.class.getDeclaredField("name");
f.setAccessible(true);       // "suppress the access check"
Object value = f.get(customer);
```

That call is what makes frameworks possible and what makes them dangerous.
Since Java 9 it is no longer unconditional:

```java
Field hash = String.class.getDeclaredField("hash");
hash.setAccessible(true);    // InaccessibleObjectException
```

`java.base` does not *open* `java.lang` to anyone, so nothing outside it can
break into `String`. Your own classes on the classpath are all in the unnamed
module, which is open to everything, so `setAccessible` on them still works —
the wall exists between modules, not between classes. Opening a JDK package on
purpose means a command-line flag, `--add-opens java.base/java.lang=ALL-UNNAMED`,
and that flag is a smell rather than a solution.

## The trap: reflective calls wrap what they throw

```java
Method m = Customer.class.getDeclaredMethod("explode");
m.setAccessible(true);
m.invoke(customer);          // throws InvocationTargetException
```

The `IllegalStateException` the method really threw is not what comes out.
`Method.invoke` catches it and rethrows it wrapped in
`InvocationTargetException`, because reflection has to distinguish "the call
failed" from "the call happened and the code inside threw". Catch it and
`getCause()` — otherwise every stack trace in your framework blames the
reflection layer, and every `catch (IllegalStateException e)` in the caller
silently stops matching.

The other half of the trap is finding the method at all. Lookup is by exact
declared parameter types, and varargs `Object...` boxes everything:

```java
call(customer, "repeat", "ab", 3);
// args[1].getClass() is Integer.class
// getDeclaredMethod("repeat", String.class, Integer.class) -> NoSuchMethodException
// the method really declares (String, int)
```

Boxing is invisible in normal code and fatal here. Match by name and parameter
count, or map wrappers back to their primitives yourself.

## Writing an annotation

An annotation is an interface with a special declaration form. Its members look
like methods and can have defaults:

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface Retry {
    String value() default "";
    int times() default 3;
}
```

`value` is special-cased by the language: `@Retry("flaky network")` is shorthand
for `@Retry(value = "flaky network")`. Any other member must be named, so five
attempts is `@Retry(times = 5)` and never `@Retry(5)`.

**`@Retention` is the trap.** The default is `RetentionPolicy.CLASS`, which
means javac writes the annotation into the class file and the JVM *discards it
when loading*. So the code compiles, the annotation is right there in the
source, and `field.getAnnotation(Column.class)` returns `null`. There is no
error and no warning — your mapper just quietly produces empty rows. Frameworks
that read annotations at runtime need `RUNTIME`, always.

`@Target` restricts where the annotation may be written; omitting it allows
almost everywhere. Getting it wrong is at least a *compile* error, which makes
it much less dangerous than the retention default.

Reading them back:

```java
Column col = field.getAnnotation(Column.class);        // null if absent
if (field.isAnnotationPresent(Column.class)) { ... }
col.value();   // the members are just method calls
```

The object you get back is a JDK proxy synthesised on demand — there is no
`Column` class anywhere with a `value` field.

## Performance, and what replaced it

A reflective `Field.get` costs roughly an order of magnitude more than a direct
read: access checks, boxing of primitives into `Object`, and an argument array
allocated per call. Modern JITs inline much of it away when the `Field` object
is a constant, but nothing makes it free.

`MethodHandle` and `VarHandle` exist for this. You pay the lookup once, and what
comes back behaves like a linked call site rather than a dynamic lookup:

```java
var lookup = MethodHandles.privateLookupIn(Customer.class, MethodHandles.lookup());
VarHandle nameHandle = lookup.findVarHandle(Customer.class, "name", String.class);
String name = (String) nameHandle.get(customer);
```

`VarHandle` also offers the memory-ordering modes reflection has no way to
express — `getVolatile`, `compareAndSet`, `getAndAdd` — which is why the
concurrency classes in the JDK are built on it. The cost is rigidity:
`invokeExact` on a `MethodHandle` demands the call site's static types match the
handle's type signature exactly, and a wrong cast is a `WrongMethodTypeException`
rather than a silent conversion.

## What to build

Declare the `@Column` annotation, then the mapper that reads it.

| Method | What it does |
| --- | --- |
| `@Column` | The annotation itself — retention and target are yours to get right |
| `instanceFieldNames(Class)` | Declared, non-static, sorted |
| `readField(Object, String)` | Read a private field |
| `readFieldFast(Object, String)` | The same read through a `VarHandle` |
| `call(Object, String, Object...)` | Invoke a private method, unwrapped |
| `construct(Class, Object...)` | Invoke a private constructor by arity |
| `canForceAccess(Class, String)` | Whether the module system allows the break-in |
| `toRow(Object)` | The annotation-driven mapper: object → column map |
| `idColumn(Class)` | The column marked as the identifier, if any |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `toRow` reads `getDeclaredFields()`. What happens to a `Customer` that
   extends an annotated base class, and what would you have to write to fix it?
2. The `Column` instance you get back is a proxy. What do `equals`, `hashCode`
   and `toString` do on it, and where is that behaviour specified?
3. A record's components are final and its canonical constructor is generated.
   Which of the methods here still work on a record, and which need
   `getRecordComponents()` instead?
4. Frameworks that used to reflect over everything at startup now generate code
   at build time instead (Micronaut, Quarkus, Spring AOT). What does that buy,
   and what does it cost you at the level of this lesson?
