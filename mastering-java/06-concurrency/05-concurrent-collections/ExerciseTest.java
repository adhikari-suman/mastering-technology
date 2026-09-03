import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    private static final List<String> WORDS = List.of("a", "b", "a", "c", "a", "b");

    @Test
    @DisplayName("tallyUnsafe: one thread cannot race itself, so the counts are exact")
    void tallyUnsafeSingleThreaded() throws Exception {
        assertEquals(Map.of("a", 3, "b", 2, "c", 1), Solution.tallyUnsafe(WORDS, 1));
        assertEquals(Map.of(), Solution.tallyUnsafe(List.of(), 4));
    }

    @Test
    @DisplayName("tallyUnsafe: get-then-put is check-then-act, so counts go missing")
    void tallyUnsafeLosesCounts() throws Exception {
        Map<String, Integer> counts = Solution.tallyUnsafe(WORDS, 4);
        assertEquals(Set.of("a", "b", "c"), counts.keySet(), "the keys survive; the numbers do not");
        assertTrue(counts.get("a") >= 1 && counts.get("a") <= 12, "at most 4 threads x 3 occurrences");
        assertTrue(counts.get("b") >= 1 && counts.get("b") <= 8);
        assertTrue(counts.get("c") >= 1 && counts.get("c") <= 4);
    }

    @Test
    @DisplayName("tally: merge does the read and the write as one operation")
    void tallyIsExact() throws Exception {
        assertEquals(Map.of("a", 12, "b", 8, "c", 4), Solution.tally(WORDS, 4));
        assertEquals(Map.of("a", 12, "b", 8, "c", 4), Solution.tally(WORDS, 4), "and again");
        assertEquals(Map.of("a", 3, "b", 2, "c", 1), Solution.tally(WORDS, 1));
        assertEquals(Map.of(), Solution.tally(List.of(), 4));
    }

    @Test
    @DisplayName("computeOnce: the second caller gets the first caller's value")
    void computeOnceCachesValue() {
        ConcurrentHashMap<String, String> cache = new ConcurrentHashMap<>();
        AtomicInteger loads = new AtomicInteger();
        assertEquals("loaded", Solution.computeOnce(cache, "k", () -> {
            loads.incrementAndGet();
            return "loaded";
        }));
        assertEquals("loaded", Solution.computeOnce(cache, "k", () -> {
            loads.incrementAndGet();
            return "different";
        }));
        assertEquals(1, loads.get(), "the supplier is not called for a key that is already there");
        assertEquals("other", Solution.computeOnce(cache, "j", () -> "other"));
        assertEquals(2, cache.size());
    }

    @Test
    @DisplayName("computeOnce: eight threads racing for one key still load it once")
    void computeOnceUnderContention() throws Exception {
        ConcurrentHashMap<String, String> cache = new ConcurrentHashMap<>();
        AtomicInteger loads = new AtomicInteger();
        Set<String> seen = ConcurrentHashMap.newKeySet();
        Thread[] threads = new Thread[8];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> seen.add(Solution.computeOnce(cache, "hot", () -> {
                loads.incrementAndGet();
                return "value-" + System.nanoTime();
            })));
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();
        }
        assertEquals(1, loads.get(), "computeIfAbsent holds the bin lock while the function runs");
        assertEquals(1, seen.size(), "so every caller sees the same value");
    }

    @Test
    @DisplayName("ConcurrentHashMap: no nulls, and no touching the map inside the function")
    void concurrentHashMapRules() {
        ConcurrentHashMap<String, String> map = new ConcurrentHashMap<>();
        assertThrows(NullPointerException.class, () -> map.put("k", null), "no null values");
        assertThrows(NullPointerException.class, () -> map.put(null, "v"), "no null keys");
        Map<String, String> plain = new HashMap<>();
        plain.put(null, null);
        assertEquals(1, plain.size(), "HashMap allows both, which is why get() there is ambiguous");
        assertThrows(IllegalStateException.class,
                () -> map.computeIfAbsent("k", key -> {
                    map.put("k", "sneaky");
                    return "value";
                }),
                "IllegalStateException: Recursive update");
    }

    @Test
    @DisplayName("firstWriterWins: putIfAbsent returns the value that was already there")
    void firstWriterWinsReturnsTheWinner() {
        ConcurrentHashMap<String, String> map = new ConcurrentHashMap<>();
        assertEquals("mine", Solution.firstWriterWins(map, "k", "mine"));
        assertEquals("mine", Solution.firstWriterWins(map, "k", "yours"), "the first writer keeps the slot");
        assertEquals("mine", map.get("k"));
        assertNull(map.putIfAbsent("fresh", "x"), "null is how putIfAbsent says 'it was absent'");
        assertEquals("x", map.putIfAbsent("fresh", "y"), "and non-null is the value that beat you");
    }

    @Test
    @DisplayName("iterateWhileMutating: fail-fast iterators throw on one thread too")
    void failFastIterators() {
        assertEquals("ConcurrentModificationException",
                Solution.iterateWhileMutating(new ArrayList<>(List.of("a", "b", "c"))),
                "nothing concurrent happened here at all");
        assertEquals("ConcurrentModificationException",
                Solution.iterateWhileMutating(new HashSet<>(List.of("a", "b", "c"))));
    }

    @Test
    @DisplayName("iterateWhileMutating: a copy-on-write iterator is a snapshot")
    void copyOnWriteSnapshots() {
        CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>(List.of("a", "b", "c"));
        assertEquals("visited=3", Solution.iterateWhileMutating(list), "the added element is not in the snapshot");
        assertEquals(4, list.size(), "but it really was added");
        assertEquals("visited=0", Solution.iterateWhileMutating(new CopyOnWriteArrayList<>()));
        assertThrows(UnsupportedOperationException.class, () -> list.iterator().remove(),
                "a snapshot iterator cannot remove from the list");
    }

    @Test
    @DisplayName("iterateWhileMutating: a weakly consistent iterator neither throws nor promises")
    void weaklyConsistentIterators() {
        Set<String> keys = ConcurrentHashMap.newKeySet();
        keys.addAll(List.of("a", "b", "c"));
        String result = Solution.iterateWhileMutating(keys);
        assertTrue(result.startsWith("visited="), "it must not throw; the count is deliberately unspecified: " + result);
        assertTrue(keys.contains("extra"));
    }

    @Test
    @DisplayName("whenFull: four ways to offer work to a queue with no room")
    void blockingQueueRefusals() throws Exception {
        assertEquals("IllegalStateException", Solution.whenFull("add"));
        assertEquals("false", Solution.whenFull("offer"));
        assertEquals("blocked", Solution.whenFull("put"), "put waits, which is what backpressure is");
        assertThrows(IllegalArgumentException.class, () -> Solution.whenFull("shove"));
    }

    @Test
    @DisplayName("processJobs: every job is processed exactly once")
    void processJobsBasics() throws Exception {
        assertEquals(14L, Solution.processJobs(List.of(1, 2, 3), 2, 4));
        assertEquals(0L, Solution.processJobs(List.of(), 2, 4));
        assertEquals(0L, Solution.processJobs(List.of(0, 0, 0), 3, 1));
        assertEquals(25L, Solution.processJobs(List.of(5), 4, 1), "more workers than jobs");
    }

    @Test
    @DisplayName("processJobs: a queue of two carries a thousand jobs by making the producer wait")
    void processJobsBackpressure() throws Exception {
        List<Integer> jobs = new ArrayList<>();
        for (int i = 1; i <= 1000; i++) {
            jobs.add(i);
        }
        assertEquals(333_833_500L, Solution.processJobs(jobs, 4, 2), "sum of the squares to 1000");
        assertEquals(333_833_500L, Solution.processJobs(jobs, 1, 2), "and with a single worker");
    }
}
