import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Deque;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.PriorityQueue;
import java.util.Set;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("shapeOf: the hierarchy, and LinkedList wearing two hats")
    void shapeOfHierarchy() {
        assertEquals("List", Solution.shapeOf(new ArrayList<String>()));
        assertEquals("List", Solution.shapeOf(List.of("a")));
        assertEquals("List", Solution.shapeOf(new LinkedList<String>()), "a LinkedList is a List and a Deque");
        assertEquals("Set", Solution.shapeOf(new HashSet<String>()));
        assertEquals("Queue", Solution.shapeOf(new ArrayDeque<String>()));
        assertEquals("Queue", Solution.shapeOf(new PriorityQueue<String>()));
    }

    @Test
    @DisplayName("dedupeKeepingOrder: unique, in first-seen order")
    void dedupeKeepsOrder() {
        assertEquals(List.of("pear", "fig", "apple"),
                Solution.dedupeKeepingOrder(List.of("pear", "fig", "pear", "apple", "fig")));
        assertEquals(List.of(), Solution.dedupeKeepingOrder(List.of()));
        assertEquals(List.of("a"), Solution.dedupeKeepingOrder(List.of("a", "a", "a")));
    }

    @Test
    @DisplayName("sortedUnique: unique and sorted, and null is not sortable")
    void sortedUniqueSorts() {
        assertEquals(List.of("apple", "fig", "pear"),
                Solution.sortedUnique(List.of("pear", "fig", "pear", "apple")));
        assertEquals(List.of(), Solution.sortedUnique(Set.of()));
        assertEquals(List.of("A", "a"), Solution.sortedUnique(List.of("a", "A")),
                "natural String order is by code point: 'A' is 65, 'a' is 97");
        assertThrows(NullPointerException.class,
                () -> Solution.sortedUnique(Arrays.asList("a", null)));
    }

    @Test
    @DisplayName("attemptAdd: only some Lists accept an add")
    void attemptAddReports() {
        List<String> growable = new ArrayList<>(List.of("a"));
        assertEquals("ok", Solution.attemptAdd(growable, "x"));
        assertEquals(List.of("a", "x"), growable);
        assertEquals("UnsupportedOperationException", Solution.attemptAdd(List.of("a"), "x"),
                "List.of is immutable");
        assertEquals("UnsupportedOperationException", Solution.attemptAdd(Arrays.asList("a"), "x"),
                "Arrays.asList is fixed-size — set works, add does not");
    }

    @Test
    @DisplayName("List.of is null-hostile: even asking about null throws")
    void immutableListsRejectNull() {
        assertThrows(NullPointerException.class, () -> List.of("a", null));
        assertThrows(NullPointerException.class, () -> List.of("a").contains(null),
                "contains(null) is a query, and it still throws");
        assertFalse(new ArrayList<>(List.of("a")).contains(null), "an ArrayList just says no");
    }

    @Test
    @DisplayName("liveView: a view moves with its backing list")
    void liveViewFollows() {
        List<String> backing = new ArrayList<>(List.of("a"));
        List<String> view = Solution.liveView(backing);
        assertEquals(List.of("a"), view);
        backing.add("b");
        assertEquals(List.of("a", "b"), view, "unmodifiable removes YOUR writes, not everyone's");
        assertThrows(UnsupportedOperationException.class, () -> view.add("c"));
    }

    @Test
    @DisplayName("frozenCopy: a snapshot does not move")
    void frozenCopyStays() {
        List<String> source = new ArrayList<>(List.of("a"));
        List<String> copy = Solution.frozenCopy(source);
        source.add("b");
        assertEquals(List.of("a"), copy, "copyOf snapshots at the moment you call it");
        assertThrows(UnsupportedOperationException.class, () -> copy.add("c"));
    }

    @Test
    @DisplayName("attemptRemoveInForEach: mutating mid-iteration throws")
    void removeInForEachThrows() {
        assertEquals("ConcurrentModificationException",
                Solution.attemptRemoveInForEach(new ArrayList<>(List.of("a", "b", "c")), "a"));
        assertEquals("ConcurrentModificationException",
                Solution.attemptRemoveInForEach(new ArrayList<>(List.of("a", "b", "c")), "c"),
                "removing the last element still leaves a next() to run");
        assertEquals("ConcurrentModificationException",
                Solution.attemptRemoveInForEach(new ArrayList<>(List.of("a", "b", "c", "d")), "b"));
    }

    @Test
    @DisplayName("attemptRemoveInForEach: except when it silently doesn't")
    void removeInForEachSometimesSlipsThrough() {
        List<String> list = new ArrayList<>(List.of("a", "b", "c"));
        assertEquals("ok", Solution.attemptRemoveInForEach(list, "b"),
                "size drops to 2 exactly as the cursor hits 2, so hasNext() ends the loop first");
        assertEquals(List.of("a", "c"), list, "and 'c' was never visited");
        assertEquals("ok", Solution.attemptRemoveInForEach(new ArrayList<>(List.of("a", "b")), "z"),
                "removing nothing never trips the check");
    }

    @Test
    @DisplayName("dropShorterThan: removeIf mutates in place and counts")
    void dropShorterThanRemoves() {
        List<String> list = new ArrayList<>(List.of("a", "bbb", "cc", "dddd"));
        assertEquals(2, Solution.dropShorterThan(list, 3));
        assertEquals(List.of("bbb", "dddd"), list);
        assertEquals(0, Solution.dropShorterThan(list, 0));
        assertEquals(List.of("bbb", "dddd"), list);
        assertEquals(2, Solution.dropShorterThan(list, 99));
        assertEquals(List.of(), list);
    }

    @Test
    @DisplayName("dropShorterThan: removeIf throws on an immutable list even with no matches")
    void dropShorterThanOnImmutable() {
        List<String> immutable = List.of("bbb");
        assertEquals(0, Solution.dropShorterThan(new ArrayList<>(immutable), 0),
                "a minLength of 0 matches nothing, so a mutable list is left alone");
        assertThrows(UnsupportedOperationException.class,
                () -> Solution.dropShorterThan(immutable, 0),
                "List.of refuses the operation, not just the mutation");
    }

    @Test
    @DisplayName("balanced: a Deque used as a stack")
    void balancedMatches() {
        assertTrue(Solution.balanced("a(b[c]d)e"));
        assertTrue(Solution.balanced(""));
        assertTrue(Solution.balanced("no brackets here"));
        assertTrue(Solution.balanced("{[()]}"));
        assertFalse(Solution.balanced("(]"), "closed by the wrong kind");
        assertFalse(Solution.balanced("("), "never closed");
        assertFalse(Solution.balanced(")("), "closed before it opened");
    }

    @Test
    @DisplayName("drainFront: a deque empties from the head")
    void drainFrontEmpties() {
        Deque<Integer> deque = new ArrayDeque<>(List.of(1, 2, 3));
        assertEquals(List.of(1, 2, 3), Solution.drainFront(deque));
        assertTrue(deque.isEmpty(), "draining consumes the deque");
        assertEquals(List.of(), Solution.drainFront(new ArrayDeque<Integer>()));
    }

    @Test
    @DisplayName("ArrayDeque rejects null, which is why poll() can mean 'empty'")
    void arrayDequeIsNullHostile() {
        assertThrows(NullPointerException.class, () -> new ArrayDeque<String>().push(null));
    }
}
