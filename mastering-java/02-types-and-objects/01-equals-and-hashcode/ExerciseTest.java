import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("Point: equals is reflexive, symmetric and transitive")
    void pointContract() {
        Solution.Point a = new Solution.Point(1, 2);
        Solution.Point b = new Solution.Point(1, 2);
        Solution.Point c = new Solution.Point(1, 2);

        assertTrue(a.equals(a), "reflexive");
        assertTrue(a.equals(b) && b.equals(a), "symmetric");
        assertTrue(a.equals(b) && b.equals(c) && a.equals(c), "transitive");
        assertFalse(a.equals(new Solution.Point(2, 1)));
    }

    @Test
    @DisplayName("Point: equals returns false for null and for other types, never throws")
    void pointRejects() {
        Solution.Point a = new Solution.Point(1, 2);
        assertFalse(a.equals(null), "the contract says false, not NullPointerException");
        assertFalse(a.equals("Point(1, 2)"));
        assertFalse(a.equals(new Solution.Mutable(1, 2)), "same shape, different class");
    }

    @Test
    @DisplayName("Point: equal points hash equal, and one point hashes the same twice")
    void pointHashes() {
        Solution.Point a = new Solution.Point(1, 2);
        Solution.Point b = new Solution.Point(1, 2);
        assertEquals(a.hashCode(), b.hashCode(), "equal objects MUST agree here");
        assertEquals(a.hashCode(), a.hashCode(), "consistent across calls");
        assertNotEquals(a.hashCode(), new Solution.Point(2, 1).hashCode(),
                "not required by the contract, but a hash that ignores order is a bad hash");
    }

    @Test
    @DisplayName("Point: toString is the readable form")
    void pointPrints() {
        assertEquals("Point(1, 2)", new Solution.Point(1, 2).toString());
        assertEquals("Point(-3, 0)", new Solution.Point(-3, 0).toString());
    }

    @Test
    @DisplayName("setSize: a HashSet folds equal Points into one")
    void setFoldsPoints() {
        assertEquals(1, Solution.setSize(new Solution.Point(1, 2), new Solution.Point(1, 2)));
        assertEquals(2, Solution.setSize(new Solution.Point(1, 2), new Solution.Point(3, 4)));
        assertEquals(1, Solution.setSize(null, null), "a HashSet holds one null");
        assertEquals(2, Solution.setSize(null, new Solution.Point(1, 2)));
    }

    @Test
    @DisplayName("Sloppy: equals without hashCode makes the set keep both copies")
    void sloppyKeepsDuplicates() {
        Solution.Sloppy a = new Solution.Sloppy(1, 2);
        Solution.Sloppy b = new Solution.Sloppy(1, 2);
        assertTrue(a.equals(b), "they really are equal");
        assertEquals(2, Solution.setSize(a, b), "and the set still keeps both — different buckets");
    }

    @Test
    @DisplayName("Sloppy: a HashMap cannot find the value you just put in")
    void sloppyLosesValues() {
        Map<Object, String> byPoint = new HashMap<>();
        byPoint.put(new Solution.Sloppy(1, 2), "origin-ish");
        assertNull(byPoint.get(new Solution.Sloppy(1, 2)), "equal key, wrong bucket");
        assertEquals(1, byPoint.size(), "the entry is in there — just unreachable by key");
    }

    @Test
    @DisplayName("Loose/Tagged: an instanceof equals on a non-final class breaks symmetry")
    void symmetryBreaks() {
        Solution.Loose base = new Solution.Loose(1, 2);
        Solution.Tagged sub = new Solution.Tagged(1, 2, "red");

        assertTrue(base.equals(sub), "sub IS a Loose with the same coordinates");
        assertFalse(sub.equals(base), "base is not a Tagged");
        assertFalse(Solution.symmetric(base, sub), "so the pair violates the contract");
    }

    @Test
    @DisplayName("Tagged: equality within the subclass still works normally")
    void taggedAmongItself() {
        assertTrue(new Solution.Tagged(1, 2, "red").equals(new Solution.Tagged(1, 2, "red")));
        assertFalse(new Solution.Tagged(1, 2, "red").equals(new Solution.Tagged(1, 2, "blue")));
        assertTrue(Solution.symmetric(new Solution.Tagged(1, 2, "red"), new Solution.Tagged(1, 2, "blue")),
                "both say false, which is symmetric");
    }

    @Test
    @DisplayName("symmetric: a well-behaved pair agrees in both directions")
    void symmetricAgrees() {
        assertTrue(Solution.symmetric(new Solution.Point(1, 2), new Solution.Point(1, 2)));
        assertTrue(Solution.symmetric(new Solution.Point(1, 2), new Solution.Point(3, 4)));
        assertTrue(Solution.symmetric(new Solution.Point(1, 2), "not a point"),
                "false both ways is still symmetric");
    }

    @Test
    @DisplayName("nullSafeEquals: two nulls are equal, one null never is")
    void nullSafety() {
        assertTrue(Solution.nullSafeEquals("a", "a"));
        assertFalse(Solution.nullSafeEquals("a", "b"));
        assertTrue(Solution.nullSafeEquals(null, null), "unlike a.equals(b), this survives");
        assertFalse(Solution.nullSafeEquals(null, "a"));
        assertFalse(Solution.nullSafeEquals("a", null));
    }

    @Test
    @DisplayName("requireName: null is rejected at the door, with a name in the message")
    void requireNameFailsFast() {
        assertEquals("ada", Solution.requireName("ada"));
        assertEquals("", Solution.requireName(""), "empty is not null");
        NullPointerException boom =
                assertThrows(NullPointerException.class, () -> Solution.requireName(null));
        assertEquals("name", boom.getMessage(), "a message is the whole reason to use requireNonNull");
    }

    @Test
    @DisplayName("Mutable: equality tracks the fields as they change")
    void mutableTracksFields() {
        Solution.Mutable m = new Solution.Mutable(1, 2);
        assertTrue(m.equals(new Solution.Mutable(1, 2)));
        m.moveTo(9, 9);
        assertFalse(m.equals(new Solution.Mutable(1, 2)));
        assertTrue(m.equals(new Solution.Mutable(9, 9)));
    }

    @Test
    @DisplayName("containsAfterMove: a mutated key hides from the set that holds it")
    void mutatedKeyIsLost() {
        assertFalse(Solution.containsAfterMove(new Solution.Mutable(1, 2)),
                "the set looks in the bucket for the NEW hash and finds nothing");

        Set<Solution.Mutable> set = new HashSet<>();
        Solution.Mutable m = new Solution.Mutable(1, 2);
        set.add(m);
        m.moveTo(9, 9);
        assertFalse(set.contains(m), "cannot be found");
        assertFalse(set.remove(m), "cannot be removed");
        assertEquals(1, set.size(), "and it is still in there");
        assertSame(m, set.iterator().next(), "iteration finds it — only hashing cannot");
    }
}
