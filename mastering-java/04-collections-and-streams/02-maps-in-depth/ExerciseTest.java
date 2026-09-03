import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.SequencedMap;
import java.util.Set;
import java.util.TreeMap;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    /** b=2, a=1, c=3 — insertion order deliberately not sorted order. */
    private static SequencedMap<String, Integer> sequenced() {
        SequencedMap<String, Integer> m = new LinkedHashMap<>();
        m.put("b", 2);
        m.put("a", 1);
        m.put("c", 3);
        return m;
    }

    @Test
    @DisplayName("wordCount: merge replaces containsKey/get/put")
    void wordCountCounts() {
        assertEquals(Map.of("a", 2, "b", 1), Solution.wordCount(List.of("a", "b", "a")));
        assertEquals(Map.of(), Solution.wordCount(List.of()));
        assertEquals(Map.of("x", 3), Solution.wordCount(List.of("x", "x", "x")));
    }

    @Test
    @DisplayName("groupByInitial: computeIfAbsent gives you a bucket to add to")
    void groupByInitialBuckets() {
        Map<Character, List<String>> grouped =
                Solution.groupByInitial(List.of("ant", "bee", "ape", ""));
        assertEquals(Map.of('a', List.of("ant", "ape"), 'b', List.of("bee")), grouped);
        assertEquals(List.of('a', 'b'), new ArrayList<>(grouped.keySet()), "keys come out sorted");
        assertEquals(Map.of(), Solution.groupByInitial(List.of()));
    }

    @Test
    @DisplayName("decrementOrRemove: returning null from the remapper deletes the entry")
    void decrementOrRemoveCounts() {
        Map<String, Integer> counts = new HashMap<>(Map.of("a", 3, "b", 1));
        assertEquals(Map.of("a", 2, "b", 1), Solution.decrementOrRemove(counts, "a"));
        assertEquals(Map.of("a", 2), Solution.decrementOrRemove(counts, "b"), "1 - 1 == 0, so it goes");
        assertFalse(counts.containsKey("b"));
    }

    @Test
    @DisplayName("decrementOrRemove: an absent key is left absent, not created")
    void decrementOrRemoveIgnoresAbsent() {
        Map<String, Integer> counts = new HashMap<>(Map.of("a", 1));
        assertEquals(Map.of("a", 1), Solution.decrementOrRemove(counts, "z"));
        assertFalse(counts.containsKey("z"), "computeIfPresent never invents an entry");
    }

    @Test
    @DisplayName("lookup: the default fires on absence, not on null")
    void lookupDefaults() {
        assertEquals(1, Solution.lookup(Map.of("a", 1), "a", 9));
        assertEquals(9, Solution.lookup(Map.of("a", 1), "z", 9));

        Map<String, Integer> withNull = new HashMap<>();
        withNull.put("a", null);
        assertNull(Solution.lookup(withNull, "a", 9),
                "\"a\" HAS a mapping — the mapping is null, so no default is used");
        assertTrue(withNull.containsKey("a"), "containsKey is the only honest presence test");
    }

    @Test
    @DisplayName("render: entrySet walked in the map's own order")
    void renderJoins() {
        assertEquals("b=2;a=1;c=3", Solution.render(sequenced()));
        assertEquals("a=1;b=2;c=3", Solution.render(new TreeMap<>(Map.of("b", 2, "a", 1, "c", 3))));
        assertEquals("", Solution.render(Map.of()));
        assertEquals("a=1", Solution.render(Map.of("a", 1)), "no trailing separator");
    }

    @Test
    @DisplayName("keysInOrder: order is a property of the implementation")
    void keysInOrderDiffers() {
        assertEquals(List.of("b", "a", "c"), Solution.keysInOrder(sequenced()),
                "LinkedHashMap: insertion order");
        assertEquals(List.of("a", "b", "c"),
                Solution.keysInOrder(new TreeMap<>(Map.of("b", 2, "a", 1, "c", 3))),
                "TreeMap: sorted order");
        assertEquals(Set.of("a", "b", "c"),
                Set.copyOf(Solution.keysInOrder(new HashMap<>(Map.of("b", 2, "a", 1, "c", 3)))),
                "HashMap: the contents are known, the order is not — so only assert the set");
    }

    @Test
    @DisplayName("bookends: firstEntry and lastEntry come free with SequencedMap")
    void bookendsEnds() {
        assertEquals("b=2..c=3", Solution.bookends(sequenced()));
        SequencedMap<String, Integer> one = new LinkedHashMap<>();
        one.put("a", 1);
        assertEquals("a=1..a=1", Solution.bookends(one));
        assertEquals("empty", Solution.bookends(new LinkedHashMap<>()));
    }

    @Test
    @DisplayName("reversedKeys: reversed() is a view, so snapshot it")
    void reversedKeysReverse() {
        SequencedMap<String, Integer> map = sequenced();
        List<String> keys = Solution.reversedKeys(map);
        assertEquals(List.of("c", "a", "b"), keys);
        map.put("d", 4);
        assertEquals(List.of("c", "a", "b"), keys, "the returned List must not track the map");
        assertEquals(List.of(), Solution.reversedKeys(new LinkedHashMap<>()));
    }

    @Test
    @DisplayName("attemptPutNullKey: null keys depend entirely on the implementation")
    void nullKeysDiffer() {
        Map<String, Integer> hash = new HashMap<>();
        assertEquals("ok", Solution.attemptPutNullKey(hash));
        assertEquals(1, hash.get(null), "HashMap stores exactly one null key");
        assertEquals("ok", Solution.attemptPutNullKey(new LinkedHashMap<>()));
        assertEquals("NullPointerException", Solution.attemptPutNullKey(new TreeMap<>()),
                "a sorted map must compare the key, even the first one");
        assertEquals("UnsupportedOperationException", Solution.attemptPutNullKey(Map.of()),
                "immutable first: it refuses the write before it looks at the key");
    }

    @Test
    @DisplayName("Map.of is null-hostile in both directions, and rejects duplicate keys")
    void immutableMapsAreStrict() {
        assertThrows(NullPointerException.class, () -> Map.of("a", (Integer) null));
        assertThrows(IllegalArgumentException.class, () -> Map.of("a", 1, "a", 2),
                "not last-wins — a hard error");
    }

    @Test
    @DisplayName("stillFindable: an unmutated key is found again")
    void stillFindableWithoutMutation() {
        Map<List<String>, String> map = new HashMap<>();
        List<String> key = new ArrayList<>(List.of("a"));
        assertTrue(Solution.stillFindable(map, key, null));
        assertEquals(1, map.size());
    }

    @Test
    @DisplayName("stillFindable: mutating a key strands its entry in the wrong bucket")
    void stillFindableAfterMutation() {
        Map<List<String>, String> map = new HashMap<>();
        List<String> key = new ArrayList<>(List.of("a"));
        assertFalse(Solution.stillFindable(map, key, "b"),
                "the hash was taken at put time and is never recomputed");
        assertEquals(1, map.size(), "the entry is still there — it is just unreachable");
        assertNull(map.get(key));
        map.remove(key);
        assertEquals(1, map.size(), "remove goes to the new bucket too, and finds nothing");
    }
}
