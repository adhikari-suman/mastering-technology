import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotSame;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("sameObject: equal literals are one pooled instance")
    void sameObjectPools() {
        assertTrue(Solution.sameObject("hi", "hi"), "both come from the constant pool");
        assertTrue(Solution.sameObject(null, null));
        assertFalse(Solution.sameObject("hi", "ho"));
    }

    @Test
    @DisplayName("sameObject: a String built at runtime is a different instance")
    void sameObjectRuntime() {
        String built = new StringBuilder("hi").toString();
        assertEquals("hi", built, "equal in value");
        assertNotSame("hi", built, "and yet not the same object");
        assertFalse(Solution.sameObject("hi", built), "== on Strings is the bug this teaches");
        assertTrue(Solution.sameObject("hi", built.intern()), "intern returns the pooled copy");
    }

    @Test
    @DisplayName("compareSign: normalised, because compareTo is not")
    void compareSignNormalises() {
        assertEquals(-1, Solution.compareSign("apple", "banana"));
        assertEquals(1, Solution.compareSign("banana", "apple"));
        assertEquals(0, Solution.compareSign("apple", "apple"));
        assertEquals(-32, "A".compareTo("a"), "compareTo returns a difference, not a sign");
    }

    @Test
    @DisplayName("compareSign: uppercase sorts before lowercase")
    void compareSignIsByCodeUnit() {
        assertEquals(-1, Solution.compareSign("Zebra", "apple"), "'Z' is 90, 'a' is 97");
        assertEquals(-1, Solution.compareSign("ab", "abc"), "a prefix sorts first");
    }

    @Test
    @DisplayName("fields: trailing empty columns survive")
    void fieldsKeepsEmpties() {
        assertArrayEquals(new String[] {"a", "b", "c"}, Solution.fields("a,b,c"));
        assertArrayEquals(new String[] {"a", "b", "", ""}, Solution.fields("a,b,,"));
        assertArrayEquals(new String[] {"", "a"}, Solution.fields(",a"));
        assertEquals(2, "a,b,,".split(",").length, "the default split drops them");
    }

    @Test
    @DisplayName("fields: the empty String is one empty field, null is none")
    void fieldsEdges() {
        assertArrayEquals(new String[] {""}, Solution.fields(""));
        assertArrayEquals(new String[] {}, Solution.fields(null));
        assertEquals(1, "".split(",").length, "splitting \"\" gives an array of one \"\"");
    }

    @Test
    @DisplayName("words: whitespace runs collapse and blanks yield nothing")
    void wordsSplits() {
        assertArrayEquals(new String[] {"the", "quick", "fox"}, Solution.words("the quick fox"));
        assertArrayEquals(new String[] {"padded", "out"}, Solution.words("  padded   out  "));
        assertArrayEquals(new String[] {"one"}, Solution.words("one"));
        assertArrayEquals(new String[] {}, Solution.words("   "));
        assertArrayEquals(new String[] {}, Solution.words(""));
        assertArrayEquals(new String[] {}, Solution.words(null));
        assertArrayEquals(new String[] {"a", "b"}, Solution.words(" a b"));
        assertEquals(3, " a b".split("\\s+").length, "raw split leaves a phantom empty first word");
    }

    @Test
    @DisplayName("repeat: counts of one, none, and fewer than none")
    void repeatCounts() {
        assertEquals("ababab", Solution.repeat("ab", 3));
        assertEquals("ab", Solution.repeat("ab", 1));
        assertEquals("", Solution.repeat("ab", 0));
        assertEquals("", Solution.repeat("ab", -1), "a negative count is not an error");
        assertEquals("", Solution.repeat("", 5));
    }

    @Test
    @DisplayName("reverse: surrogate pairs stay paired")
    void reverseKeepsPairs() {
        assertEquals("cba", Solution.reverse("abc"));
        assertEquals("", Solution.reverse(""));
        assertEquals("😀ba", Solution.reverse("ab😀"), "the emoji is not split");
    }

    @Test
    @DisplayName("glyphCount: code points, where length() counts code units")
    void glyphCountCountsCodePoints() {
        assertEquals(3, Solution.glyphCount("abc"));
        assertEquals(3, Solution.glyphCount("a😀b"));
        assertEquals(4, "a😀b".length(), "length() sees two chars of emoji");
        assertEquals(0, Solution.glyphCount(""));
        assertEquals(0, Solution.glyphCount(null));
    }

    @Test
    @DisplayName("firstGlyph: the whole first character, not half of one")
    void firstGlyphIsWhole() {
        assertEquals("a", Solution.firstGlyph("abc"));
        assertEquals("😀", Solution.firstGlyph("😀ok"));
        assertEquals(2, Solution.firstGlyph("😀ok").length(), "one glyph, two chars");
        assertTrue(Character.isHighSurrogate("😀".charAt(0)), "charAt(0) is half a pair");
        assertEquals("", Solution.firstGlyph(""));
        assertEquals("", Solution.firstGlyph(null));
    }

    @Test
    @DisplayName("dayKind: switch on Strings is case-sensitive")
    void dayKindSwitches() {
        assertEquals("weekday", Solution.dayKind("mon"));
        assertEquals("weekday", Solution.dayKind("fri"));
        assertEquals("weekend", Solution.dayKind("sat"));
        assertEquals("weekend", Solution.dayKind("sun"));
        assertEquals("unknown", Solution.dayKind("MON"), "cases match with equals, not ignoring case");
        assertEquals("unknown", Solution.dayKind("nope"));
    }

    @Test
    @DisplayName("dayKind: null is a case, not a crash")
    void dayKindHandlesNull() {
        assertEquals("unknown", Solution.dayKind(null), "an unguarded switch would throw here");
    }

    @Test
    @DisplayName("query: a text block with no indentation and a trailing newline")
    void queryFormats() {
        assertEquals("SELECT *\nFROM users\nLIMIT 10\n", Solution.query("users", 10));
        assertEquals("SELECT *\nFROM orders\nLIMIT 1\n", Solution.query("orders", 1));
        assertTrue(Solution.query("t", 1).endsWith("\n"), "the closing delimiter decides this");
    }
}
