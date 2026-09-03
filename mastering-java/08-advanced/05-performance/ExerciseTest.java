import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.IntStream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 *
 * Nothing here asserts on elapsed time. Every complexity claim is checked by
 * counting the work, which is reproducible on a loaded machine.
 */
class ExerciseTest {

    private static int[] distinct(int n) {
        return IntStream.range(0, n).toArray();
    }

    private static List<String> words(String prefix, int n) {
        return IntStream.range(0, n).mapToObj(i -> prefix + i).toList();
    }

    @Test
    @DisplayName("sumOfSquares: the multiplication must widen before it wraps")
    void sumOfSquaresWidens() {
        assertEquals(14L, Solution.sumOfSquares(new int[] {1, 2, 3}));
        assertEquals(0L, Solution.sumOfSquares(new int[0]));
        assertEquals(2147488281L, Solution.sumOfSquares(new int[] {46341}),
                "int * int is an int, and 46341 * 46341 overflows before any assignment happens");
        assertEquals(-2147479015, 46341 * 46341, "which is what plain int arithmetic gives you");
    }

    @Test
    @DisplayName("firstDuplicate: found, and the scan stops there")
    void firstDuplicateStopsEarly() {
        Solution.Counted<Integer> found = Solution.firstDuplicate(new int[] {1, 2, 3, 1});
        assertEquals(1, found.value());
        assertEquals(4, found.steps(), "four elements read; a nested loop would have read seven");

        assertEquals(5, Solution.firstDuplicate(new int[] {5, 5}).value());
        assertEquals(2, Solution.firstDuplicate(new int[] {5, 5}).steps());
    }

    @Test
    @DisplayName("firstDuplicate: no duplicate at all, and the empty case")
    void firstDuplicateAbsent() {
        Solution.Counted<Integer> none = Solution.firstDuplicate(new int[] {1, 2, 3});
        assertNull(none.value());
        assertEquals(3, none.steps());

        Solution.Counted<Integer> empty = Solution.firstDuplicate(new int[0]);
        assertNull(empty.value());
        assertEquals(0, empty.steps());
    }

    @Test
    @DisplayName("firstDuplicate: linear at n = 20 000, not quadratic")
    void firstDuplicateIsLinear() {
        assertEquals(20_000, Solution.firstDuplicate(distinct(20_000)).steps(),
                "n steps. The nested-loop version would take about 200 million");
    }

    @Test
    @DisplayName("stepsAtSizes: doubling n doubles the work")
    void stepsScaleLinearly() {
        long[] steps = Solution.stepsAtSizes(new int[] {1_000, 2_000, 4_000});
        assertArrayEquals(new long[] {1_000L, 2_000L, 4_000L}, steps);
        assertEquals(2.0, (double) steps[1] / steps[0], 0.2, "linear, so the ratio is 2");
        assertEquals(2.0, (double) steps[2] / steps[1], 0.2, "quadratic would have made this 4");
        assertArrayEquals(new long[0], Solution.stepsAtSizes(new int[0]));
    }

    @Test
    @DisplayName("rangeSums: correct answers, including an empty range")
    void rangeSumsAnswers() {
        Solution.Counted<long[]> result = Solution.rangeSums(
                new long[] {1, 2, 3, 4},
                new int[][] {{0, 4}, {1, 3}, {2, 2}});
        assertArrayEquals(new long[] {10, 5, 0}, result.value());
        assertEquals(4, result.steps());

        assertArrayEquals(new long[] {7, 7}, Solution.rangeSums(new long[] {7}, new int[][] {{0, 1}, {0, 1}}).value());
        assertArrayEquals(new long[0], Solution.rangeSums(new long[0], new int[0][]).value());
    }

    @Test
    @DisplayName("rangeSums: 500 queries still read the data exactly once")
    void rangeSumsReadDataOnce() {
        long[] data = new long[1_000];
        java.util.Arrays.fill(data, 1L);
        int[][] queries = IntStream.range(0, 500)
                .mapToObj(i -> new int[] {i, i + 100})
                .toArray(int[][]::new);

        Solution.Counted<long[]> result = Solution.rangeSums(data, queries);
        assertEquals(100L, result.value()[0]);
        assertEquals(100L, result.value()[499]);
        assertEquals(1_000, result.steps(), "one pass; summing on demand would have been 50 000");
    }

    @Test
    @DisplayName("anyShared: index the first list, stop at the first hit in the second")
    void anySharedCounts() {
        Solution.Counted<Boolean> late = Solution.anyShared(List.of("a", "b"), List.of("c", "b"));
        assertTrue(late.value());
        assertEquals(4, late.steps());

        Solution.Counted<Boolean> early = Solution.anyShared(List.of("a", "b"), List.of("b", "c"));
        assertTrue(early.value());
        assertEquals(3, early.steps(), "the scan stopped as soon as it hit");

        Solution.Counted<Boolean> miss = Solution.anyShared(List.of("a", "b"), List.of("c", "d"));
        assertFalse(miss.value());
        assertEquals(4, miss.steps());
    }

    @Test
    @DisplayName("anyShared: empty inputs, and 400x400 without a nested loop")
    void anySharedIsLinear() {
        assertFalse(Solution.anyShared(List.of("a"), List.of()).value());
        assertEquals(1, Solution.anyShared(List.of("a"), List.of()).steps());
        assertEquals(0, Solution.anyShared(List.of(), List.of()).steps());

        Solution.Counted<Boolean> big = Solution.anyShared(words("left-", 400), words("right-", 400));
        assertFalse(big.value());
        assertEquals(800, big.steps(), "n + m. The nested loop would have been 160 000");
    }

    @Test
    @DisplayName("maxSubarraySum: one pass, and all-negative is not zero")
    void maxSubarraySumKadane() {
        Solution.Counted<Integer> classic = Solution.maxSubarraySum(new int[] {-2, 1, -3, 4, -1, 2, 1, -5, 4});
        assertEquals(6, classic.value(), "the run 4, -1, 2, 1");
        assertEquals(9, classic.steps());

        assertEquals(-1, Solution.maxSubarraySum(new int[] {-3, -1, -2}).value(),
                "non-empty, so the answer is the least bad single element");
        assertEquals(6, Solution.maxSubarraySum(new int[] {1, 2, 3}).value());
        assertEquals(0, Solution.maxSubarraySum(new int[0]).value());
        assertEquals(0, Solution.maxSubarraySum(new int[0]).steps());
    }

    @Test
    @DisplayName("maxSubarraySum: still one pass at n = 20 000")
    void maxSubarraySumIsLinear() {
        assertEquals(20_000, Solution.maxSubarraySum(distinct(20_000)).steps());
    }

    @Test
    @DisplayName("join: the separator goes between, not after")
    void joinJoins() {
        assertEquals("a-b-c", Solution.join(List.of("a", "b", "c"), "-"));
        assertEquals("a", Solution.join(List.of("a"), "-"));
        assertEquals("", Solution.join(List.of(), "-"));
        assertEquals("ab", Solution.join(List.of("a", "b"), ""));
    }

    @Test
    @DisplayName("join: 20 000 parts, which quadratic concatenation would not enjoy")
    void joinScales() {
        List<String> parts = new ArrayList<>(words("x", 20_000));
        String joined = Solution.join(parts, ",");
        assertEquals(19_999, joined.chars().filter(c -> c == ',').count());
        assertTrue(joined.startsWith("x0,x1,"));
        assertTrue(joined.endsWith(",x19999"));
    }

    @Test
    @DisplayName("measureNanos: the warmup runs, and is not part of the number")
    void measureNanosWarmsUp() {
        AtomicInteger runs = new AtomicInteger();
        long elapsed = Solution.measureNanos(runs::incrementAndGet, 100, 50);

        assertEquals(150, runs.get(), "warmup plus timed — the warmup is not optional");
        assertTrue(elapsed >= 0, "nanoTime differences are never negative");
    }

    @Test
    @DisplayName("measureNanos: zero reps is zero work, not an error")
    void measureNanosZero() {
        AtomicInteger runs = new AtomicInteger();
        assertTrue(Solution.measureNanos(runs::incrementAndGet, 0, 0) >= 0);
        assertEquals(0, runs.get());
    }
}
