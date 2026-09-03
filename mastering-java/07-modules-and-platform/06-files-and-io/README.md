# 06 — Files and I/O

`java.nio.file` replaced `java.io.File` in Java 7 and the old one is still
there, still autocompleting, still tempting. This lesson is the new API, the
handful of places it surprises people, and the one resource-management rule
that streams over files quietly impose.

## `Path` is a name; `Files` does the work

```java
Path p = Path.of("/var/log", "app", "today.log");
p.getFileName();   // today.log
p.getParent();     // /var/log/app
p.getNameCount();  // 3
Files.exists(p);   // now we have touched the disk
```

A `Path` is a parsed *name*. Building one never touches the filesystem, never
throws, and never checks anything. `Files` is the static class holding every
operation that does. Keeping those apart is the design: the path
`/etc/nonsense/../passwd` is a perfectly valid `Path` whether or not it exists.

`Path.equals` is lexical, not semantic:

```java
Path.of("a/b").equals(Path.of("a/./b"));   // false
Path.of("a/./b").normalize();              // a/b
```

Two paths naming the same file are unequal until you `normalize` them, and even
then only `Files.isSameFile` really answers the question — symlinks exist.

## The trap: `resolve` with an absolute argument

```java
Path base = Path.of("/srv/uploads");
base.resolve("avatar.png");     // /srv/uploads/avatar.png
base.resolve("/etc/passwd");    // /etc/passwd     <- the base vanished
```

`resolve` means "interpret this name *relative to* me", and an absolute path is
not relative to anything, so it is returned unchanged. Feed a user-supplied
filename straight into `resolve` and you have written a path traversal bug. The
same hole opens without a leading slash:

```java
base.resolve("../../etc/passwd").normalize();   // /etc/passwd
```

The fix is a check, not a different method: normalize the result and confirm it
still `startsWith` the base.

The second surprise in the same class:

```java
Path.of("/a/b/notes.txt").endsWith(".txt");        // false
Path.of("/a/b/notes.txt").endsWith("notes.txt");   // true
Path.of("/a/b/notes.txt").endsWith("b/notes.txt"); // true
```

`Path.endsWith` compares whole *name elements*, not string suffixes. For an
extension test you want `getFileName().toString().endsWith(".txt")`.

## Streams over files hold a file handle open

```java
long count = Files.lines(path).count();          // leaks a file descriptor

try (Stream<String> lines = Files.lines(path)) { // correct
    return lines.limit(10).toList();
}
```

`Files.lines` and `Files.walk` return a `Stream`, and unlike every other stream
you have used, these are backed by an open handle. `Stream` extends
`AutoCloseable` for exactly this reason. Nothing warns you; you just run out of
descriptors under load, thousands of calls later, in a place that looks fine.

The laziness is the payoff: `Files.lines(huge).limit(10)` reads ten lines and
stops, where `Files.readAllLines(huge)` reads the lot into memory first.

`try`-with-resources closes in reverse order, closes even when the body threw,
and attaches any exception from `close()` to the original as a *suppressed*
exception rather than replacing it. That last part is why the pattern is worth
more than a `finally` block: the reason the body failed is not lost.

## Encodings must be explicit

```java
Files.writeString(path, "café");        // always UTF-8
Files.readString(path);                 // always UTF-8
Files.readString(path, US_ASCII);       // MalformedInputException
new String(bytes, US_ASCII);            // "caf??" — silent corruption
```

The `Files` text methods have always been UTF-8. The old ones — `FileReader`,
`FileWriter`, `InputStreamReader`, `new String(bytes)`, `String.getBytes()` —
use the *default* charset, which was whatever the platform said until Java 18
made it UTF-8 everywhere (JEP 400). Code written before then, run on a machine
configured differently, produced mojibake on one continent and not another.

Two decoders, two behaviours, and the difference matters:
`Files.readString(path, cs)` is **strict** — bytes that are not valid in that
charset throw `MalformedInputException`. `new String(bytes, cs)` **replaces**
them with U+FFFD and says nothing. Prefer the one that fails.

And ISO-8859-1 never fails at all — every byte is a valid character in it — so
reading UTF-8 as Latin-1 gives you `cafÃ©` rather than an error. That is the
signature of the bug.

Bytes and characters are not the same count, and neither is code points:

```java
"café".length();                       // 4 chars, 5 UTF-8 bytes
"🙂".length();                          // 2 — one code point, two UTF-16 chars
"🙂".getBytes(UTF_8).length;            // 4
"🙂".getBytes(US_ASCII).length;         // 1 — the whole emoji became "?"
```

## Walking and deleting a tree

```java
try (Stream<Path> tree = Files.walk(root)) {
    tree.filter(Files::isRegularFile).forEach(System.out::println);
}
```

`Files.walk` yields the root itself first, then descends. `Files.list` is one
level only. There is no `Files.deleteRecursively`, on purpose — deleting a tree
is dangerous enough that the JDK makes you write it:

```java
try (Stream<Path> tree = Files.walk(root)) {
    for (Path p : tree.sorted(Comparator.reverseOrder()).toList()) {
        Files.delete(p);
    }
}
```

Reverse order puts children before their parents, because `Files.delete` on a
non-empty directory throws `DirectoryNotEmptyException`. On a missing file it
throws `NoSuchFileException`; `Files.deleteIfExists` returns `false` instead.

## What `java.io.File` costs

```java
new File("/tmp/gone").delete();   // false. Missing? Permissions? A directory?
```

`File` reports failure by returning `false` with no reason attached, has no
symlink support, no atomic move, no file attributes worth the name, and no
directory streaming. `Files.delete` throws an exception naming the path and the
problem. Convert at the boundary with `file.toPath()` and `path.toFile()` when
an old API forces you, and use `java.nio.file` everywhere else.

## Temporary files in tests

```java
@Test
void writesTheReport(@TempDir Path tmp) throws IOException { ... }
```

JUnit's `@TempDir` creates a fresh directory per test and deletes it, tree and
all, afterwards. It beats `Files.createTempFile` — which leaves the file behind
— and it beats writing into the project directory, which turns two tests run in
parallel into one flaky one.

## What to build

| Method | What it does |
| --- | --- |
| `childOf(Path, String)` | Resolve safely, refusing to escape the base |
| `writeText(Path, String)` | UTF-8, creating parent directories |
| `readText(Path)` | UTF-8, throwing when there is no file |
| `firstLines(Path, int)` | The first n lines, lazily, closing the stream |
| `relativePaths(Path)` | Every regular file under a root, sorted |
| `deleteRecursively(Path)` | A tree, children first |
| `byteLength(String, Charset)` | How many bytes that text really is |
| `readWithCharset(Path, Charset)` | Strict decoding, so wrong charsets throw |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `try`-with-resources attaches a failure from `close()` to the original as a
   suppressed exception. Find `getSuppressed()` and work out what a `finally`
   block would have done with the same pair of failures.
2. `Files.walk` throws `UncheckedIOException` from inside the stream when it
   cannot read a directory partway through. Why unchecked, given that
   `Files.walk` itself declares `IOException`?
3. `deleteRecursively` follows whatever `Files.walk` gives it. What does it do
   when the tree contains a symlink to `/`, and which option to `Files.walk`
   decides that?
4. `Files.readString(path, ISO_8859_1)` can never fail. What property of
   ISO-8859-1 guarantees that, and why does it make it the worst possible
   fallback charset?
