# 04 — The Foreign Function & Memory API

Java code has always been able to call C. Until Java 22 it meant JNI: a header
generator, a C shim compiled per platform, and a class of crash that takes the
whole JVM down with no stack trace. The FFM API replaces all of it with plain
Java.

Everything below is in `java.lang.foreign`.

## Arena: who owns the memory, and until when

Off-heap memory has no garbage collector. `Arena` is the answer — a scope that
allocates and then frees everything at once.

```java
try (Arena arena = Arena.ofConfined()) {
    MemorySegment seg = arena.allocate(1024);
    ...
}                                   // every segment from this arena is now dead
```

Four flavours, and choosing is a real decision:

| Arena | Freed when | Usable from |
| --- | --- | --- |
| `ofConfined()` | you call `close()` | the creating thread only |
| `ofShared()` | you call `close()` | any thread |
| `ofAuto()` | the GC decides | any thread |
| `global()` | never | any thread |

`ofConfined` is the default choice: closing is deterministic, and the
single-thread restriction is what makes that closing *safe* to check cheaply.

## MemorySegment: a pointer that knows its own size

```java
MemorySegment seg = arena.allocate(16);
seg.byteSize();        // 16
seg.set(ValueLayout.JAVA_INT, 0, 42);
seg.get(ValueLayout.JAVA_INT, 0);   // 42
seg.get(ValueLayout.JAVA_INT, 64);  // IndexOutOfBoundsException
```

That is the entire safety story, and it is why this API is not JNI. A segment
carries a **size** and a **scope**, both checked on every access. Read past the
end and you get an exception instead of somebody else's memory; read after
`close()` and you get `IllegalStateException: Already closed` instead of a use
after free.

```java
Arena arena = Arena.ofConfined();
MemorySegment escaped = arena.allocate(4);
arena.close();
escaped.get(ValueLayout.JAVA_INT, 0);   // IllegalStateException
escaped.scope().isAlive();              // false
```

Reach into a confined segment from another thread and you get
`WrongThreadException` — again, a Java exception rather than a data race.

## The trap: a pointer from C has no size, so you cannot read it

```java
MemorySegment found = (MemorySegment) strchr.invokeExact(haystack, (int) 'w');
found.byteSize();        // 0   — not "unknown", zero
found.getString(0);      // IndexOutOfBoundsException
```

C returns an address. An address is a number; it carries no length, and the JVM
refuses to invent one. So every pointer returned by a downcall arrives as a
**zero-length segment** that you cannot read a single byte from. The fix is to
supply the length yourself:

```java
MemorySegment sized = found.reinterpret(n + 1);
sized.getString(0);      // "world"
```

`reinterpret` is where the safety ends: you are asserting a size the JVM cannot
verify, and getting it wrong is exactly the JNI-style crash this API was built
to avoid. That is why it is a *restricted* method — see below. The same applies
to `MemorySegment.ofAddress(someLong)`, which also gives you a zero-length
segment, and for the same reason.

## MemoryLayout: describing a C struct, padding included

Take `struct Reading { short flags; double amount; }`:

```java
MemoryLayout.structLayout(
    ValueLayout.JAVA_SHORT.withName("flags"),
    ValueLayout.JAVA_DOUBLE.withName("amount"));
// IllegalArgumentException: Invalid alignment constraint for member layout
```

A C compiler inserts padding silently. `MemoryLayout` refuses to: an 8-byte
`double` may not begin at offset 2, and saying so is an error at layout-building
time rather than a corrupted read later. You write the padding out yourself —
`MemoryLayout.paddingLayout(n)`, with enough bytes to push the next member onto
its own alignment boundary. Do that here — call the result `reading` — and the
layout builds, `byteSize()` reports 16 rather than 10, and `amount` sits at
offset 8.

A layout with names gives you `VarHandle`s addressed by path rather than by
hand-computed offsets:

```java
VarHandle flags = reading.varHandle(PathElement.groupElement("flags"));
flags.set(seg, 0L, (short) 7);   // (segment, base offset, value)
short back = (short) flags.get(seg, 0L);
```

Watch the coordinates. A struct-member `VarHandle` takes `(MemorySegment, long
base)`, and a `sequenceElement()` handle takes `(MemorySegment, long base, long
index)`. The base offset is not optional and it is not the index — passing the
index where the base goes reads the wrong four bytes and reports nothing.

## Calling a C function

Three pieces: find the symbol, describe its signature, get a `MethodHandle`.

```java
Linker linker = Linker.nativeLinker();
MemorySegment symbol = linker.defaultLookup().find("strlen").orElseThrow();
MethodHandle strlen = linker.downcallHandle(symbol,
        FunctionDescriptor.of(ValueLayout.JAVA_LONG, ValueLayout.ADDRESS));

try (Arena arena = Arena.ofConfined()) {
    MemorySegment cString = arena.allocateFrom("hello");   // NUL-terminated
    long n = (long) strlen.invokeExact(cString);           // 5
}
```

`defaultLookup()` covers libc; `SymbolLookup.libraryLookup(path, arena)` loads
anything else. `allocateFrom(String)` writes the bytes **plus a trailing NUL**,
so `"abc"` occupies 4 bytes — forget that and C reads off the end of your
buffer.

`invokeExact` is unforgiving on purpose. The cast on the result is part of the
call signature, not a conversion: drop the `(long)`, or write `(int)`, and you
get a `WrongMethodTypeException` at runtime rather than a silent truncation.

The `FunctionDescriptor` is a promise you are making. Nothing checks it against
the real C declaration — get the argument count or a type wrong and you have
corrupted the stack. This is the one place FFM is exactly as dangerous as JNI.

## The safety boundary, and the warning you will see

Running the tests in this lesson prints:

```
WARNING: A restricted method in java.lang.foreign.Linker has been called
WARNING: Use --enable-native-access=ALL-UNNAMED to avoid a warning ...
WARNING: Restricted methods will be blocked in a future release ...
```

That is expected. `downcallHandle` and `reinterpret` are **restricted methods**:
everything else in the API is memory-safe, and these two are the doors out. The
JVM makes you acknowledge them at the command line — `--enable-native-access`
for a module, `=ALL-UNNAMED` for classpath code — and the warning is the current
step on the way to that becoming mandatory. The curriculum runner passes its
flags to `javac` as well as `java`, and `javac` rejects that option, so this
lesson leaves the warning in place rather than adding a flags file.

Compared with JNI: no C to compile, no platform-specific build, no manual
reference management, and errors surface as Java exceptions. What you give up is
that nobody checks your `FunctionDescriptor`.

## What to build

| Method | What it does |
| --- | --- |
| `strlen(String)` | Call libc `strlen` on a Java string |
| `cAbs(int)` | Call libc `abs` |
| `substringFrom(String, char)` | `strchr`, then survive the zero-length result |
| `pointLayout()` | A `{int; long}` struct, correctly padded |
| `writePoint(int, long)` | Write and read it back through `VarHandle`s |
| `sumOffHeap(int[])` | An off-heap array, via a sequence layout |
| `copyThroughNativeMemory(byte[])` | Heap → off-heap → heap |
| `accessAfterClose()` | What a use-after-free looks like here |
| `accessFromAnotherThread()` | What confinement does to a stray thread |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `strlen` is declared to return `size_t`, and this lesson maps it to
   `JAVA_LONG`. What breaks on a 32-bit platform, and what does
   `Linker.canonicalLayouts()` have to say about it?
2. An upcall — `Linker.upcallStub` — hands C a pointer to a Java method, which
   is how you pass a comparator to `qsort`. What has to be true about the arena
   that stub lives in?
3. `Arena.ofShared().close()` has to prove no thread is mid-access. Work out why
   that is expensive and `ofConfined().close()` is not.
4. `jextract` generates FFM bindings from a C header. Given what a
   `FunctionDescriptor` is, what can it get right that you cannot, and what can
   it still not know?
