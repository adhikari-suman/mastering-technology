import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    private static final List<String> FRUIT = List.of("apple", "avocado", "fig", "banana");

    @Test
    @DisplayName("collectImmutable: unmodifiable, and null-hostile with it")
    void collectImmutableRefusesEverything() {
        List<String> collected = Solution.collectImmutable(List.of("a", "b"));
        assertEquals(List.of("a", "b"), collected);
        assertThrows(UnsupportedOperationException.class, () -> collected.add("c"));
        assertThrows(NullPointerException.class,
                () -> Solution.collectImmutable(Arrays.asList("a", null)));
    }

    @Test
    @DisplayName("the three ways to make a List are three different promises")
    void theThreeListCollectors() {
        assertEquals(Arrays.asList("a", null), Stream.of("a", (String) null).toList(),
                "Stream.toList is immutable but tolerates null");
        assertThrows(NullPointerException.class,
                () -> Stream.of("a", (String) null).collect(Collectors.toUnmodifiableList()));
        List<String> old = Stream.of("a").collect(Collectors.toList());
        old.add("b");
        assertEquals(List.of("a", "b"), old,
                "Collectors.toList happens to be mutable — the javadoc promises nothing");
    }

    @Test
    @DisplayName("bracketJoin: the prefix and suffix survive an empty stream")
    void bracketJoinJoins() {
        assertEquals("[ant, bee]", Solution.bracketJoin(List.of("ant", "bee")));
        assertEquals("[ant]", Solution.bracketJoin(List.of("ant")));
        assertEquals("[]", Solution.bracketJoin(List.of()), "not \"\"");
    }

    @Test
    @DisplayName("countByInitial: counting() gives you a Long")
    void countByInitialCounts() {
        assertEquals(Map.of('a', 2L, 'b', 1L), Solution.countByInitial(List.of("ant", "ape", "bee")));
        assertEquals(Map.of(), Solution.countByInitial(List.of()));
        assertNotEquals(Map.of('a', 2), Map.of('a', 2L),
                "Long.valueOf(2).equals(Integer.valueOf(2)) is false, and map equality notices");
    }

    @Test
    @DisplayName("shoutingLongWordsByInitial: filtering downstream keeps the empty group")
    void filteringDownstreamKeepsKeys() {
        Map<Character, List<String>> grouped = Solution.shoutingLongWordsByInitial(FRUIT, 6);
        assertEquals(Map.of('a', List.of("AVOCADO"), 'b', List.of("BANANA"), 'f', List.of()), grouped);
        assertEquals(List.of('a', 'b', 'f'), new ArrayList<>(grouped.keySet()), "keys come out sorted");
    }

    @Test
    @DisplayName("filtering before the grouping loses the key entirely")
    void filteringUpstreamDropsKeys() {
        Map<Character, List<String>> prefiltered = FRUIT.stream()
                .filter(w -> w.length() >= 6)
                .collect(Collectors.groupingBy(w -> w.charAt(0), TreeMap::new, Collectors.toList()));
        assertEquals(List.of('a', 'b'), new ArrayList<>(prefiltered.keySet()),
                "no 'f' at all — the group was never created");
        assertTrue(Solution.shoutingLongWordsByInitial(FRUIT, 6).containsKey('f'),
                "the collector version reports that 'f' existed and lost everything");
    }

    @Test
    @DisplayName("partitionLongWords: both keys, always")
    void partitionAlwaysHasBothKeys() {
        assertEquals(Map.of(false, List.of("apple", "fig"), true, List.of("avocado", "banana")),
                Solution.partitionLongWords(FRUIT, 6));
        Map<Boolean, List<String>> empty = Solution.partitionLongWords(List.of(), 6);
        assertEquals(Map.of(false, List.of(), true, List.of()), empty,
                "an empty stream still yields both buckets");
        assertEquals(List.of(), empty.get(true), "so get(true) never returns null");
    }

    @Test
    @DisplayName("indexByInitial: toMap refuses to guess at a duplicate key")
    void toMapThrowsOnDuplicates() {
        assertEquals(Map.of('a', "ant", 'b', "bee"), Solution.indexByInitial(List.of("ant", "bee")));
        IllegalStateException thrown = assertThrows(IllegalStateException.class,
                () -> Solution.indexByInitial(List.of("ant", "ape")));
        assertTrue(thrown.getMessage().startsWith("Duplicate key"), thrown.getMessage());
    }

    @Test
    @DisplayName("indexByInitialFirstWins: the merge function settles it")
    void toMapMergesDuplicates() {
        assertEquals(Map.of('a', "ant", 'b', "bee"),
                Solution.indexByInitialFirstWins(List.of("ant", "ape", "bee")));
        assertEquals(Map.of('a', "ant"), Solution.indexByInitialFirstWins(List.of("ant", "ape", "axe")),
                "three in a row, and the first still wins");
        assertEquals(Map.of(), Solution.indexByInitialFirstWins(List.of()));
    }

    @Test
    @DisplayName("toMap rejects a null value that HashMap would have accepted")
    void toMapRejectsNullValues() {
        assertThrows(NullPointerException.class,
                () -> Stream.of("a").collect(Collectors.toMap(w -> w, w -> (String) null)));
    }

    @Test
    @DisplayName("summary: teeing runs two collectors over one pass")
    void summaryTees() {
        assertEquals("2 words, 6 letters", Solution.summary(List.of("ant", "bee")));
        assertEquals("0 words, 0 letters", Solution.summary(List.of()));
        assertEquals("4 words, 21 letters", Solution.summary(FRUIT));
    }

    @Test
    @DisplayName("meanLength: averaging an empty stream is 0.0, not empty")
    void meanLengthAverages() {
        assertEquals(2.0, Solution.meanLength(List.of("a", "bbb")));
        assertEquals(0.0, Solution.meanLength(List.of()),
                "the opposite call from IntStream.average(), which returns OptionalDouble.empty()");
        assertEquals(5.25, Solution.meanLength(FRUIT));
    }

    @Test
    @DisplayName("initialsCollector: a Collector, so it composes")
    void customCollectorWorksAlone() {
        assertEquals("ab", Stream.of("ant", "bee").collect(Solution.initialsCollector()));
        assertEquals("", Stream.<String>of().collect(Solution.initialsCollector()));
        assertEquals("ab", Stream.of("ant", "", "bee").collect(Solution.initialsCollector()),
                "an empty word contributes nothing");
    }

    @Test
    @DisplayName("initialsCollector: and works as a downstream collector")
    void customCollectorComposes() {
        Map<Integer, String> byLength = FRUIT.stream()
                .collect(Collectors.groupingBy(String::length, TreeMap::new, Solution.initialsCollector()));
        assertEquals(Map.of(3, "f", 5, "a", 6, "b", 7, "a"), byLength,
                "this is what a helper method could not have done");
    }
}
