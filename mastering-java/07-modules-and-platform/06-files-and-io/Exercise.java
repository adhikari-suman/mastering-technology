import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Path;
import java.util.List;

/**
 * Part 07, Lesson 06 — Files and I/O
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp Exercise.java Solution.java
 *
 * Then write your answers in Solution.java, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 *
 * The class below is called `Solution`, not `Exercise`, on purpose. Java only
 * forces a *public* type to match its filename, so a package-private class may
 * live in a file of any name. That is what lets `cp` be the entire setup step:
 * your copy is `Solution.java` holding `class Solution`, which is exactly what
 * the compiler wants, and no renaming is needed.
 *
 * Everything here is `java.nio.file`. `java.io.File` does not appear, and
 * should not appear in your answers either.
 */
class Solution {

    /**
     * Resolve a user-supplied relative name against a base directory, refusing
     * anything that would escape it.
     *
     *   childOf(Path.of("/srv/up"), "avatar.png")   -> /srv/up/avatar.png
     *   childOf(Path.of("/srv/up"), "a/b/c.txt")    -> /srv/up/a/b/c.txt
     *   childOf(Path.of("/srv/up"), "a/../b.txt")   -> /srv/up/b.txt
     *   childOf(Path.of("/srv/up"), "")             -> /srv/up
     *   childOf(Path.of("/srv/up"), "/etc/passwd")  -> throws IllegalArgumentException
     *   childOf(Path.of("/srv/up"), "../etc/passwd")-> throws IllegalArgumentException
     *
     * Return the NORMALISED result. Two separate holes to close: `resolve`
     * hands back an absolute argument unchanged, ignoring the base entirely,
     * and a relative one full of ".." walks out of the base the long way. The
     * check that catches both is the same one — normalise, then confirm the
     * result is still under the base.
     *
     * This touches no disk. Neither path has to exist.
     */
    static Path childOf(Path base, String relative) {
        throw new UnsupportedOperationException("childOf: not implemented");
    }

    /**
     * Write text to a file as UTF-8, creating any missing parent directories,
     * and replacing whatever was there.
     *
     *   writeText(tmp.resolve("a/b/c.txt"), "hello")
     *       creates tmp/a and tmp/a/b, then writes the file
     *   writeText(existing, "second")
     *       leaves the file holding exactly "second"
     *
     * `Files.writeString` will not create directories for you — it throws
     * NoSuchFileException — so there are two calls here, and the first one is
     * a no-op when the directories are already there.
     */
    static void writeText(Path file, String text) throws IOException {
        throw new UnsupportedOperationException("writeText: not implemented");
    }

    /**
     * Read a whole file as UTF-8.
     *
     *   readText(fileHolding("hello"))  -> "hello"
     *   readText(missing)               -> throws NoSuchFileException
     *
     * Do not invent a null or an empty string for a missing file: the caller
     * cannot tell that apart from a file that is genuinely empty.
     */
    static String readText(Path file) throws IOException {
        throw new UnsupportedOperationException("readText: not implemented");
    }

    /**
     * The first n lines of a file, without reading the rest of it.
     *
     *   firstLines(threeLineFile, 2)  -> ["line one", "line two"]
     *   firstLines(threeLineFile, 9)  -> all three lines
     *   firstLines(threeLineFile, 0)  -> []
     *   firstLines(missing, 1)        -> throws NoSuchFileException
     *
     * Use `Files.lines`, which is lazy, rather than `Files.readAllLines`,
     * which is not. `Files.lines` returns a Stream backed by an OPEN FILE
     * HANDLE: it must be closed, and try-with-resources is how. Line
     * terminators are not part of the strings you get back.
     */
    static List<String> firstLines(Path file, int n) throws IOException {
        throw new UnsupportedOperationException("firstLines: not implemented");
    }

    /**
     * Every regular file under a root, as a path relative to that root, using
     * "/" as the separator, sorted.
     *
     * For a tree
     *     root/a.txt
     *     root/sub/b.txt
     *     root/sub/deep/c.txt
     *     root/empty/          (a directory)
     *
     *   relativePaths(root) -> ["a.txt", "sub/b.txt", "sub/deep/c.txt"]
     *
     * Directories are not listed, only the files in them. `Files.walk` yields
     * the root itself first and then descends; its Stream needs closing for
     * the same reason as `Files.lines`. Replace the platform separator — a
     * Path can tell you its own, via getFileSystem() — so the answer is the
     * same on every operating system.
     */
    static List<String> relativePaths(Path root) throws IOException {
        throw new UnsupportedOperationException("relativePaths: not implemented");
    }

    /**
     * Delete a file, or a whole directory tree, and say whether there was
     * anything there.
     *
     *   deleteRecursively(treeWithFiles) -> true, and the root is gone
     *   deleteRecursively(singleFile)    -> true
     *   deleteRecursively(missing)       -> false, no exception
     *
     * `Files.delete` on a non-empty directory throws
     * DirectoryNotEmptyException, so the children have to go first. Walking
     * the tree and sorting the paths in REVERSE order gets you that for free —
     * a child's path always sorts after its parent's.
     */
    static boolean deleteRecursively(Path root) throws IOException {
        throw new UnsupportedOperationException("deleteRecursively: not implemented");
    }

    /**
     * How many bytes this text occupies in this charset.
     *
     *   byteLength("café", UTF_8)       -> 5    (four characters)
     *   byteLength("café", ISO_8859_1)  -> 4
     *   byteLength("café", US_ASCII)    -> 4    (the é became "?")
     *   byteLength("🙂", UTF_8)          -> 4    (String.length() is 2)
     *   byteLength("🙂", US_ASCII)       -> 1    (the whole emoji became "?")
     *   byteLength("", UTF_8)           -> 0
     *
     * Encoding never throws here: characters the charset cannot represent are
     * silently replaced with "?". That is why a length in characters tells you
     * nothing about a length in bytes, and why database columns sized in
     * characters and in bytes are a recurring outage.
     */
    static int byteLength(String text, Charset charset) {
        throw new UnsupportedOperationException("byteLength: not implemented");
    }

    /**
     * Read a file with an explicit charset, STRICTLY — bytes that are not
     * valid in that charset must throw rather than being replaced.
     *
     * For a file written as UTF-8 holding "café":
     *
     *   readWithCharset(f, UTF_8)       -> "café"
     *   readWithCharset(f, ISO_8859_1)  -> "cafÃ©"   (no error: see below)
     *   readWithCharset(f, US_ASCII)    -> throws MalformedInputException
     *
     * The `Files` method that takes a Charset already decodes strictly;
     * `new String(bytes, charset)` does not, and quietly substitutes U+FFFD.
     *
     * ISO-8859-1 gives no error at all because every one of the 256 byte
     * values is a valid character in it. It cannot fail, so it corrupts
     * instead — which makes it the worst thing to fall back to.
     */
    static String readWithCharset(Path file, Charset charset) throws IOException {
        throw new UnsupportedOperationException("readWithCharset: not implemented");
    }
}
