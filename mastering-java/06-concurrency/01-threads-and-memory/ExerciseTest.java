import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("parallelSum: the same total however many threads split the work")
    void parallelSumTotals() throws Exception {
        int[] values = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        assertEquals(55L, Solution.parallelSum(values, 1));
        assertEquals(55L, Solution.parallelSum(values, 3), "slices need not divide evenly");
        assertEquals(55L, Solution.parallelSum(values, 10));
        assertEquals(55L, Solution.parallelSum(values, 32), "more threads than elements is fine");
    }

    @Test
    @DisplayName("parallelSum: empty input, and a total that does not fit in an int")
    void parallelSumEdges() throws Exception {
        assertEquals(0L, Solution.parallelSum(new int[0], 4));
        assertEquals(7L, Solution.parallelSum(new int[] {7}, 4));
        assertEquals(4294967294L,
                Solution.parallelSum(new int[] {Integer.MAX_VALUE, Integer.MAX_VALUE}, 2),
                "accumulate in long, or this wraps to -2");
        assertEquals(-2, Integer.MAX_VALUE + Integer.MAX_VALUE, "what an int accumulator would give you");
    }

    @Test
    @DisplayName("parallelSum: fewer than one thread is a programming error")
    void parallelSumRejectsZeroThreads() {
        assertThrows(IllegalArgumentException.class, () -> Solution.parallelSum(new int[] {1}, 0));
        assertThrows(IllegalArgumentException.class, () -> Solution.parallelSum(new int[] {1}, -1));
    }

    @Test
    @DisplayName("whoRuns: run() is not start() — it makes no thread at all")
    void whoRunsDistinguishes() throws Exception {
        assertEquals("caller", Solution.whoRuns(false), "t.run() is a plain method call");
        assertEquals("other", Solution.whoRuns(true), "only t.start() creates a thread");
    }

    @Test
    @DisplayName("racyCount: ++ on a shared int is read-add-write, so updates are lost")
    void racyCountLosesUpdates() throws Exception {
        assertEquals(1000, Solution.racyCount(1, 1000), "one thread cannot race itself");
        int total = Solution.racyCount(4, 100_000);
        assertTrue(total <= 400_000, "increments can be lost but never invented: got " + total);
        assertTrue(total > 0, "every write stores an earlier read plus one, so at least one lands: got " + total);
    }

    @Test
    @DisplayName("volatileCount: volatile fixes visibility and does nothing for atomicity")
    void volatileCountStillLosesUpdates() throws Exception {
        assertEquals(1000, Solution.volatileCount(1, 1000));
        int total = Solution.volatileCount(4, 100_000);
        assertTrue(total <= 400_000, "still a read-add-write gap: got " + total);
        assertTrue(total > 0, "volatile does not lose the count entirely either: got " + total);
    }

    @Test
    @DisplayName("unsharedCount: nothing shared, nothing lost — exactly, every time")
    void unsharedCountIsExact() throws Exception {
        assertEquals(400_000, Solution.unsharedCount(4, 100_000));
        assertEquals(400_000, Solution.unsharedCount(4, 100_000), "and again");
        assertEquals(0, Solution.unsharedCount(0, 100_000), "no threads, no work");
        assertEquals(0, Solution.unsharedCount(4, 0));
    }

    @Test
    @DisplayName("handoff: join() publishes a plain field with no volatile in sight")
    void handoffPublishes() throws Exception {
        assertEquals("HI", Solution.handoff("hi"));
        assertEquals("", Solution.handoff(""));
    }

    @Test
    @DisplayName("uncaught: an exception does not cross the thread boundary")
    void uncaughtIsInvisibleToJoin() throws Exception {
        assertEquals("none", Solution.uncaught(() -> { }));
        assertEquals("IllegalStateException",
                Solution.uncaught(() -> { throw new IllegalStateException("boom"); }),
                "join() returned normally; only the handler ever saw this");
        assertEquals("ArithmeticException", Solution.uncaught(() -> {
            int zero = 0;
            int ignored = 1 / zero;
        }));
    }

    @Test
    @DisplayName("lifecycle: NEW then TERMINATED, and a Thread is single-use")
    void lifecycleStates() throws Exception {
        List<String> report = Solution.lifecycle();
        assertEquals(3, report.size());
        assertEquals("NEW", report.get(0), "a Thread object exists before any thread does");
        assertEquals("TERMINATED", report.get(1));
        assertEquals("IllegalThreadStateException", report.get(2), "you cannot restart a thread");
    }

    @Test
    @DisplayName("Config: the constructor copies, so a later mutation cannot reach it")
    void configCopiesIn() {
        List<String> tags = new ArrayList<>(List.of("a", "b"));
        Solution.Config config = new Solution.Config("db", tags);
        tags.add("c");
        assertEquals(List.of("a", "b"), config.tags(), "the caller still holds their own list");
        assertEquals("db", config.name());
    }

    @Test
    @DisplayName("Config: the copy is unmodifiable, and null is rejected outright")
    void configIsImmutable() {
        Solution.Config config = new Solution.Config("db", List.of("a"));
        assertThrows(UnsupportedOperationException.class, () -> config.tags().add("x"));
        assertThrows(NullPointerException.class, () -> new Solution.Config("db", null));
        assertEquals(config, new Solution.Config("db", List.of("a")), "records get equals for free");
        assertNotEquals(config, new Solution.Config("db", List.of("a", "b")));
    }
}
