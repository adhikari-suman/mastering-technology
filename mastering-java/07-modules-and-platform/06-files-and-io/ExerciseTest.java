import static java.nio.charset.StandardCharsets.ISO_8859_1;
import static java.nio.charset.StandardCharsets.US_ASCII;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.MalformedInputException;
import java.nio.file.DirectoryNotEmptyException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 *
 * Every test that touches the disk takes a @TempDir, which JUnit creates fresh
 * and deletes afterwards, tree and all.
 */
class ExerciseTest {

    @Test
    @DisplayName("childOf: resolve is safe until the argument is absolute")
    void childOfResolvesRelativeNames() {
        Path base = Path.of("/srv/up");
        assertEquals(Path.of("/srv/up/avatar.png"), Solution.childOf(base, "avatar.png"));
        assertEquals(Path.of("/srv/up/a/b/c.txt"), Solution.childOf(base, "a/b/c.txt"));
        assertEquals(Path.of("/srv/up/b.txt"), Solution.childOf(base, "a/../b.txt"), "normalised, and still inside");
        assertEquals(Path.of("/srv/up"), Solution.childOf(base, ""));
    }

    @Test
    @DisplayName("childOf: the two ways a filename escapes its directory")
    void childOfRefusesToEscape() {
        Path base = Path.of("/srv/up");
        assertThrows(IllegalArgumentException.class, () -> Solution.childOf(base, "/etc/passwd"));
        assertThrows(IllegalArgumentException.class, () -> Solution.childOf(base, "../etc/passwd"));
        assertEquals(Path.of("/etc/passwd"), base.resolve("/etc/passwd"),
                "this is what plain resolve does — the base simply disappears");
        assertEquals(Path.of("/srv/etc/passwd"), base.resolve("../etc/passwd").normalize(),
                "and this is the same hole without a leading slash — outside the base either way");
    }

    @Test
    @DisplayName("Path: endsWith compares name elements, not string suffixes")
    void pathEndsWithIsNotStringEndsWith() {
        Path p = Path.of("/a/b/notes.txt");
        assertFalse(p.endsWith(".txt"), "the surprise: this is not a suffix test");
        assertTrue(p.endsWith("notes.txt"));
        assertTrue(p.endsWith("b/notes.txt"));
        assertTrue(p.getFileName().toString().endsWith(".txt"), "what you actually wanted");
        assertNotEquals(Path.of("a/b"), Path.of("a/./b"), "Path.equals is lexical, not semantic");
    }

    @Test
    @DisplayName("writeText: creates the parents, and replaces the contents")
    void writeTextCreatesDirectories(@TempDir Path tmp) throws Exception {
        Path deep = tmp.resolve("a/b/c.txt");
        Solution.writeText(deep, "hello");
        assertTrue(Files.isDirectory(tmp.resolve("a/b")));
        assertEquals("hello", Solution.readText(deep));

        Solution.writeText(deep, "second");
        assertEquals("second", Solution.readText(deep), "written, not appended");
    }

    @Test
    @DisplayName("readText: a missing file is an exception, not an empty string")
    void readTextThrowsForMissingFiles(@TempDir Path tmp) throws Exception {
        Path empty = tmp.resolve("empty.txt");
        Solution.writeText(empty, "");
        assertEquals("", Solution.readText(empty), "a genuinely empty file");
        assertThrows(NoSuchFileException.class, () -> Solution.readText(tmp.resolve("gone.txt")),
                "which the caller must be able to tell apart from the line above");
    }

    @Test
    @DisplayName("readText and writeText round-trip non-ASCII, because both are UTF-8")
    void textRoundTripsUtf8(@TempDir Path tmp) throws Exception {
        Path f = tmp.resolve("u.txt");
        Solution.writeText(f, "café — 🙂");
        assertEquals("café — 🙂", Solution.readText(f));
        assertEquals(14, Files.size(f), "nine characters of text, fourteen bytes on disk");
    }

    @Test
    @DisplayName("firstLines: lazy, so a limit really is a limit")
    void firstLinesTakesOnlyWhatItNeeds(@TempDir Path tmp) throws Exception {
        Path f = tmp.resolve("three.txt");
        Solution.writeText(f, "line one\nline two\nline three\n");
        assertEquals(List.of("line one", "line two"), Solution.firstLines(f, 2));
        assertEquals(List.of("line one", "line two", "line three"), Solution.firstLines(f, 9),
                "asking for more than there is gives you what there is");
        assertEquals(List.of(), Solution.firstLines(f, 0));
    }

    @Test
    @DisplayName("firstLines: Files.lines fails at once for a missing file")
    void firstLinesThrowsForMissingFiles(@TempDir Path tmp) {
        assertThrows(NoSuchFileException.class, () -> Solution.firstLines(tmp.resolve("gone.txt"), 1),
                "the stream is never created, so there is nothing to close");
    }

    @Test
    @DisplayName("relativePaths: files only, sorted, with / on every platform")
    void relativePathsWalksTheTree(@TempDir Path tmp) throws Exception {
        Solution.writeText(tmp.resolve("a.txt"), "a");
        Solution.writeText(tmp.resolve("sub/b.txt"), "b");
        Solution.writeText(tmp.resolve("sub/deep/c.txt"), "c");
        Files.createDirectories(tmp.resolve("empty"));

        assertEquals(List.of("a.txt", "sub/b.txt", "sub/deep/c.txt"), Solution.relativePaths(tmp));
        assertTrue(Files.isDirectory(tmp.resolve("empty")), "the empty directory is there, and is not listed");
    }

    @Test
    @DisplayName("relativePaths: an empty root has nothing in it, which is not an error")
    void relativePathsOnAnEmptyRoot(@TempDir Path tmp) throws Exception {
        assertEquals(List.of(), Solution.relativePaths(tmp), "walk yields the root itself, and it is not a file");
    }

    @Test
    @DisplayName("deleteRecursively: children before parents, or the delete throws")
    void deleteRecursivelyRemovesTheTree(@TempDir Path tmp) throws Exception {
        Path root = tmp.resolve("tree");
        Solution.writeText(root.resolve("a.txt"), "a");
        Solution.writeText(root.resolve("sub/b.txt"), "b");

        assertThrows(DirectoryNotEmptyException.class, () -> Files.delete(root),
                "which is why the order matters");
        assertTrue(Solution.deleteRecursively(root));
        assertFalse(Files.exists(root));
    }

    @Test
    @DisplayName("deleteRecursively: nothing to delete is false, not an exception")
    void deleteRecursivelyToleratesMissingRoots(@TempDir Path tmp) throws Exception {
        assertFalse(Solution.deleteRecursively(tmp.resolve("never-existed")));
        Path single = tmp.resolve("one.txt");
        Solution.writeText(single, "x");
        assertTrue(Solution.deleteRecursively(single), "a plain file is a tree of one");
        assertFalse(Files.exists(single));
    }

    @Test
    @DisplayName("byteLength: characters, code points and bytes are three different counts")
    void byteLengthCountsBytes() {
        assertEquals(4, "café".length(), "four characters");
        assertEquals(5, Solution.byteLength("café", UTF_8));
        assertEquals(4, Solution.byteLength("café", ISO_8859_1));
        assertEquals(4, Solution.byteLength("café", US_ASCII), "the é became a question mark");
        assertEquals(0, Solution.byteLength("", UTF_8));
    }

    @Test
    @DisplayName("byteLength: an emoji is two chars, four UTF-8 bytes and one \"?\"")
    void byteLengthHandlesSurrogatePairs() {
        assertEquals(2, "🙂".length(), "one code point, two UTF-16 chars");
        assertEquals(1, "🙂".codePointCount(0, 2));
        assertEquals(4, Solution.byteLength("🙂", UTF_8));
        assertEquals(1, Solution.byteLength("🙂", US_ASCII), "the whole thing collapsed to one byte");
    }

    @Test
    @DisplayName("readWithCharset: the wrong charset either throws or corrupts")
    void readWithCharsetIsStrict(@TempDir Path tmp) throws Exception {
        Path f = tmp.resolve("u.txt");
        Solution.writeText(f, "café");
        assertEquals("café", Solution.readWithCharset(f, UTF_8));
        assertThrows(MalformedInputException.class, () -> Solution.readWithCharset(f, US_ASCII),
                "strict decoding: these bytes are not ASCII");
        assertEquals("cafÃ©", Solution.readWithCharset(f, ISO_8859_1),
                "ISO-8859-1 cannot fail, so it corrupts instead — this is the mojibake signature");
        assertEquals("caf\uFFFD\uFFFD", new String(Files.readAllBytes(f), US_ASCII),
                "and `new String` replaces rather than throwing, which is why it is the wrong tool");
    }
}
