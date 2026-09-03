# 03 — The Class-File API

A `.class` file is not a mystery format. It is a short, rigid binary structure,
and since Java 24 the JDK ships a supported parser for it in
`java.lang.classfile` — so reading bytecode no longer means adding ASM to your
build.

## What javac actually emits

One class file per class, with this shape:

```
magic 0xCAFEBABE | version | constant pool | flags | this | super | interfaces
fields | methods | attributes
```

Everything interesting is *indirect*. A method does not contain its own name; it
contains an index into the **constant pool**, and the entry there contains
another index to the UTF-8 bytes. The pool is where every string, class
reference, field reference and numeric literal in the class lives, exactly once.

```java
ClassModel cm = ClassFile.of().parse(bytes);
cm.thisClass().asInternalName();     // "Widget"
cm.superclass().get().asInternalName();  // "java/lang/Object"
cm.methods().stream().map(m -> m.methodName().stringValue()).toList();
//   [<init>, size, add, serial, greeting]
```

Two naming surprises are visible already. Names are in **internal form**, with
`/` where the source had `.`, so converting is on you. And a constructor is a
method called `<init>`; the static initialiser is `<clinit>`. Those names are
not writable in Java source precisely so that they can never collide.

Types are descriptors, not names:

```
()I                       int f()
(II)I                     int f(int, int)
(Ljava/lang/String;)V     void f(String)
[[J                       long[][]
```

`ClassFile.of()` gives you a context; `parse` gives an immutable tree of
`ClassModel` → `MethodModel` → `CodeModel`. Attributes hang off each level and
are looked up by a typed key:

```java
cm.findAttribute(Attributes.sourceFile())
  .map(a -> a.sourceFile().stringValue());        // Optional[Widget.java]
```

`SourceFile` is why stack traces have line numbers to point at. It is an
*optional* attribute — compile with `-g:none` and it is simply absent, which is
why the accessor returns an `Optional`.

## The trap: the constant pool is 1-based and has holes

```java
ConstantPool cp = cm.constantPool();
cp.size();               // 34   — but there are only 32 entries
cp.entryByIndex(14);     // ConstantPoolException: Unusable CP index: 14
```

Two separate oddities compound.

First, the pool is indexed from **1**, and index 0 is a permanent hole meaning
"no entry" — that is how the format encodes "this class has no superclass" for
`java.lang.Object`. So the count in the file is one more than the number of
entries.

Second, and much worse: a `CONSTANT_Long` or `CONSTANT_Double` entry **occupies
two slots**. The JVM specification calls this "a historical mistake". A long
constant at index 13 makes index 14 unusable, and a loop that walks
`for (i = 1; i < size; i++)` and asks for each index throws part-way through a
class it has no business failing on. Iterating the pool as an `Iterable` skips
the holes for you, which is the whole reason it is one:

```java
for (PoolEntry e : cp) { ... }     // 32 iterations, no holes
```

Any hand-written class-file parser you find on the internet has this bug about
half the time. It only shows up on classes containing a large `long` literal.

## Bytecode is a stack machine

Each method's `Code` attribute holds a locals array and an operand stack. There
are no registers. Instructions push and pop:

```java
static int add(int a, int b) { return a + b; }
// ILOAD_0   push local 0  (a)
// ILOAD_1   push local 1  (b)
// IADD      pop two, push their sum
// IRETURN   pop, return it

int size() { return size; }
// ALOAD_0   push local 0 — which for an instance method is `this`
// GETFIELD  pop an object, push its field
// IRETURN
```

The `I`/`A`/`L`/`D` prefixes are the type: int, reference, long, double.
`Code` also records `max_stack` and `max_locals`, computed by javac, and a
`StackMapTable` that lets the JVM's verifier check types in one linear pass
instead of doing dataflow analysis at load time.

Walking it is a pattern match over `CodeElement`:

```java
for (CodeElement e : method.code().orElseThrow()) {
    if (e instanceof Instruction i) System.out.println(i.opcode());
}
```

Not every element is an instruction — labels, line-number marks and exception
handlers arrive in the same stream, which is why the `instanceof` filter is
there.

## Generating a class

The building API is the reading API run backwards:

```java
byte[] bytes = ClassFile.of().build(ClassDesc.of("Answer"), cb -> cb
    .withFlags(ClassFile.ACC_PUBLIC | ClassFile.ACC_FINAL)
    .withMethodBody("answer",
        MethodTypeDesc.of(CD_int),
        ClassFile.ACC_PUBLIC | ClassFile.ACC_STATIC,
        code -> code.bipush(42).ireturn()));

Class<?> c = MethodHandles.lookup().defineClass(bytes);
c.getMethod("answer").invoke(null);   // 42
```

Four moving parts, and each one is a decision. `ClassDesc.of(name)` is the class
being written. `withFlags` is its modifiers, as the same `ACC_` bits the file
format uses. `MethodTypeDesc.of(returnType, parameterTypes...)` is the
descriptor, built from `ClassDesc` constants rather than from a string — `CD_int`
and friends live in `java.lang.constant.ConstantDescs`. And the body is a
sequence of `CodeBuilder` calls, one per instruction, in the order the JVM will
execute them; the section above says what those instructions are called.

The constant pool, `max_stack`, `max_locals` and the stack map are all worked
out for you. `defineClass` loads the result into the lookup's own package, which
is why the generated name here has no package: this curriculum compiles into the
default package, and the JVM refuses to define a class into a package the lookup
class does not belong to.

This is what Spring, Mockito, Lombok and the JDK's own lambda implementation are
doing when they appear to conjure classes out of nothing.

## What to build

Every method here takes the bytes of a class file, which is why `bytesOf` comes
first. The fixture in `support/Widget.java` is compiled by the test run itself,
so the bytes you parse were produced by this JDK, on this machine, seconds ago.

| Method | What it does |
| --- | --- |
| `bytesOf(Class)` | The class file for a loaded class, as bytes |
| `superclassName(byte[])` | The binary name of the superclass, if any |
| `methodNames(byte[])` | Every declared method, sorted |
| `descriptorOf(byte[], String)` | One method's descriptor |
| `sourceFile(byte[])` | The `SourceFile` attribute, if present |
| `stringConstants(byte[])` | Every string literal in the pool, sorted |
| `poolSlotCount(byte[])` | The pool's addressable size |
| `poolEntryCount(byte[])` | How many entries are really in it |
| `opcodesOf(byte[], String)` | One method's instructions, by name |
| `generateAdder(String)` | A class file made from nothing |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `poolSlotCount` and `poolEntryCount` differ by two for `Widget`. Exactly
   which two indices are missing, and what would the difference be for a class
   with no `long` or `double` literals at all?
2. `greeting()` returns `"hello"` and the pool holds a `CONSTANT_String`. What
   does the pool hold for `"a" + someVariable`, and why is there an
   `invokedynamic` in the middle of it since Java 9?
3. `bytesOf(Object.class)` works, and `superclassName` on it is empty. Where did
   those bytes come from, given that there is no `rt.jar` any more?
4. A class file records the JDK version that produced it (`majorVersion`, 69 for
   Java 25). What happens when a newer number reaches an older JVM, and why is
   that the one compatibility rule the platform never bends?
