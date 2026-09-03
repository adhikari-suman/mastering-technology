import java.util.List;
import java.util.Map;
import java.util.SequencedMap;

/**
 * Part 04, Lesson 02 — Maps in Depth
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
     * Count how many times each word appears.
     *
     *   wordCount(List.of("a", "b", "a"))  -> {a=2, b=1}
     *   wordCount(List.of())               -> {}
     *
     * Write it with Map.merge and one statement in the loop. `containsKey`
     * followed by `get` followed by `put` is the version this method exists to
     * replace.
     */
    static Map<String, Integer> wordCount(List<String> words) {
        throw new UnsupportedOperationException("wordCount: not implemented");
    }

    /**
     * Bucket words by their first character, keeping input order inside each
     * bucket. Empty strings are skipped.
     *
     *   groupByInitial(List.of("ant", "bee", "ape"))
     *       -> {a=["ant", "ape"], b=["bee"]}
     *   groupByInitial(List.of("", "ox"))  -> {o=["ox"]}
     *
     * Write it with Map.computeIfAbsent. The result must iterate its keys in
     * sorted order, so choose the Map implementation accordingly.
     */
    static Map<Character, List<String>> groupByInitial(List<String> words) {
        throw new UnsupportedOperationException("groupByInitial: not implemented");
    }

    /**
     * Subtract one from the count stored under `key`, IN PLACE. When the count
     * would reach zero or below, remove the entry entirely. When the key is
     * absent, change nothing — do not create it. Return the same map.
     *
     *   decrementOrRemove({a=3}, "a")  -> {a=2}
     *   decrementOrRemove({a=1}, "a")  -> {}
     *   decrementOrRemove({a=1}, "z")  -> {a=1}
     *
     * All three cases are one call to Map.computeIfPresent. The removal falls
     * out of what the remapping function is allowed to return.
     */
    static Map<String, Integer> decrementOrRemove(Map<String, Integer> counts, String key) {
        throw new UnsupportedOperationException("decrementOrRemove: not implemented");
    }

    /**
     * Look up a key, falling back when the map has no mapping for it.
     *
     *   lookup({a=1}, "a", 9)     -> 1
     *   lookup({a=1}, "z", 9)     -> 9
     *   lookup({a=null}, "a", 9)  -> null
     *
     * That third line is not a typo. Use Map.getOrDefault and let it do exactly
     * what it does; the return type is Integer rather than int so that the
     * answer is expressible.
     */
    static Integer lookup(Map<String, Integer> map, String key, int fallback) {
        throw new UnsupportedOperationException("lookup: not implemented");
    }

    /**
     * Render a map as "key=value" pairs joined by ";", in the map's own
     * iteration order.
     *
     *   render(a LinkedHashMap holding b=2 then a=1)  -> "b=2;a=1"
     *   render(new TreeMap<>(Map.of("b", 2, "a", 1))) -> "a=1;b=2"
     *   render(Map.of())                              -> ""
     *
     * Walk entrySet() rather than keySet() — going back to the map for each
     * value hashes every key a second time for nothing.
     */
    static String render(Map<String, Integer> map) {
        throw new UnsupportedOperationException("render: not implemented");
    }

    /**
     * The map's keys, in whatever order that map iterates them.
     *
     *   keysInOrder(new LinkedHashMap<>(...b then a...))  -> ["b", "a"]
     *   keysInOrder(new TreeMap<>(...))                   -> ["a", "b"]
     *   keysInOrder(new HashMap<>(...))                   -> unspecified order
     *
     * One line. The interesting part is what the tests can and cannot assert
     * about the third case.
     */
    static List<String> keysInOrder(Map<String, Integer> map) {
        throw new UnsupportedOperationException("keysInOrder: not implemented");
    }

    /**
     * The first and last entries of a sequenced map, as "k=v..k=v".
     *
     *   bookends(b=2, a=1, c=3 in insertion order)  -> "b=2..c=3"
     *   bookends(single entry a=1)                  -> "a=1..a=1"
     *   bookends(empty)                             -> "empty"
     *
     * SequencedMap gives you firstEntry() and lastEntry() directly. Both return
     * null on an empty map rather than throwing.
     */
    static String bookends(SequencedMap<String, Integer> map) {
        throw new UnsupportedOperationException("bookends: not implemented");
    }

    /**
     * The keys of a sequenced map, back to front.
     *
     *   reversedKeys(b=2, a=1, c=3 in insertion order)  -> ["c", "a", "b"]
     *   reversedKeys(empty)                             -> []
     *
     * There is a method for this. Note that what it hands back is a live view
     * of the original map, not a copy — this method must return a plain List
     * that does not move afterwards.
     */
    static List<String> reversedKeys(SequencedMap<String, Integer> map) {
        throw new UnsupportedOperationException("reversedKeys: not implemented");
    }

    /**
     * Try to store the value 1 under a null key, and report what happened.
     *
     *   attemptPutNullKey(new HashMap<>())        -> "ok"
     *   attemptPutNullKey(new LinkedHashMap<>())  -> "ok"
     *   attemptPutNullKey(new TreeMap<>())        -> "NullPointerException"
     *   attemptPutNullKey(Map.of())               -> "UnsupportedOperationException"
     *
     * Return the exception's simple class name when one is thrown, "ok"
     * otherwise. The argument is mutated when the put succeeds.
     */
    static String attemptPutNullKey(Map<String, Integer> map) {
        throw new UnsupportedOperationException("attemptPutNullKey: not implemented");
    }

    /**
     * Store `key -> "v"` in the map. Then, if `appended` is not null, add it to
     * `key` — mutating the very list you just used as a key. Finally, report
     * whether the map still says it contains that key.
     *
     *   stillFindable(map, new ArrayList<>(List.of("a")), null)  -> true
     *   stillFindable(map, new ArrayList<>(List.of("a")), "b")   -> ???
     *
     * Write the three steps literally and let the answer be whatever it is. The
     * map is left for the caller to inspect afterwards, and what it still holds
     * is the point of the exercise.
     */
    static boolean stillFindable(Map<List<String>, String> map, List<String> key, String appended) {
        throw new UnsupportedOperationException("stillFindable: not implemented");
    }
}
