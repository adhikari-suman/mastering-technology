/**
 * Part 01, Lesson 01 — Values and Types
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
     * Name the type of a value, using the wrapper's simple name.
     *
     *   describe(1)        -> "Integer"
     *   describe(1L)       -> "Long"
     *   describe(1.0)      -> "Double"
     *   describe('a')      -> "Character"
     *   describe(true)     -> "Boolean"
     *   describe("hi")     -> "String"
     *   describe(null)     -> "null"
     *   describe(new int[0]) -> "int[]"
     *
     * Note what the parameter type forces: every primitive is boxed on the way
     * in, so this method can never see an `int` — only an `Integer`.
     */
    static String describe(Object value) {
        throw new UnsupportedOperationException("describe: not implemented");
    }

    /**
     * Add two ints, throwing ArithmeticException on overflow rather than
     * silently wrapping around.
     *
     *   safeAdd(2, 3)                       -> 5
     *   safeAdd(Integer.MAX_VALUE, 1)       -> throws ArithmeticException
     *
     * `Integer.MAX_VALUE + 1` is NOT an error in Java — it is Integer.MIN_VALUE.
     * There is a method in java.lang.Math that does this for you.
     */
    static int safeAdd(int a, int b) {
        throw new UnsupportedOperationException("safeAdd: not implemented");
    }

    /**
     * Return true when the two boxed Integers are the SAME OBJECT (`==`).
     *
     *   sameBox(1, 1)       -> true
     *   sameBox(1000, 1000) -> false
     *
     * Both are `Integer.valueOf` of equal numbers, so this looks like it should
     * always be true. It isn't, and the README explains why. Write it with `==`
     * on the boxed values — the point is to make the surprise visible, not to
     * work around it.
     */
    static boolean sameBox(int a, int b) {
        throw new UnsupportedOperationException("sameBox: not implemented");
    }

    /**
     * Narrow an int to a byte the way a cast does, and say what came out.
     *
     *   truncate(65)   -> 65
     *   truncate(200)  -> -56      (200 does not fit in a signed byte)
     *   truncate(-1)   -> -1
     *
     * A cast between primitives never throws; it discards the high bits.
     */
    static byte truncate(int n) {
        throw new UnsupportedOperationException("truncate: not implemented");
    }

    /**
     * Compare two doubles for practical equality within a tolerance.
     *
     *   nearlyEqual(0.1 + 0.2, 0.3, 1e-9) -> true
     *   nearlyEqual(1.0, 1.5, 1e-9)       -> false
     *   nearlyEqual(1.0, 1.0, 0.0)        -> true
     *   nearlyEqual(Double.NaN, Double.NaN, 1e-9) -> false
     *
     * NaN is not equal to anything, itself included, and that must survive here.
     */
    static boolean nearlyEqual(double a, double b, double epsilon) {
        throw new UnsupportedOperationException("nearlyEqual: not implemented");
    }

    /**
     * Parse an int, falling back instead of throwing.
     *
     *   parseOr("42", 0)    -> 42
     *   parseOr("-7", 0)    -> -7
     *   parseOr("nope", 0)  -> 0
     *   parseOr(null, 0)    -> 0
     *   parseOr("", 0)      -> 0
     */
    static int parseOr(String text, int fallback) {
        throw new UnsupportedOperationException("parseOr: not implemented");
    }

    /**
     * The next character in the alphabet, wrapping 'z' round to 'a'.
     *
     *   nextLetter('a') -> 'b'
     *   nextLetter('z') -> 'a'
     *
     * `char` is an integer type: arithmetic on it works, but produces an `int`,
     * so you have to cast back.
     */
    static char nextLetter(char c) {
        throw new UnsupportedOperationException("nextLetter: not implemented");
    }

    /**
     * Divide, returning the quotient — but integer division and floating point
     * division disagree, and both are asked for here.
     *
     *   intDivide(7, 2)   -> 3      (truncated toward zero)
     *   intDivide(-7, 2)  -> -3     (toward zero, NOT floor)
     *   intDivide(1, 0)   -> throws ArithmeticException
     */
    static int intDivide(int a, int b) {
        throw new UnsupportedOperationException("intDivide: not implemented");
    }

    /**
     * The same division in floating point, where nothing throws.
     *
     *   floatDivide(7, 2)  -> 3.5
     *   floatDivide(1, 0)  -> Double.POSITIVE_INFINITY
     *   floatDivide(0, 0)  -> Double.NaN
     *
     * Watch the types: if both arguments are ints, `a / b` is integer division
     * even when the result is assigned to a double.
     */
    static double floatDivide(int a, int b) {
        throw new UnsupportedOperationException("floatDivide: not implemented");
    }
}
