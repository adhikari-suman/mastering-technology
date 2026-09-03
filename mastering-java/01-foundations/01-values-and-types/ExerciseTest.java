import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("describe: every primitive arrives boxed")
    void describeBoxes() {
        assertEquals("Integer", Solution.describe(1));
        assertEquals("Long", Solution.describe(1L));
        assertEquals("Double", Solution.describe(1.0));
        assertEquals("Character", Solution.describe('a'));
        assertEquals("Boolean", Solution.describe(true));
    }

    @Test
    @DisplayName("describe: references and null")
    void describeReferences() {
        assertEquals("String", Solution.describe("hi"));
        assertEquals("null", Solution.describe(null), "null has no class to ask");
        assertEquals("int[]", Solution.describe(new int[0]));
    }

    @Test
    @DisplayName("safeAdd: ordinary sums")
    void safeAddSums() {
        assertEquals(5, Solution.safeAdd(2, 3));
        assertEquals(-1, Solution.safeAdd(2, -3));
        assertEquals(0, Solution.safeAdd(0, 0));
    }

    @Test
    @DisplayName("safeAdd: overflow throws instead of wrapping")
    void safeAddOverflows() {
        assertThrows(ArithmeticException.class, () -> Solution.safeAdd(Integer.MAX_VALUE, 1));
        assertThrows(ArithmeticException.class, () -> Solution.safeAdd(Integer.MIN_VALUE, -1));
        assertEquals(Integer.MIN_VALUE, Integer.MAX_VALUE + 1, "plain + wraps around silently");
    }

    @Test
    @DisplayName("sameBox: small numbers are cached, large ones are not")
    void sameBoxCache() {
        assertTrue(Solution.sameBox(1, 1), "-128..127 come from the Integer cache");
        assertTrue(Solution.sameBox(127, 127));
        assertFalse(Solution.sameBox(128, 128), "128 is past the cache, so == compares two objects");
        assertFalse(Solution.sameBox(1000, 1000));
    }

    @Test
    @DisplayName("truncate: a narrowing cast discards high bits")
    void truncateNarrows() {
        assertEquals((byte) 65, Solution.truncate(65));
        assertEquals((byte) -56, Solution.truncate(200));
        assertEquals((byte) -1, Solution.truncate(-1));
        assertEquals((byte) 0, Solution.truncate(256), "256 is 1_0000_0000; the low byte is zero");
    }

    @Test
    @DisplayName("nearlyEqual: floating point needs a tolerance")
    void nearlyEqualTolerates() {
        assertTrue(Solution.nearlyEqual(0.1 + 0.2, 0.3, 1e-9));
        assertFalse(0.1 + 0.2 == 0.3, "the reason this lesson exists");
        assertFalse(Solution.nearlyEqual(1.0, 1.5, 1e-9));
        assertTrue(Solution.nearlyEqual(1.0, 1.0, 0.0));
    }

    @Test
    @DisplayName("nearlyEqual: NaN equals nothing, itself included")
    void nearlyEqualNaN() {
        assertFalse(Solution.nearlyEqual(Double.NaN, Double.NaN, 1e-9));
        assertFalse(Solution.nearlyEqual(Double.NaN, 1.0, Double.MAX_VALUE));
    }

    @Test
    @DisplayName("parseOr: falls back instead of throwing")
    void parseOrFallsBack() {
        assertEquals(42, Solution.parseOr("42", 0));
        assertEquals(-7, Solution.parseOr("-7", 0));
        assertEquals(0, Solution.parseOr("nope", 0));
        assertEquals(-1, Solution.parseOr(null, -1));
        assertEquals(-1, Solution.parseOr("", -1));
        assertEquals(-1, Solution.parseOr("3.5", -1), "3.5 is not an int");
    }

    @Test
    @DisplayName("nextLetter: char is an integer type")
    void nextLetterWraps() {
        assertEquals('b', Solution.nextLetter('a'));
        assertEquals('z', Solution.nextLetter('y'));
        assertEquals('a', Solution.nextLetter('z'));
    }

    @Test
    @DisplayName("intDivide: truncates toward zero, and can throw")
    void intDivideTruncates() {
        assertEquals(3, Solution.intDivide(7, 2));
        assertEquals(-3, Solution.intDivide(-7, 2), "toward zero, not floor — floor would be -4");
        assertEquals(0, Solution.intDivide(1, 2));
        assertThrows(ArithmeticException.class, () -> Solution.intDivide(1, 0));
    }

    @Test
    @DisplayName("floatDivide: the same sums, where nothing throws")
    void floatDivideNeverThrows() {
        assertEquals(3.5, Solution.floatDivide(7, 2));
        assertEquals(Double.POSITIVE_INFINITY, Solution.floatDivide(1, 0));
        assertEquals(Double.NEGATIVE_INFINITY, Solution.floatDivide(-1, 0));
        assertTrue(Double.isNaN(Solution.floatDivide(0, 0)), "0.0/0.0 is NaN");
    }
}
