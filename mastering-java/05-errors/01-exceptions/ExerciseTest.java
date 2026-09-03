import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("classify: unchecked is Error or RuntimeException, and nothing else")
    void classifySplitsTheHierarchy() {
        assertEquals("error", Solution.classify(new StackOverflowError()));
        assertEquals("error", Solution.classify(new OutOfMemoryError()));
        assertEquals("unchecked", Solution.classify(new IllegalStateException()));
        assertEquals("unchecked", Solution.classify(new NullPointerException()));
        assertEquals("checked", Solution.classify(new IOException()));
        assertEquals("checked", Solution.classify(new Throwable()), "a bare Throwable is checked");
        assertEquals("none", Solution.classify(null));
    }

    @Test
    @DisplayName("fetchOr: an IOException becomes the fallback")
    void fetchOrFallsBack() {
        assertEquals("hi", Solution.fetchOr(() -> "hi", "?"));
        assertEquals("?", Solution.fetchOr(() -> { throw new IOException("disk gone"); }, "?"));
    }

    @Test
    @DisplayName("fetchOr: a bug is not a fallback case, so it propagates")
    void fetchOrDoesNotCatchEverything() {
        assertThrows(IllegalStateException.class,
                () -> Solution.fetchOr(() -> { throw new IllegalStateException("bug"); }, "?"),
                "catch (Exception e) would have swallowed this");
    }

    @Test
    @DisplayName("fetchQuietly: unchecked on the outside, original on the inside")
    void fetchQuietlyKeepsTheCause() {
        assertEquals("hi", Solution.fetchQuietly(() -> "hi"));
        IOException original = new IOException("disk gone");
        UncheckedIOException wrapper = assertThrows(UncheckedIOException.class,
                () -> Solution.fetchQuietly(() -> { throw original; }));
        assertEquals("could not fetch", wrapper.getMessage());
        assertSame(original, wrapper.getCause(), "wrapping must not throw the original away");
    }

    @Test
    @DisplayName("trace: on the happy path the catch is skipped and the finally is not")
    void traceHappyPath() {
        assertEquals(List.of("try", "no-throw", "finally", "after"), Solution.trace(() -> "hi"));
    }

    @Test
    @DisplayName("trace: on the failing path the finally still runs")
    void traceFailingPath() {
        assertEquals(List.of("try", "catch", "finally", "after"),
                Solution.trace(() -> { throw new IOException("x"); }));
    }

    @Test
    @DisplayName("finallyWins: a return in finally overrides the return in try")
    void finallyOverridesReturn() {
        assertEquals(2, Solution.finallyWins(), "the try computed 1 and then had it thrown away");
    }

    @Test
    @DisplayName("finallySwallows: a return in finally discards a pending exception")
    void finallyDiscardsException() {
        assertEquals(42, Solution.finallySwallows(),
                "an IllegalStateException was in flight and simply ceased to exist");
    }

    @Test
    @DisplayName("lookup: one catch clause handling two unrelated failures")
    void lookupMultiCatch() {
        String[] table = { "a", "b" };
        assertEquals("b", Solution.lookup(table, "1"));
        assertEquals("?", Solution.lookup(table, "5"), "ArrayIndexOutOfBoundsException");
        assertEquals("?", Solution.lookup(table, "-1"), "also ArrayIndexOutOfBoundsException");
        assertEquals("?", Solution.lookup(table, "x"), "NumberFormatException");
        assertEquals("?", Solution.lookup(table, null), "parseInt(null) is a NumberFormatException too");
    }

    @Test
    @DisplayName("lookup: a null table is a bug, not a bad request")
    void lookupDoesNotHideBugs() {
        assertThrows(NullPointerException.class, () -> Solution.lookup(null, "0"));
    }

    @Test
    @DisplayName("framesWithoutThrowing: the stack trace is captured by new, not by throw")
    void stackTraceCostIsInTheConstructor() {
        assertTrue(Solution.framesWithoutThrowing() > 0);
        assertTrue(new RuntimeException("never thrown").getStackTrace().length > 0,
                "same in plain Java: constructing one already walked the stack");
    }

    @Test
    @DisplayName("relay: rethrowing the caught object keeps the original stack trace")
    void relayRethrowsSameInstance() throws Exception {
        List<String> log = new ArrayList<>();
        assertEquals("hi", Solution.relay(() -> "hi", log));
        assertEquals(List.of(), log);

        IOException boom = new IOException("disk gone");
        IOException caught = assertThrows(IOException.class,
                () -> Solution.relay(() -> { throw boom; }, log));
        assertSame(boom, caught, "the same object came back out, frames intact");
        assertEquals(List.of("logged: disk gone"), log);
    }

}
