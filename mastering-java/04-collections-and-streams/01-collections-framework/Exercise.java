import java.util.Collection;
import java.util.Deque;
import java.util.List;

/**
 * Part 04, Lesson 01 — The Collections Framework
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
     * Name the most specific Collection sub-interface a collection implements,
     * checking List, then Set, then Queue.
     *
     *   shapeOf(new ArrayList<String>())   -> "List"
     *   shapeOf(new LinkedList<String>())  -> "List"    (it is also a Deque)
     *   shapeOf(new HashSet<String>())     -> "Set"
     *   shapeOf(new ArrayDeque<String>())  -> "Queue"
     *   shapeOf(List.of())                 -> "List"
     *
     * Anything that is a Collection but none of the three is "Collection".
     * Note what the parameter type refuses: a Map cannot be passed at all.
     */
    static String shapeOf(Collection<?> collection) {
        throw new UnsupportedOperationException("shapeOf: not implemented");
    }

    /**
     * Remove duplicates, keeping the FIRST occurrence of each element and the
     * order they first appeared in.
     *
     *   dedupeKeepingOrder(List.of("pear", "fig", "pear", "apple"))
     *       -> ["pear", "fig", "apple"]
     *   dedupeKeepingOrder(List.of())  -> []
     *
     * One of the three standard Set implementations does the ordering for you.
     * Picking the wrong one still passes the "unique" half of the spec.
     */
    static List<String> dedupeKeepingOrder(List<String> input) {
        throw new UnsupportedOperationException("dedupeKeepingOrder: not implemented");
    }

    /**
     * Remove duplicates and return the elements in natural sorted order.
     *
     *   sortedUnique(List.of("pear", "fig", "pear", "apple"))
     *       -> ["apple", "fig", "pear"]
     *   sortedUnique(Set.of())  -> []
     *
     * A null element must throw NullPointerException rather than sorting
     * somewhere arbitrary. Choose an implementation that already does that
     * instead of checking by hand.
     */
    static List<String> sortedUnique(Collection<String> input) {
        throw new UnsupportedOperationException("sortedUnique: not implemented");
    }

    /**
     * Try to append an item, and report what happened.
     *
     *   attemptAdd(new ArrayList<>(), "x")     -> "ok"
     *   attemptAdd(List.of("a"), "x")          -> "UnsupportedOperationException"
     *   attemptAdd(Arrays.asList("a"), "x")    -> "UnsupportedOperationException"
     *
     * Return the exception's simple class name when one is thrown, "ok"
     * otherwise. The argument is mutated when the add succeeds.
     */
    static String attemptAdd(List<String> list, String item) {
        throw new UnsupportedOperationException("attemptAdd: not implemented");
    }

    /**
     * Return a read-only VIEW of the argument: the caller cannot add to it, but
     * later changes to the backing list must show through.
     *
     *   var backing = new ArrayList<>(List.of("a"));
     *   var view = liveView(backing);
     *   backing.add("b");
     *   view                 -> ["a", "b"]
     *   view.add("c")        -> throws UnsupportedOperationException
     *
     * java.util.Collections has the factory. This is one line.
     */
    static List<String> liveView(List<String> backing) {
        throw new UnsupportedOperationException("liveView: not implemented");
    }

    /**
     * Return a read-only SNAPSHOT of the argument: later changes to the source
     * must NOT show through.
     *
     *   var source = new ArrayList<>(List.of("a"));
     *   var copy = frozenCopy(source);
     *   source.add("b");
     *   copy                 -> ["a"]
     *   copy.add("c")        -> throws UnsupportedOperationException
     *
     * Same static type as liveView, opposite semantics. Also one line.
     */
    static List<String> frozenCopy(List<String> source) {
        throw new UnsupportedOperationException("frozenCopy: not implemented");
    }

    /**
     * Remove every element equal to `target` the WRONG way — with a for-each
     * loop calling list.remove(element) — and report what came of it.
     *
     * Return "ConcurrentModificationException" if that is thrown, "ok" if the
     * loop finishes. Do not defend against it; the point is to see it.
     *
     *   attemptRemoveInForEach(new ArrayList<>(List.of("a","b","c")), "a")
     *       -> "ConcurrentModificationException"
     *   attemptRemoveInForEach(new ArrayList<>(List.of("a","b","c")), "b")
     *       -> "ok"     ... and the list is now ["a", "c"]
     *   attemptRemoveInForEach(new ArrayList<>(List.of("a","b","c")), "z")
     *       -> "ok"
     *
     * One of those three is the whole lesson. Work out why before you run it.
     */
    static String attemptRemoveInForEach(List<String> list, String target) {
        throw new UnsupportedOperationException("attemptRemoveInForEach: not implemented");
    }

    /**
     * Remove every element shorter than `minLength` from the list IN PLACE, and
     * return how many were removed.
     *
     *   var l = new ArrayList<>(List.of("a", "bbb", "cc", "dddd"));
     *   dropShorterThan(l, 3)   -> 2    and l is now ["bbb", "dddd"]
     *   dropShorterThan(l, 0)   -> 0    and l is unchanged
     *
     * Do it with the Collection method built for exactly this, not with an
     * index loop. Note that it throws on an immutable list even when nothing
     * would have been removed.
     */
    static int dropShorterThan(List<String> list, int minLength) {
        throw new UnsupportedOperationException("dropShorterThan: not implemented");
    }

    /**
     * Whether every bracket in the text is closed by the matching kind, in the
     * right order. Only ()[]{} are brackets; every other character is ignored.
     *
     *   balanced("a(b[c]d)e")  -> true
     *   balanced("")           -> true
     *   balanced("(]")         -> false
     *   balanced("(")          -> false
     *   balanced(")(")         -> false
     *
     * Use an ArrayDeque as the stack. Not java.util.Stack — see the README.
     */
    static boolean balanced(String text) {
        throw new UnsupportedOperationException("balanced: not implemented");
    }

    /**
     * Drain a deque from the front into a list, emptying it.
     *
     *   var d = new ArrayDeque<>(List.of(1, 2, 3));
     *   drainFront(d)  -> [1, 2, 3]    and d is now empty
     *   drainFront(new ArrayDeque<Integer>())  -> []
     *
     * `poll` returns null on an empty deque; `remove` throws. Pick the one that
     * makes the loop read well.
     */
    static List<Integer> drainFront(Deque<Integer> deque) {
        throw new UnsupportedOperationException("drainFront: not implemented");
    }
}
