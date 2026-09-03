import java.util.List;

/**
 * Part 07, Lesson 05 — Testing with JUnit
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
 *
 * The framework grading you is also the thing you are reimplementing. The
 * types you need from it are `org.opentest4j.TestAbortedException` (what a
 * failed assumption throws) and plain `java.lang.AssertionError`.
 */
class Solution {

    /**
     * The order in which JUnit runs a class's callbacks and tests.
     *
     *   lifecycle(List.of("a", "b")) ->
     *       ["@BeforeAll",
     *        "@BeforeEach", "a", "@AfterEach",
     *        "@BeforeEach", "b", "@AfterEach",
     *        "@AfterAll"]
     *
     *   lifecycle(List.of("only")) ->
     *       ["@BeforeAll", "@BeforeEach", "only", "@AfterEach", "@AfterAll"]
     *
     *   lifecycle(List.of()) -> ["@BeforeAll", "@AfterAll"]
     *
     * The per-class callbacks run once whether or not there are any tests; the
     * per-test ones bracket each test individually, because JUnit builds a new
     * instance of the test class for every method.
     */
    static List<String> lifecycle(List<String> testNames) {
        throw new UnsupportedOperationException("lifecycle: not implemented");
    }

    /**
     * Classify what came out of a test method.
     *
     *   outcome(null)                                -> "passed"
     *   outcome(new AssertionError("boom"))          -> "failed"
     *   outcome(new AssertionFailedError("boom"))    -> "failed"
     *   outcome(new TestAbortedException("no docker")) -> "aborted"
     *   outcome(new IllegalStateException("boom"))   -> "errored"
     *   outcome(new OutOfMemoryError())              -> "errored"
     *
     * `AssertionError` is an `Error`, and `TestAbortedException` is a
     * `RuntimeException` — neither is a subtype of the other, so the order you
     * test them in does not matter. What does matter is that "not an assertion
     * failure" is not the same as "not a failure".
     */
    static String outcome(Throwable thrown) {
        throw new UnsupportedOperationException("outcome: not implemented");
    }

    /**
     * `assertThrows`, written out. Run the body and:
     *
     *   - it threw the expected type (or a SUBCLASS of it): return the
     *     throwable, so the caller can go on to assert about its message;
     *   - it threw something else: throw an AssertionError whose message is
     *       "expected java.lang.IllegalStateException but got java.lang.IllegalArgumentException"
     *     using the fully qualified names;
     *   - it threw nothing: throw an AssertionError whose message is
     *       "expected java.lang.IllegalStateException but nothing was thrown"
     *
     * Subclasses counting is JUnit's real behaviour and its sharpest edge:
     * `expectThrows(RuntimeException.class, ...)` is satisfied by a
     * NullPointerException, which is rarely what the test author meant.
     *
     * `Class` has a method for "is this object one of mine?" and another for
     * casting to T without an unchecked warning.
     */
    static <T extends Throwable> T expectThrows(Class<T> expected, Runnable body) {
        throw new UnsupportedOperationException("expectThrows: not implemented");
    }

    /**
     * `assertAll`'s defining behaviour: run EVERY check, even after one has
     * failed, and report the messages of all of them.
     *
     *   collectFailures(List.of(ok, ok))              -> []
     *   collectFailures(List.of(failsWith("a"), ok, failsWith("b")))
     *                                                 -> ["a", "b"]
     *
     * Collect from anything thrown, not only AssertionError — a check that
     * blows up is still information. Use String.valueOf on the message so a
     * throwable with no message contributes "null" rather than a hole in the
     * list.
     *
     * This is the difference from writing the assertions one after another:
     * those stop at the first failure and hide the rest.
     */
    static List<String> collectFailures(List<Runnable> checks) {
        throw new UnsupportedOperationException("collectFailures: not implemented");
    }

    /**
     * Split one `@CsvSource` line into its column values.
     *
     *   csvRow("1, 2, three")   -> ["1", "2", "three"]   (values are trimmed)
     *   csvRow("'a, b', c")     -> ["a, b", "c"]         (quote is a SINGLE quote)
     *   csvRow("a,,b")          -> ["a", null, "b"]      (empty means null)
     *   csvRow("a,'',b")        -> ["a", "", "b"]        (quoted empty means "")
     *   csvRow("' padded ', x") -> [" padded ", "x"]     (quotes preserve spaces)
     *   csvRow("")              -> [null]                (one empty column)
     *
     * The delimiter is a comma and the quote character is `'`. Whitespace
     * outside the quotes is trimmed; whitespace inside them is not. A quote
     * escaped inside a quoted value is out of scope here.
     *
     * The null-versus-empty-string rule is the one that bites: a column left
     * blank arrives as null, and a parameter typed `int` cannot take it.
     *
     * Return a list that may contain nulls, so `List.of` is not an option.
     */
    static List<String> csvRow(String line) {
        throw new UnsupportedOperationException("csvRow: not implemented");
    }

    /**
     * The display name JUnit generates for a method when you did not write a
     * @DisplayName: the method name, then its parameter types in brackets,
     * each shortened to the part after the last dot.
     *
     *   displayName("addsItem", List.of())                    -> "addsItem()"
     *   displayName("accepts", List.of("java.lang.String", "int"))
     *                                                          -> "accepts(String, int)"
     *   displayName("takes", List.of("java.util.List"))       -> "takes(List)"
     *   displayName("nested", List.of("com.example.Outer$Inner"))
     *                                                          -> "nested(Outer$Inner)"
     *
     * Types are separated by a comma and a space.
     */
    static String displayName(String methodName, List<String> parameterTypes) {
        throw new UnsupportedOperationException("displayName: not implemented");
    }

    /**
     * Expand a @ParameterizedTest name template once per row of arguments.
     *
     * Placeholders:
     *   {index}      the invocation number, counting from ONE
     *   {0} {1} ...  the argument at that position
     *   {arguments}  every argument, joined with ", "
     *
     *   parameterizedNames("[{index}] {0} -> {1}",
     *                      List.of(List.of("a", 1), List.of("b", 2)))
     *       -> ["[1] a -> 1", "[2] b -> 2"]
     *
     *   parameterizedNames("{arguments}", List.of(List.of(1, 2, 3)))
     *       -> ["1, 2, 3"]
     *
     *   parameterizedNames("{0} {5}", List.of(List.of("x")))
     *       -> ["x {5}"]        an index with no argument is left alone
     *
     * Arguments may be any type and may be null; render them with
     * String.valueOf. `{index}` starting at 1 is the detail everyone gets
     * wrong when reading a failure report.
     */
    static List<String> parameterizedNames(String template, List<List<Object>> rows) {
        throw new UnsupportedOperationException("parameterizedNames: not implemented");
    }

    /**
     * Does a run of these outcomes turn the build red?
     *
     *   verdict(List.of("passed", "passed"))            -> "passed"
     *   verdict(List.of("passed", "aborted"))           -> "passed"
     *   verdict(List.of("passed", "failed"))            -> "failed"
     *   verdict(List.of("errored"))                     -> "failed"
     *   verdict(List.of())                              -> "passed"
     *   verdict(List.of("aborted", "aborted"))          -> "passed"
     *
     * That last line is the whole point of the method. A suite in which every
     * test was skipped by an assumption reports exactly the same colour as a
     * suite in which every test passed.
     */
    static String verdict(List<String> outcomes) {
        throw new UnsupportedOperationException("verdict: not implemented");
    }
}
