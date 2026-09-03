/**
 * Part 01, Lesson 04 — Methods and Parameters
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

    /** Given to you. One counter shared by every instance… */
    static int total;

    /** …and one counter per instance. Leave both alone. */
    int mine;

    /**
     * Return the string "long". That is the whole body.
     *
     * The interesting part is that this overload exists at all. Work out which
     * of the three `pick` methods a call like `pick(1)` selects before you run
     * the tests — the answer is decided at compile time, by the argument's
     * static type, and it is not the one most people guess.
     */
    static String pick(long value) {
        throw new UnsupportedOperationException("pick(long): not implemented");
    }

    /**
     * Return the string "Integer".
     *
     *   pick(Integer.valueOf(1)) -> "Integer"
     */
    static String pick(Integer value) {
        throw new UnsupportedOperationException("pick(Integer): not implemented");
    }

    /**
     * Return the string "varargs".
     *
     *   pick(1, 2) -> "varargs"
     *   pick()     -> "varargs"
     */
    static String pick(int... values) {
        throw new UnsupportedOperationException("pick(int...): not implemented");
    }

    /**
     * Add up any number of ints.
     *
     *   sum(1, 2, 3)          -> 6
     *   sum(7)                -> 7
     *   sum()                 -> 0
     *   sum(new int[] {4, 5}) -> 9
     *
     * That last call is legal because `int... values` IS `int[] values` — the
     * `...` only grants the caller permission to leave the array out. With no
     * arguments you get an empty array, never null.
     */
    static int sum(int... values) {
        throw new UnsupportedOperationException("sum: not implemented");
    }

    /**
     * Do exactly two things to the argument, in this order:
     *
     *   1. set element 0 to 99
     *   2. rebind the parameter itself:  target = new int[] {-1, -1}
     *
     * Then return. There is no return value; the point is what the caller can
     * observe afterwards:
     *
     *   int[] mine = {1, 2};
     *   poke(mine);
     *   mine   ->   {99, 2}
     *
     * One of those two steps reaches the caller and one cannot. Predict which
     * before running the test, and be able to say why in terms of what was
     * copied at the call.
     *
     * Assume `target` is not null and has at least one element.
     */
    static void poke(int[] target) {
        throw new UnsupportedOperationException("poke: not implemented");
    }

    /**
     * Greet someone with the default greeting.
     *
     *   greet("Ada")  -> "Hello, Ada"
     *   greet(null)   -> "Hello, null"
     *
     * Java has no default parameter values. Implement this by delegating to the
     * two-argument overload below — that delegation IS the Java idiom.
     */
    static String greet(String name) {
        throw new UnsupportedOperationException("greet(String): not implemented");
    }

    /**
     * Greet someone with a given greeting.
     *
     *   greet("Ada", "Hi")   -> "Hi, Ada"
     *   greet("Ada", null)   -> "null, Ada"
     *
     * Note that concatenating a null reference is not an error: it produces the
     * four characters "null".
     */
    static String greet(String name, String greeting) {
        throw new UnsupportedOperationException("greet(String, String): not implemented");
    }

    /**
     * n! computed recursively, refusing to wrap.
     *
     *   factorial(0)  -> 1
     *   factorial(1)  -> 1
     *   factorial(5)  -> 120
     *   factorial(20) -> 2432902008176640000     the largest that fits in a long
     *   factorial(21) -> throws ArithmeticException
     *   factorial(-1) -> throws IllegalArgumentException
     *
     * Plain `*` would give a wrong positive-looking answer for 21 rather than
     * an error; use the checked multiplication from java.lang.Math.
     */
    static long factorial(int n) {
        throw new UnsupportedOperationException("factorial: not implemented");
    }

    /**
     * An INSTANCE method. Increment both counters — the shared `total` and this
     * object's own `mine` — and return the new value of `mine`.
     *
     *   Solution a = new Solution();
     *   Solution b = new Solution();
     *   a.record()   -> 1
     *   a.record()   -> 2
     *   b.record()   -> 1        b has its own `mine`
     *   Solution.total          -> went up by 3, because it belongs to the class
     */
    int record() {
        throw new UnsupportedOperationException("record: not implemented");
    }

    /**
     * A STATIC method returning the shared counter.
     *
     *   Solution.totalCalls() -> however many times record() has ever run
     *
     * It has no `this`, so it can only see static state — which is exactly the
     * difference being drawn here.
     */
    static int totalCalls() {
        throw new UnsupportedOperationException("totalCalls: not implemented");
    }
}
