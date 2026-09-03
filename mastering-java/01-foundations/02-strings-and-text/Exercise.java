/**
 * Part 01, Lesson 02 — Strings and Text
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
 */
class Solution {

    /**
     * Return true when the two Strings are the SAME OBJECT (`==`), not merely
     * equal.
     *
     *   sameObject("hi", "hi")                          -> true
     *   sameObject("hi", new StringBuilder("hi").toString()) -> false
     *   sameObject(null, null)                          -> true
     *
     * Both arguments can be equal and still fail this. Write it with `==` —
     * the point is to make the difference visible, not to hide it.
     */
    static boolean sameObject(String a, String b) {
        throw new UnsupportedOperationException("sameObject: not implemented");
    }

    /**
     * Compare two Strings, normalised to exactly -1, 0 or 1.
     *
     *   compareSign("apple", "banana") -> -1
     *   compareSign("banana", "apple") -> 1
     *   compareSign("apple", "apple")  -> 0
     *   compareSign("Zebra", "apple")  -> -1   (uppercase sorts first)
     *
     * `String.compareTo` does NOT return -1/0/1 — it returns the difference
     * between the first differing characters, so "A".compareTo("a") is -32.
     * Normalising is the caller's job.
     */
    static int compareSign(String a, String b) {
        throw new UnsupportedOperationException("compareSign: not implemented");
    }

    /**
     * Split a comma-separated line into fields, keeping EVERY field, including
     * empty ones at the end.
     *
     *   fields("a,b,c")  -> ["a", "b", "c"]
     *   fields("a,b,,")  -> ["a", "b", "", ""]
     *   fields(",a")     -> ["", "a"]
     *   fields("")       -> [""]      one empty field, not zero fields
     *   fields(null)     -> []        zero fields
     *
     * Plain `split(",")` silently drops the trailing empties, which corrupts
     * any CSV whose last column is blank. The two-argument form fixes it.
     */
    static String[] fields(String csv) {
        throw new UnsupportedOperationException("fields: not implemented");
    }

    /**
     * Split text into words on runs of whitespace, with no empty entries.
     *
     *   words("the quick fox")     -> ["the", "quick", "fox"]
     *   words("  padded   out  ")  -> ["padded", "out"]
     *   words("one")               -> ["one"]
     *   words("   ")               -> []
     *   words("")                  -> []
     *   words(null)                -> []
     *
     * Two traps meet here: splitting a leading separator produces an empty
     * first element, and splitting the empty string produces an array of
     * length ONE containing "". Neither is a word.
     */
    static String[] words(String text) {
        throw new UnsupportedOperationException("words: not implemented");
    }

    /**
     * Repeat a unit n times.
     *
     *   repeat("ab", 3)  -> "ababab"
     *   repeat("ab", 1)  -> "ab"
     *   repeat("ab", 0)  -> ""
     *   repeat("ab", -1) -> ""
     *   repeat("", 5)    -> ""
     *
     * Assume `unit` is not null. Build it with a StringBuilder rather than
     * `result += unit` in the loop — see the README for why that difference
     * matters more than it looks.
     */
    static String repeat(String unit, int times) {
        throw new UnsupportedOperationException("repeat: not implemented");
    }

    /**
     * Reverse a String.
     *
     *   reverse("abc")   -> "cba"
     *   reverse("")      -> ""
     *   reverse("ab😀") -> "😀ba"
     *
     * That last one is "ab" followed by an emoji, and the emoji must come back
     * whole. It is stored as two chars, so reversing char by char would split
     * it into two broken halves. One JDK method already handles this; find it
     * rather than writing the loop. Assume the argument is not null.
     */
    static String reverse(String s) {
        throw new UnsupportedOperationException("reverse: not implemented");
    }

    /**
     * Count the code points — characters as a human would count them — rather
     * than the UTF-16 code units that `length()` returns.
     *
     *   glyphCount("abc")   -> 3
     *   glyphCount("a😀b") -> 3   ("a", an emoji, "b"), though length() is 4
     *   glyphCount("")      -> 0
     *   glyphCount(null)    -> 0
     */
    static int glyphCount(String s) {
        throw new UnsupportedOperationException("glyphCount: not implemented");
    }

    /**
     * The first code point of a String, returned whole as a String.
     *
     *   firstGlyph("abc")     -> "a"
     *   firstGlyph("😀ok") -> "😀"   the whole emoji, two chars long
     *   firstGlyph("")        -> ""
     *   firstGlyph(null)      -> ""
     *
     * `s.substring(0, 1)` and `s.charAt(0)` both cut a surrogate pair in half
     * and hand you an unpaired half-character. Neither is right here.
     */
    static String firstGlyph(String s) {
        throw new UnsupportedOperationException("firstGlyph: not implemented");
    }

    /**
     * Classify a lower-case day abbreviation with a `switch` over Strings.
     *
     *   dayKind("mon") -> "weekday"      also tue, wed, thu, fri
     *   dayKind("sat") -> "weekend"      also sun
     *   dayKind("MON") -> "unknown"      switch on Strings is case-sensitive
     *   dayKind("nope") -> "unknown"
     *   dayKind(null)  -> "unknown"      and this must NOT throw
     *
     * A switch dereferences its selector, so a null String blows up before any
     * case is considered — unless you say so explicitly.
     */
    static String dayKind(String day) {
        throw new UnsupportedOperationException("dayKind: not implemented");
    }

    /**
     * Build a three-line query using a text block with the values formatted in.
     *
     *   query("users", 10) -> "SELECT *\nFROM users\nLIMIT 10\n"
     *   query("orders", 1) -> "SELECT *\nFROM orders\nLIMIT 1\n"
     *
     * Note the exact shape: no leading indentation on any line, and a trailing
     * newline after the last one. Both are decided by where you put the closing
     * delimiter, so the text block has to be written carefully.
     */
    static String query(String table, int limit) {
        throw new UnsupportedOperationException("query: not implemented");
    }
}
