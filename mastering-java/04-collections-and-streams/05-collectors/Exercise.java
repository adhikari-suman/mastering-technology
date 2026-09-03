import java.util.List;
import java.util.Map;
import java.util.stream.Collector;

/**
 * Part 04, Lesson 05 — Collectors
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
     * Collect the words into a list that refuses every mutation, and that
     * refuses to be built from a null element in the first place.
     *
     *   collectImmutable(List.of("a"))       -> ["a"], and .add throws
     *   collectImmutable(Arrays.asList("a", null))  -> throws NullPointerException
     *
     * Two of the three ways to end up with a List behave differently on that
     * second line. Pick the Collectors factory, not Stream.toList().
     */
    static List<String> collectImmutable(List<String> words) {
        throw new UnsupportedOperationException("collectImmutable: not implemented");
    }

    /**
     * Join the words with ", " between them, "[" before and "]" after.
     *
     *   bracketJoin(List.of("ant", "bee"))  -> "[ant, bee]"
     *   bracketJoin(List.of("ant"))         -> "[ant]"
     *   bracketJoin(List.of())              -> "[]"
     *
     * Note the empty case: the prefix and suffix are emitted even when there is
     * nothing between them.
     */
    static String bracketJoin(List<String> words) {
        throw new UnsupportedOperationException("bracketJoin: not implemented");
    }

    /**
     * How many words start with each letter. Empty words are skipped.
     *
     *   countByInitial(List.of("ant", "ape", "bee"))  -> {a=2, b=1}
     *   countByInitial(List.of())                     -> {}
     *
     * Watch the value type in the signature — the downstream collector for
     * "how many" does not hand back an Integer, and a Long is not equal to an
     * Integer of the same size.
     */
    static Map<Character, Long> countByInitial(List<String> words) {
        throw new UnsupportedOperationException("countByInitial: not implemented");
    }

    /**
     * Group the words by first letter; inside each group keep only the words
     * with at least `minLength` characters, upper-cased.
     *
     *   shoutingLongWordsByInitial(List.of("apple","avocado","fig","banana"), 6)
     *       -> {a=["AVOCADO"], b=["BANANA"], f=[]}
     *
     * Look hard at that `f=[]`. Every letter that appeared in the input gets a
     * key, even when nothing survived the filter — which means the filtering
     * has to happen DOWNSTREAM of the grouping, not before it. The result must
     * iterate its keys in sorted order.
     */
    static Map<Character, List<String>> shoutingLongWordsByInitial(List<String> words, int minLength) {
        throw new UnsupportedOperationException("shoutingLongWordsByInitial: not implemented");
    }

    /**
     * Split the words into the ones at least `minLength` long and the rest,
     * keeping input order in both.
     *
     *   partitionLongWords(List.of("ant","avocado"), 6)  -> {false=["ant"], true=["avocado"]}
     *   partitionLongWords(List.of(), 6)                 -> {false=[], true=[]}
     *
     * The second line is the guarantee this collector makes and groupingBy
     * cannot: both keys are always there, so get(true) never returns null.
     */
    static Map<Boolean, List<String>> partitionLongWords(List<String> words, int minLength) {
        throw new UnsupportedOperationException("partitionLongWords: not implemented");
    }

    /**
     * Index the words by their first letter, assuming the letters are unique.
     *
     *   indexByInitial(List.of("ant", "bee"))  -> {a="ant", b="bee"}
     *   indexByInitial(List.of("ant", "ape"))  -> throws IllegalStateException
     *
     * Use the two-argument Collectors.toMap and let the collision blow up. The
     * exception message starts with "Duplicate key".
     */
    static Map<Character, String> indexByInitial(List<String> words) {
        throw new UnsupportedOperationException("indexByInitial: not implemented");
    }

    /**
     * The same index, but when two words share a first letter the EARLIER one
     * in the input wins.
     *
     *   indexByInitialFirstWins(List.of("ant", "ape", "bee"))  -> {a="ant", b="bee"}
     *   indexByInitialFirstWins(List.of())                     -> {}
     *
     * One more argument than the method above. Getting the argument order of
     * the merge function backwards gives you "last wins" and no error.
     */
    static Map<Character, String> indexByInitialFirstWins(List<String> words) {
        throw new UnsupportedOperationException("indexByInitialFirstWins: not implemented");
    }

    /**
     * A one-line summary, computed in a SINGLE pass over the stream.
     *
     *   summary(List.of("ant", "bee"))  -> "2 words, 6 letters"
     *   summary(List.of())              -> "0 words, 0 letters"
     *
     * Two collectors and a function that fuses their results — there is a
     * factory in Collectors that takes exactly those three things. Streaming
     * the list twice would also pass the tests, and is the thing being trained
     * out of you here.
     */
    static String summary(List<String> words) {
        throw new UnsupportedOperationException("summary: not implemented");
    }

    /**
     * The mean word length.
     *
     *   meanLength(List.of("a", "bbb"))  -> 2.0
     *   meanLength(List.of())            -> 0.0
     *
     * Use the Collectors factory for averages. Compare that empty case with
     * IntStream.average() from the previous lesson, which returns an empty
     * OptionalDouble for the same input — two APIs in the same JDK making
     * opposite calls about what the mean of nothing is.
     */
    static double meanLength(List<String> words) {
        throw new UnsupportedOperationException("meanLength: not implemented");
    }

    /**
     * A Collector — not a method that does the work, an actual reusable
     * Collector — that concatenates the first character of every word.
     *
     *   Stream.of("ant","bee").collect(initialsCollector())  -> "ab"
     *   Stream.of().collect(initialsCollector())             -> ""
     *
     * Empty words contribute nothing. Build it with Collector.of and its four
     * functions: supplier, accumulator, combiner, finisher. The tests also hand
     * it to groupingBy as a downstream collector, which is the whole reason to
     * write a Collector rather than a helper method.
     */
    static Collector<String, ?, String> initialsCollector() {
        throw new UnsupportedOperationException("initialsCollector: not implemented");
    }
}
