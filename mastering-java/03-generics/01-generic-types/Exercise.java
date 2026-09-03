import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Part 03, Lesson 01 — Generic Types
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
 * `Transformer<I, O>` comes from support/ and is already written.
 */
class Solution {

    /**
     * A generic record. Records take type parameters exactly like classes do,
     * and the compiler generates `first()` and `second()` returning A and B.
     *
     *   new Pair<>("a", 1).first()   -> "a"
     *   new Pair<>("a", 1).second()  -> 1
     *
     * Nothing to implement in the header — the two methods below are yours.
     */
    record Pair<A, B>(A first, B second) {

        /**
         * The same pair with the components exchanged. Note that the return
         * type is Pair<B, A>: the type parameters swap places too.
         *
         *   new Pair<>("a", 1).swapped()  -> Pair[first=1, second=a]
         */
        Pair<B, A> swapped() {
            throw new UnsupportedOperationException("swapped: not implemented");
        }

        /**
         * Keep `first`, replace `second` with a value of some entirely new
         * type. This needs a type parameter that belongs to the *method*, not
         * to the record: the declaration starts `<C> Pair<A, C> withSecond(...)`.
         *
         *   new Pair<>("a", 1).withSecond(true)  -> Pair[first=a, second=true]
         */
        <C> Pair<A, C> withSecond(C next) {
            throw new UnsupportedOperationException("withSecond: not implemented");
        }
    }

    /**
     * A static factory for Pair. The point of writing one is that the caller
     * gets full inference from the arguments and never types the diamond.
     *
     *   pair("a", 1)      -> Pair<String, Integer>
     *   pair(1, 2)        -> Pair<Integer, Integer>
     *   pair(null, null)  -> Pair<Object, Object>
     */
    static <A, B> Pair<A, B> pair(A first, B second) {
        throw new UnsupportedOperationException("pair: not implemented");
    }

    /**
     * The first element of the list, or the fallback when the list is empty.
     *
     *   firstOr(List.of("a", "b"), "z")  -> "a"
     *   firstOr(List.of(), "z")          -> "z"
     *   firstOr(null, "z")               -> "z"
     *
     * A null element counts as present: firstOr on a list whose head is null
     * returns null, not the fallback.
     */
    static <T> T firstOr(List<T> items, T fallback) {
        throw new UnsupportedOperationException("firstOr: not implemented");
    }

    /**
     * A list holding `times` references to the same value.
     *
     *   repeat("a", 3)  -> ["a", "a", "a"]
     *   repeat("a", 0)  -> []
     *   repeat("a", -1) -> throws IllegalArgumentException
     *
     * The result must be mutable — the tests add to it. It holds the same
     * object n times, not n copies.
     */
    static <T> List<T> repeat(T value, int times) {
        throw new UnsupportedOperationException("repeat: not implemented");
    }

    /**
     * A map with keys and values exchanged. Two type parameters, and they
     * change places in the return type.
     *
     *   invert(Map.of("a", 1))          -> {1: "a"}
     *   invert(Map.of())                -> {}
     *
     * When two keys share a value one of them wins; the tests only check that
     * the result has one entry, not which.
     */
    static <K, V> Map<V, K> invert(Map<K, V> source) {
        throw new UnsupportedOperationException("invert: not implemented");
    }

    /**
     * Apply a Transformer to every element, preserving order.
     *
     *   mapEach(List.of("a", "bb"), s -> s.length())  -> [1, 2]
     *   mapEach(List.of(), f)                         -> []
     *
     * Notice how the two type parameters flow: the input list's element type
     * feeds the transformer's I, and its O becomes the result's element type.
     */
    static <I, O> List<O> mapEach(List<I> items, Transformer<I, O> transformer) {
        throw new UnsupportedOperationException("mapEach: not implemented");
    }

    /**
     * A Transformer that reports the length of a string. One abstract method
     * means Transformer is a functional interface, so a lambda will do.
     *
     *   lengthTransformer().apply("abc")  -> 3
     *   lengthTransformer().apply("")     -> 0
     */
    static Transformer<String, Integer> lengthTransformer() {
        throw new UnsupportedOperationException("lengthTransformer: not implemented");
    }

    /**
     * Put `intruder` into `strings` through a RAW List reference, and return
     * the very same list object.
     *
     *   List<String> names = new ArrayList<>(List.of("ok"));
     *   poison(names, 42);
     *   names.size()   -> 2
     *   names.get(0)   -> "ok"
     *   names.get(1)   -> ClassCastException
     *
     * This is deliberate sabotage: assign the parameter to a variable of the
     * raw type `List`, add through that, and the compiler will let it past with
     * an unchecked warning. Do NOT find a safe way to do it — the point is to
     * see the hole. Return the same object you were given.
     *
     * You will want @SuppressWarnings({"rawtypes", "unchecked"}) on the method
     * to keep the build quiet.
     */
    static List<String> poison(List<String> strings, Object intruder) {
        throw new UnsupportedOperationException("poison: not implemented");
    }
}
