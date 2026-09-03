import java.util.List;
import java.util.Map;

/**
 * Part 07, Lesson 04 — Dependency Resolution
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
 * Throughout, a dependency graph is a `Map<String, List<String>>` from a
 * coordinate to the coordinates it depends on, IN DECLARED ORDER. A coordinate
 * that is not a key in the map has no dependencies of its own. `Dep` comes
 * from support/.
 */
class Solution {

    /**
     * Parse a coordinate into its three parts.
     *
     *   parse("org.slf4j:slf4j-api:2.0.9")
     *       -> Dep("org.slf4j", "slf4j-api", "2.0.9")
     *   parse("a:b")        -> throws IllegalArgumentException  (two parts)
     *   parse("a:b:c:d")    -> throws IllegalArgumentException  (four)
     *   parse("a::1.0")     -> throws IllegalArgumentException  (blank part)
     *   parse(null)         -> throws IllegalArgumentException
     *
     * Exactly three non-blank parts, separated by colons.
     */
    static Dep parse(String coordinate) {
        throw new UnsupportedOperationException("parse: not implemented");
    }

    /**
     * Order two dotted numeric versions. Return -1, 0 or 1 — nothing else.
     *
     *   compareVersions("1.2.3", "1.2.3") ->  0
     *   compareVersions("1.10", "1.9")    ->  1   (ten, not "one zero")
     *   compareVersions("1.2", "1.2.1")   -> -1
     *   compareVersions("1.0", "1.0.0")   ->  0   (missing segments are zero)
     *   compareVersions("2", "1.9.9")     ->  1
     *   compareVersions("1.0-beta", "1.0") -> throws IllegalArgumentException
     *
     * Segments are non-negative integers separated by dots. Comparing them as
     * strings gives the wrong answer for "1.10" vs "1.9", which is the whole
     * reason this method exists. Anything non-numeric is rejected here; real
     * resolvers have elaborate rules for qualifiers, and you do not.
     */
    static int compareVersions(String a, String b) {
        throw new UnsupportedOperationException("compareVersions: not implemented");
    }

    /**
     * The shortest distance from the root to every reachable coordinate.
     *
     * For
     *   app:1.0 -> [core:1.0, web:2.0]
     *   web:2.0 -> [core:2.0]
     *
     *   depths(graph, "org.demo:app:1.0") ->
     *       { "org.demo:app:1.0": 0,
     *         "org.demo:core:1.0": 1,
     *         "org.demo:web:2.0": 1,
     *         "org.demo:core:2.0": 2 }
     *
     * Unreachable coordinates are absent. Breadth-first is the natural fit,
     * and this is the number Maven's strategy is built on. The graph may
     * contain cycles: do not loop forever.
     */
    static Map<String, Integer> depths(Map<String, List<String>> graph, String root) {
        throw new UnsupportedOperationException("depths: not implemented");
    }

    /**
     * The "group:artifact" keys that appear at more than one version anywhere
     * in the reachable graph, sorted. These are the decisions the resolver has
     * to make.
     *
     *   conflicts(graph, root) -> ["org.demo:core"]
     *   conflicts(graphWithNoDuplicates, root) -> []
     */
    static List<String> conflicts(Map<String, List<String>> graph, String root) {
        throw new UnsupportedOperationException("conflicts: not implemented");
    }

    /**
     * Maven's strategy: NEAREST DEFINITION WINS. For each group:artifact
     * reachable from the root, keep the version at the smallest depth. Break a
     * tie at equal depth in favour of whichever was reached first in
     * breadth-first order (which follows each node's declared order).
     *
     * Return the surviving coordinates, sorted, root included.
     *
     * For
     *   app:1.0 -> [core:1.0, web:2.0]
     *   web:2.0 -> [core:2.0]
     *
     *   nearestWins(graph, "org.demo:app:1.0")
     *       -> ["org.demo:app:1.0", "org.demo:core:1.0", "org.demo:web:2.0"]
     *
     * core:1.0 is at depth 1 and core:2.0 at depth 2, so the OLDER one ships
     * and `web` runs against a library older than it was built against.
     */
    static List<String> nearestWins(Map<String, List<String>> graph, String root) {
        throw new UnsupportedOperationException("nearestWins: not implemented");
    }

    /**
     * Gradle's strategy: HIGHEST VERSION WINS. For each group:artifact
     * reachable from the root, keep the largest version by compareVersions,
     * wherever in the graph it was found.
     *
     * Return the surviving coordinates, sorted, root included.
     *
     * On the same graph as above:
     *   highestWins(graph, "org.demo:app:1.0")
     *       -> ["org.demo:app:1.0", "org.demo:core:2.0", "org.demo:web:2.0"]
     *
     * The root itself is never displaced, even by a higher version of itself
     * found deeper in the graph — you cannot depend on a different you.
     */
    static List<String> highestWins(Map<String, List<String>> graph, String root) {
        throw new UnsupportedOperationException("highestWins: not implemented");
    }

    /**
     * Every reachable coordinate, ordered so that each appears AFTER everything
     * it depends on. The root, depending on everything, comes last.
     *
     * Walk depth-first from the root following each node's declared order, and
     * emit a node once its dependencies have been emitted.
     *
     * For
     *   app:1.0 -> [core:1.0, web:2.0]
     *   web:2.0 -> [core:2.0]
     *
     *   topologicalOrder(graph, "org.demo:app:1.0")
     *       -> ["org.demo:core:1.0", "org.demo:core:2.0",
     *           "org.demo:web:2.0", "org.demo:app:1.0"]
     *
     * If any cycle is reachable from the root, throw IllegalStateException —
     * a cyclic graph has no such order, which is why build tools reject one.
     */
    static List<String> topologicalOrder(Map<String, List<String>> graph, String root) {
        throw new UnsupportedOperationException("topologicalOrder: not implemented");
    }

    /**
     * Find a cycle reachable from the root, as the path from the repeated node
     * back round to itself. Return an empty list when the graph is acyclic.
     *
     *   a -> [b], b -> [c], c -> [a]
     *   findCycle(graph, "a")  -> ["a", "b", "c", "a"]
     *
     *   r -> [a], a -> [b], b -> [a]
     *   findCycle(graph, "r")  -> ["a", "b", "a"]     (r is not in the cycle)
     *
     *   findCycle(acyclicGraph, root) -> []
     *
     * Depth-first, keeping the current path on a stack. Arriving at a node
     * that is already on the stack is the cycle; a node you merely visited
     * before and finished with is not. Follow declared order so the answer is
     * the same every run.
     */
    static List<String> findCycle(Map<String, List<String>> graph, String root) {
        throw new UnsupportedOperationException("findCycle: not implemented");
    }
}
