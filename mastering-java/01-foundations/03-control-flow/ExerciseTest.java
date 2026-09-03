import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("isLeapYear: the rule has two exceptions, and both matter")
    void leapYears() {
        assertTrue(Solution.isLeapYear(2024));
        assertFalse(Solution.isLeapYear(2023));
        assertFalse(Solution.isLeapYear(1900), "a century is not a leap year");
        assertTrue(Solution.isLeapYear(2000), "unless it divides by 400");
        assertTrue(Solution.isLeapYear(1600));
        assertFalse(Solution.isLeapYear(2100));
    }

    @Test
    @DisplayName("daysIn: stacked case labels share one body")
    void daysInMonths() {
        assertEquals(31, Solution.daysIn(1, 2023));
        assertEquals(31, Solution.daysIn(12, 2023));
        assertEquals(30, Solution.daysIn(4, 2023));
        assertEquals(30, Solution.daysIn(11, 2023));
        assertEquals(28, Solution.daysIn(2, 2023));
        assertEquals(29, Solution.daysIn(2, 2024), "February is the only month that asks the year");
    }

    @Test
    @DisplayName("daysIn: a month outside 1..12 is rejected")
    void daysInRejects() {
        assertThrows(IllegalArgumentException.class, () -> Solution.daysIn(0, 2023));
        assertThrows(IllegalArgumentException.class, () -> Solution.daysIn(13, 2023));
        assertThrows(IllegalArgumentException.class, () -> Solution.daysIn(-1, 2023));
    }

    @Test
    @DisplayName("a switch statement falls through until it hits a break")
    void switchStatementsFallThrough() {
        int hits = 0;
        switch (2) {
            case 1: hits++;
            case 2: hits++;
            case 3: hits++;
            default: hits++;
        }
        assertEquals(3, hits, "entered at case 2 and ran everything after it");
    }

    @Test
    @DisplayName("grade: every band, at both of its edges")
    void gradeBands() {
        assertEquals("A", Solution.grade(100));
        assertEquals("A", Solution.grade(90));
        assertEquals("B", Solution.grade(89));
        assertEquals("B", Solution.grade(80));
        assertEquals("C", Solution.grade(70));
        assertEquals("D", Solution.grade(60));
        assertEquals("F", Solution.grade(59));
        assertEquals("F", Solution.grade(0));
    }

    @Test
    @DisplayName("grade: 101 divides down into the A case and must still be rejected")
    void gradeRejects() {
        assertEquals(10, 101 / 10, "which is exactly the case 100 lands in");
        assertThrows(IllegalArgumentException.class, () -> Solution.grade(101));
        assertThrows(IllegalArgumentException.class, () -> Solution.grade(-1));
        assertThrows(IllegalArgumentException.class, () -> Solution.grade(1000));
    }

    @Test
    @DisplayName("waitSeconds: an exhaustive enum switch needs no default")
    void waitSecondsCoversTheEnum() {
        assertEquals(60, Solution.waitSeconds(Solution.Signal.RED));
        assertEquals(5, Solution.waitSeconds(Solution.Signal.AMBER));
        assertEquals(0, Solution.waitSeconds(Solution.Signal.GREEN));
        assertEquals(3, Solution.Signal.values().length, "add a fourth and the switch stops compiling");
    }

    @Test
    @DisplayName("waitSeconds: exhaustive is not the same as null-safe")
    void waitSecondsRejectsNull() {
        assertThrows(NullPointerException.class, () -> Solution.waitSeconds(null));
    }

    @Test
    @DisplayName("digitCount: zero has one digit, and MIN_VALUE has ten")
    void digitCounts() {
        assertEquals(1, Solution.digitCount(0), "a plain while loop would say 0 here");
        assertEquals(1, Solution.digitCount(7));
        assertEquals(3, Solution.digitCount(123));
        assertEquals(3, Solution.digitCount(-123));
        assertEquals(10, Solution.digitCount(Integer.MAX_VALUE));
        assertEquals(10, Solution.digitCount(Integer.MIN_VALUE));
        assertTrue(Math.abs(Integer.MIN_VALUE) < 0, "abs cannot make MIN_VALUE positive");
    }

    @Test
    @DisplayName("countVowels: skips what it does not count")
    void vowelCounts() {
        assertEquals(2, Solution.countVowels("hello"));
        assertEquals(5, Solution.countVowels("AEIOU"), "either case counts");
        assertEquals(0, Solution.countVowels("rhythm"), "y is not a vowel here");
        assertEquals(0, Solution.countVowels(""));
        assertEquals(0, Solution.countVowels(null));
    }

    @Test
    @DisplayName("findPair: the labelled break stops at the first match")
    void findPairFinds() {
        int[][] grid = {{1, 2}, {3, 4}};
        assertArrayEquals(new int[] {0, 0}, Solution.findPair(grid, 1));
        assertArrayEquals(new int[] {1, 0}, Solution.findPair(grid, 3));
        assertArrayEquals(new int[] {1, 1}, Solution.findPair(grid, 4));
        assertArrayEquals(new int[] {0, 0}, Solution.findPair(new int[][] {{7, 7}, {7}}, 7),
                "first match, reading in order");
    }

    @Test
    @DisplayName("findPair: missing values, empty grids, empty rows")
    void findPairMisses() {
        assertNull(Solution.findPair(new int[][] {{1, 2}, {3, 4}}, 9));
        assertNull(Solution.findPair(new int[][] {}, 1));
        assertNull(Solution.findPair(new int[][] {{}, {}}, 1));
        assertArrayEquals(new int[] {1, 0}, Solution.findPair(new int[][] {{}, {5}}, 5),
                "a jagged grid skips the empty row");
    }

    @Test
    @DisplayName("promote: both ternary branches are numeric, so both are promoted")
    void promoteWidens() {
        assertEquals(Double.class, Solution.promote(true).getClass(), "an Integer branch, a Double result");
        assertEquals(1.0, Solution.promote(true));
        assertEquals(Double.class, Solution.promote(false).getClass());
        assertEquals(2.0, Solution.promote(false));
    }

    @Test
    @DisplayName("orDefault: the ternary must not unbox a null")
    void orDefaultSurvivesNull() {
        assertEquals(42, Solution.orDefault(42, 0));
        assertEquals(0, Solution.orDefault(null, 0));
        assertEquals(-1, Solution.orDefault(null, -1));

        Integer nothing = null;
        assertThrows(NullPointerException.class, () -> {
            int unused = true ? nothing : 0;
            assertEquals(0, unused);
        }, "an unguarded ternary unboxes the null branch");
    }
}
