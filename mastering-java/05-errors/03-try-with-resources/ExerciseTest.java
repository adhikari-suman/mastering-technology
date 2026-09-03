import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    private static List<String> messagesOf(Throwable[] suppressed) {
        return Arrays.stream(suppressed).map(Throwable::getMessage).toList();
    }

    @Test
    @DisplayName("Probe: an AutoCloseable whose close() narrows the throws clause to nothing")
    void probeIsAResource() throws Exception {
        assertEquals(0, Solution.Probe.class.getMethod("close").getExceptionTypes().length,
                "AutoCloseable.close() declares throws Exception; an override may narrow it away");

        List<String> log = new ArrayList<>();
        try (Solution.Probe p = new Solution.Probe("a", log, false)) {
            p.use();
        }
        assertEquals(List.of("open:a", "use:a", "close:a"), log);
    }

    @Test
    @DisplayName("closeOrder: resources close in the reverse of the order they were opened")
    void closesInReverse() {
        List<String> log = new ArrayList<>();
        Solution.closeOrder(log);
        assertEquals(List.of("open:a", "open:b", "use:a", "use:b", "close:b", "close:a"), log,
                "b was opened last, so b is closed first — it may depend on a");
    }

    @Test
    @DisplayName("closeBeforeCatch: the resource is closed before the catch block runs")
    void closeRunsBeforeCatch() {
        List<String> log = new ArrayList<>();
        Solution.closeBeforeCatch(log);
        assertEquals(List.of("open:a", "body", "close:a", "catch", "finally"), log,
                "so the catch block cannot use the resource it is reporting on");
    }

    @Test
    @DisplayName("bodyWinsOverClose: the body's exception is the one that escapes")
    void bodyExceptionWins() {
        List<String> log = new ArrayList<>();
        IllegalStateException e = assertThrows(IllegalStateException.class,
                () -> Solution.bodyWinsOverClose(log));
        assertEquals("body", e.getMessage(), "the real failure, not the cleanup noise");
        assertEquals(List.of("open:a", "open:b", "body", "close:b", "close:a"), log,
                "both closes were still attempted");
    }

    @Test
    @DisplayName("bodyWinsOverClose: the close failures survive as suppressed exceptions")
    void closeFailuresAreSuppressed() {
        List<String> log = new ArrayList<>();
        IllegalStateException e = assertThrows(IllegalStateException.class,
                () -> Solution.bodyWinsOverClose(log));
        assertEquals(2, e.getSuppressed().length);
        assertEquals(List.of("close:b", "close:a"), messagesOf(e.getSuppressed()),
                "in close order — nothing was thrown away");

        RuntimeException byHand = new RuntimeException("main");
        byHand.addSuppressed(new IllegalStateException("secondary"));
        assertEquals(1, byHand.getSuppressed().length,
                "try-with-resources is just calling addSuppressed for you");
    }

    @Test
    @DisplayName("closeFailsAlone: with no body failure, the close failure is the failure")
    void closeFailureEscapesOnItsOwn() {
        List<String> log = new ArrayList<>();
        IllegalStateException e = assertThrows(IllegalStateException.class,
                () -> Solution.closeFailsAlone(log));
        assertEquals("close:a", e.getMessage());
        assertEquals(0, e.getSuppressed().length);
        assertEquals(List.of("open:a", "body", "close:a"), log);
    }

    @Test
    @DisplayName("finallyCloseBug: the cleanup failure replaces the real one")
    void finallyCloseHidesTheRealError() {
        List<String> log = new ArrayList<>();
        IllegalStateException e = assertThrows(IllegalStateException.class,
                () -> Solution.finallyCloseBug(log));
        assertEquals("close:a", e.getMessage(),
                "the body threw \"body\" first, and this is not it");
        assertEquals(0, e.getSuppressed().length,
                "nowhere to look for the exception that actually mattered");
        assertEquals(List.of("open:a", "body", "close:a"), log);
    }

    @Test
    @DisplayName("useExisting: a try-with-resources header may name an effectively-final variable")
    void resourceFromAVariable() {
        List<String> log = new ArrayList<>();
        Solution.Probe probe = new Solution.Probe("a", log, false);
        Solution.useExisting(probe);
        assertEquals(List.of("open:a", "use:a", "close:a"), log);
    }

    @Test
    @DisplayName("nullResource: a null resource is skipped, not dereferenced")
    void nullResourceIsSkipped() {
        List<String> log = new ArrayList<>();
        Solution.nullResource(log);
        assertEquals(List.of("body"), log, "no NullPointerException from the implicit close");
    }

    @Test
    @DisplayName("readLines: a real Closeable, closed for you")
    void readLinesReads() throws Exception {
        assertEquals(List.of("a", "b"), Solution.readLines("a\nb\n"));
        assertEquals(List.of("a", "b"), Solution.readLines("a\nb"), "no trailing newline needed");
    }

    @Test
    @DisplayName("readLines: the empty edges")
    void readLinesEdges() throws Exception {
        assertEquals(List.of(), Solution.readLines(""));
        assertEquals(List.of(""), Solution.readLines("\n"), "one line, and it is empty");
        assertEquals(List.of("a", "", "b"), Solution.readLines("a\n\nb"));
    }

}
