import java.util.Arrays;
import java.util.List;

/**
 * Part 01, Lesson 05 — Arrays
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
     * A new array of the given length with every slot set to `value`.
     *
     *   filled(3, 7)  -> {7, 7, 7}
     *   filled(0, 7)  -> {}
     *   filled(-1, 7) -> throws NegativeArraySizeException
     *
     * You do not have to throw that last one yourself — allocating the array is
     * enough. Note which exception it is: not IllegalArgumentException.
     */
    static int[] filled(int length, int value) {
        throw new UnsupportedOperationException("filled: not implemented");
    }

    /**
     * A longer copy of an array, with the new slots left at the default value.
     *
     *   grow({1, 2}, 2) -> {1, 2, 0, 0}
     *   grow({1, 2}, 0) -> {1, 2}       a copy, not the same object
     *   grow({}, 1)     -> {0}
     *
     * The input must come back unchanged — arrays cannot grow in place, so this
     * is necessarily a new allocation. There is a one-liner for it in
     * java.util.Arrays.
     */
    static int[] grow(int[] xs, int extra) {
        throw new UnsupportedOperationException("grow: not implemented");
    }

    /**
     * Insert a value at an index, shifting everything from there rightwards.
     *
     *   insertAt({1, 2, 3}, 1, 9) -> {1, 9, 2, 3}
     *   insertAt({1, 2, 3}, 0, 9) -> {9, 1, 2, 3}
     *   insertAt({1, 2, 3}, 3, 9) -> {1, 2, 3, 9}     appending is index length
     *   insertAt({}, 0, 9)        -> {9}
     *
     * The result is one longer than the input, and the input is untouched. Use
     * System.arraycopy for the two block moves rather than an element loop.
     * Assume `index` is between 0 and xs.length inclusive.
     */
    static int[] insertAt(int[] xs, int index, int value) {
        throw new UnsupportedOperationException("insertAt: not implemented");
    }

    /**
     * A readable string for a nested array.
     *
     *   render({{1, 2}, {3}}) -> "[[1, 2], [3]]"
     *   render({})            -> "[]"
     *   render({{}})          -> "[[]]"
     *
     * Arrays.toString is the wrong tool here: it calls toString on each row, and
     * a row is an array, whose toString is a type tag and an identity hash.
     */
    static String render(int[][] grid) {
        throw new UnsupportedOperationException("render: not implemented");
    }

    /**
     * A sorted copy, leaving the input alone.
     *
     *   sortedCopy({3, 1, 2}) -> {1, 2, 3}, and the argument is still {3, 1, 2}
     *   sortedCopy({})        -> {}
     *
     * Arrays.sort sorts IN PLACE and returns void, so calling it on the
     * argument directly would be a visible side effect on the caller's array.
     */
    static int[] sortedCopy(int[] xs) {
        throw new UnsupportedOperationException("sortedCopy: not implemented");
    }

    /**
     * Binary search over an already-sorted array, returning what
     * Arrays.binarySearch returns — including its negative encoding.
     *
     *   indexOfSorted({1, 3, 5, 7}, 5) -> 2
     *   indexOfSorted({1, 3, 5, 7}, 4) -> -3     insertion point 2, so -(2)-1
     *   indexOfSorted({1, 3, 5, 7}, 0) -> -1     insertion point 0, so -(0)-1
     *   indexOfSorted({1, 3, 5, 7}, 9) -> -5
     *   indexOfSorted({}, 1)           -> -1
     *
     * Do not normalise the miss to -1. The offset is what distinguishes "would
     * go at the front" from "found at the front".
     */
    static int indexOfSorted(int[] sorted, int target) {
        throw new UnsupportedOperationException("indexOfSorted: not implemented");
    }

    /**
     * Whether two arrays hold the same values in the same order.
     *
     *   sameContents({1, 2}, {1, 2}) -> true
     *   sameContents({1, 2}, {2, 1}) -> false
     *   sameContents({}, {})         -> true
     *   sameContents(null, null)     -> true
     *   sameContents({1}, null)      -> false
     *
     * `a.equals(b)` is not this. An array inherits Object.equals, so it compares
     * identity and answers false for two equal arrays.
     */
    static boolean sameContents(int[] a, int[] b) {
        throw new UnsupportedOperationException("sameContents: not implemented");
    }

    /**
     * Demonstrate the hole in array typing, and report what fell through it.
     *
     * Do this, exactly:
     *
     *   Object[] objects = new String[1];      // legal: String[] IS-A Object[]
     *   objects[0] = Integer.valueOf(42);      // compiles; fails at runtime
     *
     * Return the simple name of the exception that comes out, or the string
     * "no error" if nothing is thrown.
     *
     *   storeIntoStringArray() -> "ArrayStoreException"
     *
     * Every array write in Java carries this check, because the compiler cannot
     * know an Object[] variable's real element type.
     */
    static String storeIntoStringArray() {
        throw new UnsupportedOperationException("storeIntoStringArray: not implemented");
    }

    /**
     * The same numbers as an unmodifiable List.
     *
     *   boxedList({1, 2, 3}) -> [1, 2, 3]
     *   boxedList({})        -> []
     *
     * The result must reject mutation: calling add on it throws
     * UnsupportedOperationException. Unlike the array, it has a working
     * equals/hashCode/toString, which is most of the reason to prefer it.
     */
    static List<Integer> boxedList(int[] xs) {
        throw new UnsupportedOperationException("boxedList: not implemented");
    }
}
