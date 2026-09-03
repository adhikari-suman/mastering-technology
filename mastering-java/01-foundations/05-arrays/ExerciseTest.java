import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotSame;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("filled: a length is fixed at creation, and cannot be negative")
    void filledFills() {
        assertArrayEquals(new int[] {7, 7, 7}, Solution.filled(3, 7));
        assertArrayEquals(new int[] {}, Solution.filled(0, 7));
        assertEquals(3, Solution.filled(3, 0).length);
        assertThrows(NegativeArraySizeException.class, () -> Solution.filled(-1, 7),
                "its own exception, not IllegalArgumentException");
    }

    @Test
    @DisplayName("a fresh array is full of defaults, and refuses an index past its end")
    void arraysStartAtTheirDefaults() {
        int[] numbers = new int[2];
        String[] names = new String[2];
        boolean[] flags = new boolean[2];
        assertEquals(0, numbers[0]);
        assertNull(names[0], "reference elements default to null, not to an empty String");
        assertFalse(flags[0]);
        assertEquals(2, numbers.length, "length is a field here, not a method");
        assertThrows(ArrayIndexOutOfBoundsException.class, () -> numbers[2] = 1);
    }

    @Test
    @DisplayName("grow: a longer copy, padded with the default value")
    void growCopies() {
        int[] original = {1, 2};
        assertArrayEquals(new int[] {1, 2, 0, 0}, Solution.grow(original, 2));
        assertArrayEquals(new int[] {1, 2}, original, "the input is not touched");
        assertNotSame(original, Solution.grow(original, 0), "even a zero-length growth copies");
        assertArrayEquals(new int[] {0}, Solution.grow(new int[] {}, 1));
    }

    @Test
    @DisplayName("insertAt: shifting a block, at both ends and in the middle")
    void insertAtShifts() {
        int[] original = {1, 2, 3};
        assertArrayEquals(new int[] {1, 9, 2, 3}, Solution.insertAt(original, 1, 9));
        assertArrayEquals(new int[] {9, 1, 2, 3}, Solution.insertAt(original, 0, 9));
        assertArrayEquals(new int[] {1, 2, 3, 9}, Solution.insertAt(original, 3, 9), "index == length appends");
        assertArrayEquals(new int[] {9}, Solution.insertAt(new int[] {}, 0, 9));
        assertArrayEquals(new int[] {1, 2, 3}, original, "still untouched after all that");
    }

    @Test
    @DisplayName("render: nested arrays need the deep version")
    void renderGoesDeep() {
        int[][] grid = {{1, 2}, {3}};
        assertEquals("[[1, 2], [3]]", Solution.render(grid));
        assertEquals("[]", Solution.render(new int[][] {}));
        assertEquals("[[]]", Solution.render(new int[][] {{}}));
        assertTrue(Arrays.toString(grid).contains("[I@"), "the shallow version prints identity hashes");
    }

    @Test
    @DisplayName("sortedCopy: Arrays.sort mutates, so the copy has to come first")
    void sortedCopyLeavesTheInputAlone() {
        int[] original = {3, 1, 2};
        assertArrayEquals(new int[] {1, 2, 3}, Solution.sortedCopy(original));
        assertArrayEquals(new int[] {3, 1, 2}, original, "sorting in place would have shown up here");
        assertArrayEquals(new int[] {}, Solution.sortedCopy(new int[] {}));
        assertArrayEquals(new int[] {-5, 0, 5}, Solution.sortedCopy(new int[] {5, -5, 0}));
    }

    @Test
    @DisplayName("indexOfSorted: a miss encodes where the value would go")
    void indexOfSortedEncodesMisses() {
        int[] sorted = {1, 3, 5, 7};
        assertEquals(0, Solution.indexOfSorted(sorted, 1));
        assertEquals(2, Solution.indexOfSorted(sorted, 5));
        assertEquals(-3, Solution.indexOfSorted(sorted, 4), "insertion point 2, returned as -(2)-1");
        assertEquals(-1, Solution.indexOfSorted(sorted, 0), "which is why misses are offset by one");
        assertEquals(-5, Solution.indexOfSorted(sorted, 9));
        assertEquals(-1, Solution.indexOfSorted(new int[] {}, 1));
    }

    @Test
    @DisplayName("sameContents: arrays do not have value equality of their own")
    void sameContentsComparesValues() {
        int[] a = {1, 2};
        int[] b = {1, 2};
        assertFalse(a.equals(b), "Object.equals is identity, and arrays never override it");
        assertTrue(Solution.sameContents(a, b));
        assertFalse(Solution.sameContents(a, new int[] {2, 1}));
        assertTrue(Solution.sameContents(new int[] {}, new int[] {}));
        assertTrue(Solution.sameContents(null, null));
        assertFalse(Solution.sameContents(a, null));
    }

    @Test
    @DisplayName("nested arrays need deepEquals, for the same reason render needs deepToString")
    void nestedEqualityIsShallow() {
        int[][] x = {{1}};
        int[][] y = {{1}};
        assertFalse(Arrays.equals(x, y), "the rows are compared by identity");
        assertTrue(Arrays.deepEquals(x, y));
    }

    @Test
    @DisplayName("storeIntoStringArray: covariance turns a type error into a runtime one")
    void covarianceIsCheckedAtRuntime() {
        assertEquals("ArrayStoreException", Solution.storeIntoStringArray());
    }

    @Test
    @DisplayName("boxedList: a List with real equality, and no mutation")
    void boxedListIsUnmodifiable() {
        List<Integer> list = Solution.boxedList(new int[] {1, 2, 3});
        assertEquals(List.of(1, 2, 3), list, "unlike an array, this equals what it should");
        assertEquals("[1, 2, 3]", list.toString());
        assertEquals(List.of(), Solution.boxedList(new int[] {}));
        assertThrows(UnsupportedOperationException.class, () -> list.add(4));
    }
}
