import java.util.List;
import java.util.stream.Gatherer;

/**
 * Part 04, Lesson 06 — Gatherers
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
 */
class Solution {

    /**
     * Chop the list into consecutive chunks of at most `size`.
     *
     *   batches(List.of("a","b","c","d","e"), 2)  -> [[a,b], [c,d], [e]]
     *   batches(List.of("a","b"), 5)              -> [[a,b]]
     *   batches(List.of(), 2)                     -> []
     *
     * One of the built-in gatherers does this. Note the second line: asking for
     * a chunk bigger than the stream does not give you nothing, it gives you
     * one short chunk. The chunks themselves are immutable.
     */
    static List<List<String>> batches(List<String> items, int size) {
        throw new UnsupportedOperationException("batches: not implemented");
    }

    /**
     * The sum of every consecutive window of `size` numbers.
     *
     *   slidingSums(List.of(1,2,3,4), 2)  -> [3, 5, 7]
     *   slidingSums(List.of(1,2,3,4), 3)  -> [6, 9]
     *   slidingSums(List.of(1,2), 5)      -> [3]
     *
     * A gatherer for the windows, and an ordinary stream operation for the
     * sums — the pipeline carries on after a gather like it does after a map.
     */
    static List<Integer> slidingSums(List<Integer> numbers, int size) {
        throw new UnsupportedOperationException("slidingSums: not implemented");
    }

    /**
     * The running total after each number.
     *
     *   runningTotals(List.of(1, 2, 3))  -> [1, 3, 6]
     *   runningTotals(List.of())         -> []
     *   runningTotals(List.of(5))        -> [5]
     *
     * Use Gatherers.scan. It emits one element per input element and does NOT
     * emit the starting value — which is why the empty case is empty.
     */
    static List<Integer> runningTotals(List<Integer> numbers) {
        throw new UnsupportedOperationException("runningTotals: not implemented");
    }

    /**
     * Everything joined into one String, with no separator.
     *
     *   concatenate(List.of("a", "b", "c"))  -> "abc"
     *   concatenate(List.of())               -> ""
     *
     * Use Gatherers.fold, which emits a ONE-element stream — even for an empty
     * input, where the one element is the starting value. Getting that single
     * element back out is the second half of the exercise.
     */
    static String concatenate(List<String> words) {
        throw new UnsupportedOperationException("concatenate: not implemented");
    }

    /**
     * Drop each element that is equal to the one immediately before it.
     * Non-adjacent repeats survive.
     *
     *   dedupeConsecutive(List.of("a","a","b","b","a"))  -> ["a", "b", "a"]
     *   dedupeConsecutive(List.of())                     -> []
     *
     * This is your first custom gatherer, and the transformation `map` and
     * `filter` cannot express: the decision depends on what came before. Use
     * Gatherer.ofSequential with an initializer holding the previous element
     * and an integrator that pushes only when it differs. Keep the state in the
     * initializer, not in a variable captured by the lambda.
     */
    static List<String> dedupeConsecutive(List<String> words) {
        throw new UnsupportedOperationException("dedupeConsecutive: not implemented");
    }

    /**
     * A Gatherer that emits every element up to AND INCLUDING the first one
     * greater than or equal to `threshold`, then stops the source.
     *
     *   Stream.of(1,2,3,4,5).gather(takeThrough(3))  -> [1, 2, 3]
     *   Stream.of(1,2).gather(takeThrough(9))        -> [1, 2]
     *
     * Note it returns the Gatherer, not the result: the tests apply it to an
     * INFINITE stream, which only terminates if the integrator returns false
     * once it is done. `takeWhile` cannot express this — it would drop the 3.
     */
    static Gatherer<Integer, ?, Integer> takeThrough(int threshold) {
        throw new UnsupportedOperationException("takeThrough: not implemented");
    }

    /**
     * The last `n` elements, in order.
     *
     *   tail(List.of("a","b","c","d"), 2)  -> ["c", "d"]
     *   tail(List.of("a"), 3)              -> ["a"]
     *   tail(List.of("a","b"), 0)          -> []
     *
     * Write a custom gatherer whose integrator pushes NOTHING — it only keeps a
     * bounded buffer — and whose finisher emits the buffer once the stream is
     * done. Gatherer.ofSequential has a three-argument overload for exactly
     * this shape.
     */
    static List<String> tail(List<String> items, int n) {
        throw new UnsupportedOperationException("tail: not implemented");
    }

    /**
     * Upper-case every word, using at most `concurrency` threads at a time.
     *
     *   mapConcurrently(List.of("ant","bee"), 4)  -> ["ANT", "BEE"]
     *   mapConcurrently(List.of(), 4)             -> []
     *
     * Use Gatherers.mapConcurrent. The output order is the INPUT order, not the
     * completion order — the gatherer buffers to guarantee that, which is most
     * of what it is for.
     */
    static List<String> mapConcurrently(List<String> words, int concurrency) {
        throw new UnsupportedOperationException("mapConcurrently: not implemented");
    }
}
