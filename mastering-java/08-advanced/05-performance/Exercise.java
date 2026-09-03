import java.util.List;

/**
 * Part 08, Lesson 05 — Performance
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
 * Not one test in this lesson asserts on elapsed time. They assert on STEPS —
 * how many elements of the input your code read — because that is the
 * complexity, and it is the same number on a busy machine as on an idle one.
 */
class Solution {

    /**
     * A result together with the amount of work it took.
     *
     * `steps` is defined the same way everywhere in this lesson: one step per
     * READ of an element of the input. Reading data[i] is a step. Building a
     * HashSet, adding to a StringBuilder and doing arithmetic are not.
     *
     * You do not implement this — it is here so the tests can talk about work
     * without a stopwatch.
     */
    record Counted<T>(T value, long steps) {}

    /**
     * The sum of the squares of every element.
     *
     *   sumOfSquares([1, 2, 3])   -> 14
     *   sumOfSquares([])          -> 0
     *   sumOfSquares([46341])     -> 2147488281
     *
     * Watch the width. 46341 squared does not fit in an int, and int
     * multiplication wraps silently — so where the widening happens decides
     * whether the last example is right or is -2147479015.
     *
     * The method returns its result rather than storing it anywhere, which is
     * also the shape a hand-rolled benchmark needs: a value nobody reads is a
     * value the JIT deletes.
     */
    static long sumOfSquares(int[] data) {
        throw new UnsupportedOperationException("sumOfSquares: not implemented");
    }

    /**
     * The first value that has already been seen earlier in the array, in one
     * pass.
     *
     *   firstDuplicate([1, 2, 3, 1])    -> value 1,    steps 4
     *   firstDuplicate([5, 5])          -> value 5,    steps 2
     *   firstDuplicate([1, 2, 3])       -> value null, steps 3
     *   firstDuplicate([])              -> value null, steps 0
     *
     * `value` is null when every element is distinct.
     *
     * Steps must equal the number of elements you actually read, so stop at the
     * duplicate rather than scanning on. A nested loop would give 7 steps for
     * the first example instead of 4, and n²/2 instead of n on a big one — the
     * tests check exactly this.
     */
    static Counted<Integer> firstDuplicate(int[] data) {
        throw new UnsupportedOperationException("firstDuplicate: not implemented");
    }

    /**
     * Answer many range-sum queries over the same data.
     *
     * Each query is {from, toExclusive}; the answer is the sum of
     * data[from] .. data[toExclusive - 1].
     *
     *   rangeSums([1, 2, 3, 4], [{0, 4}, {1, 3}, {2, 2}])
     *       -> value [10, 5, 0], steps 4
     *   rangeSums([], [])           -> value [], steps 0
     *   rangeSums([7], [{0, 1}, {0, 1}]) -> value [7, 7], steps 1
     *
     * Steps must equal data.length EXACTLY, however many queries arrive:
     * summing each range on demand reads the data over and over, and the point
     * of this method is the one-pass prefix table that does not. The tests use
     * 500 queries over 1000 elements, where the difference is 1000 steps
     * against 50 000.
     *
     * Assume the queries are in range and from <= toExclusive.
     */
    static Counted<long[]> rangeSums(long[] data, int[][] queries) {
        throw new UnsupportedOperationException("rangeSums: not implemented");
    }

    /**
     * Whether the two lists have any element in common.
     *
     *   anyShared(["a", "b"], ["c", "b"])  -> value true,  steps 4
     *   anyShared(["a", "b"], ["b", "c"])  -> value true,  steps 3
     *   anyShared(["a", "b"], ["c", "d"])  -> value false, steps 4
     *   anyShared(["a"], [])               -> value false, steps 1
     *   anyShared([], [])                  -> value false, steps 0
     *
     * Index the FIRST list, then scan the second and stop at the first hit. So
     * steps is first.size() plus however far into the second you had to look.
     * Do not add an early exit for an empty first list; the step counts above
     * are what a straightforward two-phase implementation produces.
     *
     * The nested loop gives the right answer with first.size() * second.size()
     * steps. The tests use 400 elements each, where that is 160 000 against 800.
     */
    static Counted<Boolean> anyShared(List<String> first, List<String> second) {
        throw new UnsupportedOperationException("anyShared: not implemented");
    }

    /**
     * The largest sum of any non-empty contiguous run of elements.
     *
     *   maxSubarraySum([-2, 1, -3, 4, -1, 2, 1, -5, 4]) -> value 6,  steps 9
     *   maxSubarraySum([-3, -1, -2])                    -> value -1, steps 3
     *   maxSubarraySum([1, 2, 3])                       -> value 6,  steps 3
     *   maxSubarraySum([])                              -> value 0,  steps 0
     *
     * Steps must equal data.length: this is doable in a single pass, keeping
     * only "the best run ending here" and "the best run seen so far". Trying
     * every start and end is O(n²) and will fail the step assertion.
     *
     * The all-negative case is why "the best run so far" cannot start at 0.
     */
    static Counted<Integer> maxSubarraySum(int[] data) {
        throw new UnsupportedOperationException("maxSubarraySum: not implemented");
    }

    /**
     * Join the parts with a separator between them.
     *
     *   join(["a", "b", "c"], "-")  -> "a-b-c"
     *   join(["a"], "-")            -> "a"
     *   join([], "-")               -> ""
     *   join(["a", "b"], "")        -> "ab"
     *
     * Use a StringBuilder. `result = result + part` inside a loop copies every
     * character written so far on each iteration, which is O(n²) in bytes
     * moved — the one classic allocation problem the JIT has never fixed. The
     * tests join 20 000 parts, which a quadratic version would survive but not
     * enjoy.
     */
    static String join(List<String> parts, String separator) {
        throw new UnsupportedOperationException("join: not implemented");
    }

    /**
     * Run a task warmupReps times untimed, then timedReps times with the clock
     * running, and return the total elapsed nanoseconds of the timed phase.
     *
     *   measureNanos(task, 100, 50)  -> runs the task 150 times, times the last 50
     *   measureNanos(task, 0, 0)     -> 0 (or as close as the clock allows)
     *
     * Use System.nanoTime, never System.currentTimeMillis: the wall clock can
     * step backwards when the machine syncs time, and a negative duration in a
     * log is a genuinely confusing afternoon.
     *
     * The warmup is not politeness. The first few thousand runs of anything are
     * interpreted, so a measurement without one is a measurement of the wrong
     * implementation.
     *
     * The result must never be negative.
     */
    static long measureNanos(Runnable task, int warmupReps, int timedReps) {
        throw new UnsupportedOperationException("measureNanos: not implemented");
    }

    /**
     * The measurement harness: how much work firstDuplicate does as n grows.
     *
     * For each n in sizes, build the array [0, 1, 2, ..., n-1] — no duplicates,
     * which is firstDuplicate's worst case — run firstDuplicate on it, and
     * collect the step counts.
     *
     *   stepsAtSizes([2, 4, 8])  -> [2, 4, 8]
     *   stepsAtSizes([])         -> []
     *
     * This is the whole point of the lesson in one method. Doubling n doubles
     * the number: linear. Had firstDuplicate been quadratic, doubling n would
     * roughly quadruple it — and you would see that on any machine, at any
     * load, without ever starting a clock.
     */
    static long[] stepsAtSizes(int[] sizes) {
        throw new UnsupportedOperationException("stepsAtSizes: not implemented");
    }
}
