import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    /** The graph where Maven and Gradle disagree: a direct old version, a deep new one. */
    static final Map<String, List<String>> SPLIT = Map.of(
            "org.demo:app:1.0", List.of("org.demo:core:1.0", "org.demo:web:2.0"),
            "org.demo:web:2.0", List.of("org.demo:core:2.0"));

    /** A true diamond: both routes to core are the same distance away. */
    static final Map<String, List<String>> DIAMOND = Map.of(
            "org.demo:app:1.0", List.of("org.demo:a:1.0", "org.demo:b:1.0"),
            "org.demo:a:1.0", List.of("org.demo:core:1.0"),
            "org.demo:b:1.0", List.of("org.demo:core:2.0"));

    @Test
    @DisplayName("parse: three non-blank parts, and nothing else will do")
    void parseSplitsCoordinates() {
        assertEquals(new Dep("org.slf4j", "slf4j-api", "2.0.9"), Solution.parse("org.slf4j:slf4j-api:2.0.9"));
        assertEquals("org.slf4j:slf4j-api", Solution.parse("org.slf4j:slf4j-api:2.0.9").ga());
        assertThrows(IllegalArgumentException.class, () -> Solution.parse("a:b"));
        assertThrows(IllegalArgumentException.class, () -> Solution.parse("a:b:c:d"));
        assertThrows(IllegalArgumentException.class, () -> Solution.parse("a::1.0"));
        assertThrows(IllegalArgumentException.class, () -> Solution.parse(null));
    }

    @Test
    @DisplayName("compareVersions: 1.10 is newer than 1.9, which string order gets wrong")
    void compareVersionsIsNumeric() {
        assertEquals(0, Solution.compareVersions("1.2.3", "1.2.3"));
        assertEquals(1, Solution.compareVersions("1.10", "1.9"));
        assertEquals(-1, Solution.compareVersions("1.9", "1.10"));
        assertTrue("1.10".compareTo("1.9") < 0, "as strings, 1.10 sorts BEFORE 1.9");
    }

    @Test
    @DisplayName("compareVersions: missing segments count as zero")
    void compareVersionsPadsSegments() {
        assertEquals(0, Solution.compareVersions("1.0", "1.0.0"));
        assertEquals(-1, Solution.compareVersions("1.2", "1.2.1"));
        assertEquals(1, Solution.compareVersions("2", "1.9.9"));
        assertThrows(IllegalArgumentException.class, () -> Solution.compareVersions("1.0-beta", "1.0"),
                "qualifiers are somebody else's problem");
    }

    @Test
    @DisplayName("depths: breadth-first distance is the number Maven resolves on")
    void depthsMeasuresFromTheRoot() {
        assertEquals(
                Map.of("org.demo:app:1.0", 0, "org.demo:core:1.0", 1, "org.demo:web:2.0", 1, "org.demo:core:2.0", 2),
                Solution.depths(SPLIT, "org.demo:app:1.0"));
        assertEquals(Map.of("org.demo:app:1.0", 0), Solution.depths(Map.of(), "org.demo:app:1.0"),
                "a coordinate with no entry in the graph simply has no dependencies");
    }

    @Test
    @DisplayName("depths: a cycle must not become an infinite walk")
    void depthsSurvivesCycles() {
        Map<String, List<String>> cyclic = Map.of(
                "g:a:1", List.of("g:b:1"),
                "g:b:1", List.of("g:c:1"),
                "g:c:1", List.of("g:a:1"));
        assertEquals(Map.of("g:a:1", 0, "g:b:1", 1, "g:c:1", 2), Solution.depths(cyclic, "g:a:1"));
    }

    @Test
    @DisplayName("conflicts: one library wanted at two versions is the decision to make")
    void conflictsFindsTheDiamonds() {
        assertEquals(List.of("org.demo:core"), Solution.conflicts(SPLIT, "org.demo:app:1.0"));
        assertEquals(List.of("org.demo:core"), Solution.conflicts(DIAMOND, "org.demo:app:1.0"));
        assertEquals(List.of(), Solution.conflicts(
                Map.of("g:a:1", List.of("g:b:1"), "g:b:1", List.of("g:c:1")), "g:a:1"));
    }

    @Test
    @DisplayName("nearestWins: Maven ships the older version because it is closer")
    void nearestWinsPrefersDepth() {
        assertEquals(List.of("org.demo:app:1.0", "org.demo:core:1.0", "org.demo:web:2.0"),
                Solution.nearestWins(SPLIT, "org.demo:app:1.0"),
                "core:1.0 at depth 1 beats core:2.0 at depth 2 — a silent downgrade for web");
    }

    @Test
    @DisplayName("nearestWins: an equal-depth tie goes to whoever was declared first")
    void nearestWinsBreaksTiesByOrder() {
        assertEquals(
                List.of("org.demo:a:1.0", "org.demo:app:1.0", "org.demo:b:1.0", "org.demo:core:1.0"),
                Solution.nearestWins(DIAMOND, "org.demo:app:1.0"),
                "a: was listed before b:, so its core:1.0 was reached first");
    }

    @Test
    @DisplayName("highestWins: Gradle ignores depth entirely")
    void highestWinsPrefersVersion() {
        assertEquals(List.of("org.demo:app:1.0", "org.demo:core:2.0", "org.demo:web:2.0"),
                Solution.highestWins(SPLIT, "org.demo:app:1.0"));
        assertEquals(
                List.of("org.demo:a:1.0", "org.demo:app:1.0", "org.demo:b:1.0", "org.demo:core:2.0"),
                Solution.highestWins(DIAMOND, "org.demo:app:1.0"),
                "the tie Maven had to break does not exist here");
        assertEquals(List.of("org.demo:app:1.0"),
                Solution.highestWins(Map.of("org.demo:app:1.0", List.of("org.demo:app:2.0")), "org.demo:app:1.0"),
                "the root is never displaced — you cannot depend on a different you");
    }

    @Test
    @DisplayName("the two strategies disagree on the same graph — that is the lesson")
    void strategiesDisagree() {
        assertEquals(List.of("org.demo:core:1.0"),
                Solution.nearestWins(SPLIT, "org.demo:app:1.0").stream().filter(c -> c.contains(":core:")).toList());
        assertEquals(List.of("org.demo:core:2.0"),
                Solution.highestWins(SPLIT, "org.demo:app:1.0").stream().filter(c -> c.contains(":core:")).toList());
    }

    @Test
    @DisplayName("topologicalOrder: dependencies first, root last")
    void topologicalOrderPutsLeavesFirst() {
        assertEquals(
                List.of("org.demo:core:1.0", "org.demo:core:2.0", "org.demo:web:2.0", "org.demo:app:1.0"),
                Solution.topologicalOrder(SPLIT, "org.demo:app:1.0"));
        assertEquals(List.of("g:a:1"), Solution.topologicalOrder(Map.of(), "g:a:1"));
    }

    @Test
    @DisplayName("topologicalOrder: a cycle has no such order")
    void topologicalOrderRejectsCycles() {
        Map<String, List<String>> cyclic = Map.of("g:a:1", List.of("g:b:1"), "g:b:1", List.of("g:a:1"));
        assertThrows(IllegalStateException.class, () -> Solution.topologicalOrder(cyclic, "g:a:1"));
    }

    @Test
    @DisplayName("findCycle: the path back to the node already on the stack")
    void findCycleReportsThePath() {
        assertEquals(List.of("a", "b", "c", "a"),
                Solution.findCycle(Map.of("a", List.of("b"), "b", List.of("c"), "c", List.of("a")), "a"));
        assertEquals(List.of("a", "b", "a"),
                Solution.findCycle(Map.of("r", List.of("a"), "a", List.of("b"), "b", List.of("a")), "r"),
                "the root need not be part of the cycle");
        assertEquals(List.of(), Solution.findCycle(SPLIT, "org.demo:app:1.0"));
    }

    @Test
    @DisplayName("findCycle: a node revisited on a different branch is not a cycle")
    void findCycleIgnoresMereRevisits() {
        assertEquals(List.of(),
                Solution.findCycle(Map.of("r", List.of("x", "y"), "x", List.of("z"), "y", List.of("z")), "r"),
                "both branches reach z; z points at nothing, so there is no cycle");
        assertEquals(List.of("a", "a"), Solution.findCycle(Map.of("a", List.of("a")), "a"),
                "a self-edge is the shortest cycle there is");
    }
}
