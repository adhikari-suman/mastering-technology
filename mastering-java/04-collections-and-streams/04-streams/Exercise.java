import java.util.List;
import java.util.Optional;
import java.util.OptionalDouble;
import java.util.stream.Stream;

/**
 * Part 04, Lesson 04 — Streams
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
     * Drop every blank word and upper-case what is left, in order.
     *
     *   shout(List.of("ant", "  ", "bee", ""))  -> ["ANT", "BEE"]
     *   shout(List.of())                        -> []
     *
     * "Blank" means empty or whitespace only — String has a method for exactly
     * that question, and it is not isEmpty.
     */
    static List<String> shout(List<String> words) {
        throw new UnsupportedOperationException("shout: not implemented");
    }

    /**
     * Flatten one level of nesting, keeping order.
     *
     *   flatten(List.of(List.of("a", "b"), List.of(), List.of("c")))
     *       -> ["a", "b", "c"]
     *   flatten(List.of())  -> []
     *
     * An inner list that is empty contributes nothing, without a special case.
     */
    static List<String> flatten(List<List<String>> nested) {
        throw new UnsupportedOperationException("flatten: not implemented");
    }

    /**
     * Unique words in natural sorted order.
     *
     *   distinctSorted(List.of("pear", "fig", "pear"))  -> ["fig", "pear"]
     *   distinctSorted(List.of())                       -> []
     *
     * Both operations here are STATEFUL: unlike map and filter they cannot pass
     * an element downstream the moment they see it. The README says what that
     * costs.
     */
    static List<String> distinctSorted(List<String> words) {
        throw new UnsupportedOperationException("distinctSorted: not implemented");
    }

    /**
     * A page of the list: drop the first `skip`, then take at most `take`.
     *
     *   page(List.of("a","b","c","d","e"), 1, 2)  -> ["b", "c"]
     *   page(List.of("a","b"), 5, 2)              -> []
     *   page(List.of("a","b"), 0, 99)             -> ["a", "b"]
     *   page(List.of("a","b"), 0, 0)              -> []
     *
     * Both arguments are non-negative. Neither operation complains when it runs
     * off the end.
     */
    static List<String> page(List<String> words, int skip, int take) {
        throw new UnsupportedOperationException("page: not implemented");
    }

    /**
     * Multiply every number together.
     *
     *   product(List.of(2, 3, 4))  -> 24
     *   product(List.of())         -> 1
     *   product(List.of(7))        -> 7
     *
     * Use the two-argument reduce, whose first argument is the identity for the
     * operation. Because the accumulator is an int, the answer wraps rather
     * than growing — that is not something to guard against here.
     */
    static int product(List<Integer> numbers) {
        throw new UnsupportedOperationException("product: not implemented");
    }

    /**
     * The longest word; the FIRST one when several tie.
     *
     *   longest(List.of("a", "bbb", "cc"))  -> Optional["bbb"]
     *   longest(List.of("aa", "bb"))        -> Optional["aa"]
     *   longest(List.of())                  -> Optional.empty
     *
     * Use the one-argument reduce. Its return type is why it exists: with no
     * identity to fall back on, an empty stream has no answer, and the API says
     * so in the type rather than by returning null.
     */
    static Optional<String> longest(List<String> words) {
        throw new UnsupportedOperationException("longest: not implemented");
    }

    /**
     * The total number of characters across every word.
     *
     *   totalLength(List.of("ab", "c"))  -> 3
     *   totalLength(List.of())           -> 0
     *
     * Go through a primitive stream rather than boxing an Integer per word.
     */
    static int totalLength(List<String> words) {
        throw new UnsupportedOperationException("totalLength: not implemented");
    }

    /**
     * The mean word length.
     *
     *   averageLength(List.of("ab", "cd"))   -> OptionalDouble.of(2.0)
     *   averageLength(List.of("a", "bbb"))   -> OptionalDouble.of(2.0)
     *   averageLength(List.of())             -> OptionalDouble.empty()
     *
     * Note that sum-of-nothing is 0 but mean-of-nothing is not a number at all,
     * and the primitive streams model that difference in their return types.
     * Don't compute it by hand; there is a terminal operation for it.
     */
    static OptionalDouble averageLength(List<String> words) {
        throw new UnsupportedOperationException("averageLength: not implemented");
    }

    /**
     * How many words the pipeline actually pulls through before it finds the
     * first one at least `minLength` characters long.
     *
     *   elementsSeenBeforeFirstMatch(List.of("a","bb","ccc","dddd"), 3)  -> 3
     *   elementsSeenBeforeFirstMatch(List.of("a","bb"), 3)               -> 2
     *   elementsSeenBeforeFirstMatch(List.of(), 3)                       -> 0
     *
     * Build a pipeline that maps (counting each element as it passes), filters
     * on the length, and takes the first match. Return the count.
     *
     * This is the one method in the lesson that puts a side effect inside a
     * stream, and it is here to MEASURE the stream rather than to compute with
     * it. Everywhere else, treat a counter in a lambda as a bug.
     */
    static int elementsSeenBeforeFirstMatch(List<String> words, int minLength) {
        throw new UnsupportedOperationException("elementsSeenBeforeFirstMatch: not implemented");
    }

    /**
     * Consume the stream once with toList(), then try to consume it a second
     * time, and report what happened.
     *
     *   attemptReuse(Stream.of("a"))  -> "IllegalStateException"
     *
     * Return the exception's simple class name if the second use throws, "ok"
     * if it somehow does not. There is no reset, no rewind, and no way to ask a
     * stream whether it is still good.
     */
    static String attemptReuse(Stream<String> stream) {
        throw new UnsupportedOperationException("attemptReuse: not implemented");
    }
}
