/**
 * Part 01, Lesson 03 — Control Flow
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

    /** Given to you — the enum `waitSeconds` switches over. Leave it alone. */
    enum Signal { RED, AMBER, GREEN }

    /**
     * The Gregorian leap year rule: divisible by 4, except centuries, except
     * every fourth century.
     *
     *   isLeapYear(2024) -> true
     *   isLeapYear(2023) -> false
     *   isLeapYear(1900) -> false    a century that is not a fourth one
     *   isLeapYear(2000) -> true     a fourth century
     */
    static boolean isLeapYear(int year) {
        throw new UnsupportedOperationException("isLeapYear: not implemented");
    }

    /**
     * How many days a month has, with 1 = January.
     *
     *   daysIn(1, 2023)  -> 31
     *   daysIn(4, 2023)  -> 30
     *   daysIn(2, 2023)  -> 28
     *   daysIn(2, 2024)  -> 29
     *   daysIn(0, 2023)  -> throws IllegalArgumentException
     *   daysIn(13, 2023) -> throws IllegalArgumentException
     *
     * Write this one as a `switch` STATEMENT — the `case 1:` form with stacked
     * labels — so you can feel the difference from the expression form used in
     * `grade` below. Remember what happens to a case without a `break`.
     */
    static int daysIn(int month, int year) {
        throw new UnsupportedOperationException("daysIn: not implemented");
    }

    /**
     * A letter grade for a percentage score.
     *
     *   grade(100) -> "A"    grade(90) -> "A"
     *   grade(89)  -> "B"    grade(80) -> "B"
     *   grade(79)  -> "C"    grade(70) -> "C"
     *   grade(69)  -> "D"    grade(60) -> "D"
     *   grade(59)  -> "F"    grade(0)  -> "F"
     *   grade(101) -> throws IllegalArgumentException
     *   grade(-1)  -> throws IllegalArgumentException
     *
     * Write this one as a `switch` EXPRESSION over `score / 10`, with arrow
     * cases. Before you do, work out what `101 / 10` is and which case that
     * lands in — dividing first merges scores that are not equivalent.
     */
    static String grade(int score) {
        throw new UnsupportedOperationException("grade: not implemented");
    }

    /**
     * How long to wait at a signal, in seconds.
     *
     *   waitSeconds(Signal.RED)   -> 60
     *   waitSeconds(Signal.AMBER) -> 5
     *   waitSeconds(Signal.GREEN) -> 0
     *   waitSeconds(null)         -> throws NullPointerException
     *
     * Use a `switch` expression with NO `default` branch. The compiler can see
     * all three constants, so it will accept that as exhaustive — and will
     * reject this method the day someone adds a fourth signal, which is the
     * whole reason to leave `default` out. Note that exhaustive still does not
     * mean null-safe.
     */
    static int waitSeconds(Signal signal) {
        throw new UnsupportedOperationException("waitSeconds: not implemented");
    }

    /**
     * How many decimal digits a number has, ignoring any minus sign.
     *
     *   digitCount(0)    -> 1
     *   digitCount(7)    -> 1
     *   digitCount(123)  -> 3
     *   digitCount(-123) -> 3
     *   digitCount(Integer.MIN_VALUE) -> 10
     *
     * Zero is why `do`/`while` exists: a `while (n > 0)` loop counts no digits
     * at all for it. And `Math.abs(Integer.MIN_VALUE)` is *still negative*, so
     * taking the absolute value first is not enough on its own.
     */
    static int digitCount(int n) {
        throw new UnsupportedOperationException("digitCount: not implemented");
    }

    /**
     * Count the vowels in a string, in either case.
     *
     *   countVowels("hello")   -> 2
     *   countVowels("AEIOU")   -> 5
     *   countVowels("rhythm")  -> 0
     *   countVowels("")        -> 0
     *   countVowels(null)      -> 0
     *
     * Use an enhanced for over the characters, with a `continue` for the ones
     * that do not count. 'y' is not a vowel here.
     */
    static int countVowels(String text) {
        throw new UnsupportedOperationException("countVowels: not implemented");
    }

    /**
     * Find a value in a rectangular-or-jagged grid, returning {row, column} of
     * the first match reading left to right, top to bottom.
     *
     *   findPair({{1,2},{3,4}}, 3)  -> {1, 0}
     *   findPair({{1,2},{3,4}}, 1)  -> {0, 0}
     *   findPair({{1,2},{3,4}}, 9)  -> null
     *   findPair({}, 1)             -> null
     *   findPair({{}, {5}}, 5)      -> {1, 0}    rows may differ in length
     *
     * Leave the nested loop with a labelled `break`. Assume the grid itself is
     * not null, though a row may be empty.
     */
    static int[] findPair(int[][] grid, int target) {
        throw new UnsupportedOperationException("findPair: not implemented");
    }

    /**
     * Return, as an Object so the runtime type is visible:
     *
     *     flag ? Integer.valueOf(1) : Double.valueOf(2.0)
     *
     * Write exactly that expression. Then predict, before running the tests,
     * what `promote(true)` returns and what class it is. It is not an Integer,
     * and it is not 1.
     */
    static Object promote(boolean flag) {
        throw new UnsupportedOperationException("promote: not implemented");
    }

    /**
     * Unwrap a boxed Integer, substituting a fallback for null.
     *
     *   orDefault(42, 0)   -> 42
     *   orDefault(null, 0) -> 0
     *   orDefault(null, -1) -> -1
     *
     * A ternary is the right tool, but the two branches share one type: an
     * `Integer` and an `int` promote to `int`, so the boxed branch is unboxed
     * the moment it is taken. Make sure null never gets that far.
     */
    static int orDefault(Integer value, int fallback) {
        throw new UnsupportedOperationException("orDefault: not implemented");
    }
}
