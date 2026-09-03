import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.junit.jupiter.params.provider.Arguments.arguments;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.opentest4j.AssertionFailedError;
import org.opentest4j.TestAbortedException;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 *
 * This file deliberately uses the features the lesson is about — @Nested,
 * @ParameterizedTest with all three sources, @BeforeEach, assertAll,
 * assertThrows and an assumption. Read it as documentation.
 */
@DisplayName("JUnit, reimplemented")
class ExerciseTest {

    private List<String> log;

    @BeforeEach
    void freshLog() {
        log = new ArrayList<>();
    }

    /** A check that fails with a known message, for collectFailures. */
    private static Runnable failsWith(String message) {
        return () -> {
            throw new AssertionFailedError(message);
        };
    }

    static Stream<Arguments> generatedNames() {
        return Stream.of(
                arguments("addsItem", List.of(), "addsItem()"),
                arguments("takes", List.of("java.util.List"), "takes(List)"),
                arguments("nested", List.of("com.example.Outer$Inner"), "nested(Outer$Inner)"));
    }

    @Test
    @DisplayName("lifecycle: per-class callbacks once, per-test callbacks each time")
    void lifecycleBracketsEveryTest() {
        assertEquals(
                List.of("@BeforeAll", "@BeforeEach", "a", "@AfterEach", "@BeforeEach", "b", "@AfterEach", "@AfterAll"),
                Solution.lifecycle(List.of("a", "b")));
        assertEquals(List.of("@BeforeAll", "@AfterAll"), Solution.lifecycle(List.of()),
                "the class-level callbacks run even with nothing to run between them");
    }

    @Test
    @DisplayName("@BeforeEach really does give each test a fresh instance")
    void stateDoesNotLeakBetweenTests() {
        assertEquals(List.of(), log, "whatever the other tests did to this field, it is gone");
        log.add("mine");
        assertEquals(1, log.size());
    }

    @Nested
    @DisplayName("classifying what a test threw")
    class Outcomes {

        @Test
        @DisplayName("nothing thrown is the only thing that passes")
        void passedAndFailed() {
            assertEquals("passed", Solution.outcome(null));
            assertEquals("failed", Solution.outcome(new AssertionError("boom")));
            assertEquals("failed", Solution.outcome(new AssertionFailedError("boom")),
                    "what assertEquals actually throws");
        }

        @Test
        @DisplayName("an assumption aborts; anything else errors")
        void abortedAndErrored() {
            assertEquals("aborted", Solution.outcome(new TestAbortedException("no docker")));
            assertEquals("errored", Solution.outcome(new IllegalStateException("boom")));
            assertEquals("errored", Solution.outcome(new OutOfMemoryError()));
        }

        @Test
        @DisplayName("an AssertionError is an Error, which is why catch(Exception) cannot eat it")
        void assertionErrorIsAnError() {
            assertTrue(new AssertionError("x") instanceof Error);
            assertTrue(new TestAbortedException("x") instanceof RuntimeException,
                    "and an aborted test is a RuntimeException, unrelated to AssertionError");
        }

        @Test
        @DisplayName("verdict: aborted is green, which is what makes assumptions dangerous")
        void verdictIgnoresAborted() {
            assertEquals("passed", Solution.verdict(List.of("passed", "passed")));
            assertEquals("passed", Solution.verdict(List.of("aborted", "aborted")),
                    "a suite that ran nothing at all reports the same colour as one that passed");
            assertEquals("failed", Solution.verdict(List.of("passed", "failed")));
            assertEquals("failed", Solution.verdict(List.of("errored")));
            assertEquals("passed", Solution.verdict(List.of()));
        }
    }

    @Test
    @DisplayName("expectThrows: returns what it caught, so you can keep asserting")
    void expectThrowsHandsBackTheThrowable() {
        IllegalArgumentException caught = Solution.expectThrows(IllegalArgumentException.class, () -> {
            throw new IllegalArgumentException("bad input");
        });
        assertEquals("bad input", caught.getMessage());
    }

    @Test
    @DisplayName("expectThrows: a subclass counts, which is rarely what you meant")
    void expectThrowsAcceptsSubclasses() {
        RuntimeException caught = Solution.expectThrows(RuntimeException.class, () -> {
            throw new NullPointerException("oops");
        });
        assertTrue(caught instanceof NullPointerException, "asking for RuntimeException got you an NPE");
    }

    @Test
    @DisplayName("expectThrows: the two ways it fails, with the messages it must produce")
    void expectThrowsReportsBothFailures() {
        AssertionError wrongType = assertThrows(AssertionError.class,
                () -> Solution.expectThrows(IllegalStateException.class, () -> {
                    throw new IllegalArgumentException("x");
                }));
        assertEquals("expected java.lang.IllegalStateException but got java.lang.IllegalArgumentException",
                wrongType.getMessage());

        AssertionError nothing = assertThrows(AssertionError.class,
                () -> Solution.expectThrows(IllegalStateException.class, () -> { }));
        assertEquals("expected java.lang.IllegalStateException but nothing was thrown", nothing.getMessage());
    }

    @Test
    @DisplayName("collectFailures: every check runs, unlike a sequence of assertions")
    void collectFailuresRunsThemAll() {
        List<String> ran = new ArrayList<>();
        List<String> failures = Solution.collectFailures(List.of(
                () -> ran.add("one"),
                () -> {
                    ran.add("two");
                    throw new AssertionFailedError("second is wrong");
                },
                () -> {
                    ran.add("three");
                    throw new IllegalStateException("third exploded");
                }));
        assertEquals(List.of("one", "two", "three"), ran, "the failure did not stop the ones after it");
        assertEquals(List.of("second is wrong", "third exploded"), failures,
                "an exception counts too — a check that blew up is still information");
        assertEquals(List.of(), Solution.collectFailures(List.of(() -> { }, () -> { })));
        assertEquals(List.of(), Solution.collectFailures(List.of()));
    }

    @Test
    @DisplayName("collectFailures: a throwable with no message still occupies a slot")
    void collectFailuresKeepsNullMessages() {
        assertEquals(List.of("null"), Solution.collectFailures(List.of(() -> {
            throw new AssertionError();
        })));
        assertEquals(List.of("a", "b"), Solution.collectFailures(List.of(failsWith("a"), failsWith("b"))));
    }

    @Test
    @DisplayName("csvRow: whitespace is trimmed, single quotes protect it")
    void csvRowTrimsAndQuotes() {
        assertEquals(Arrays.asList("1", "2", "three"), Solution.csvRow("1, 2, three"));
        assertEquals(Arrays.asList("a, b", "c"), Solution.csvRow("'a, b', c"), "the quote character is ' not \"");
        assertEquals(Arrays.asList(" padded ", "x"), Solution.csvRow("' padded ', x"));
    }

    @Test
    @DisplayName("csvRow: an empty column is null, but a quoted empty column is \"\"")
    void csvRowDistinguishesEmptyFromNull() {
        assertEquals(Arrays.asList("a", null, "b"), Solution.csvRow("a,,b"));
        assertEquals(Arrays.asList("a", "", "b"), Solution.csvRow("a,'',b"));
        assertEquals(Arrays.asList((String) null), Solution.csvRow(""));
        assertNull(Solution.csvRow("x, ").get(1), "trailing whitespace trims away to nothing, and nothing is null");
    }

    @ParameterizedTest(name = "{0} columns")
    @ValueSource(ints = { 1, 2, 3 })
    @DisplayName("csvRow: a row of n values has n columns, one parameterized case per n")
    void csvRowColumnCount(int columns) {
        String line = String.join(",", java.util.Collections.nCopies(columns, "x"));
        assertEquals(columns, Solution.csvRow(line).size());
    }

    @ParameterizedTest
    @CsvSource({ "addsItem, addsItem()", "removes, removes()" })
    @DisplayName("displayName: no parameters means empty brackets")
    void displayNameWithoutParameters(String method, String expected) {
        assertEquals(expected, Solution.displayName(method, List.of()));
    }

    @ParameterizedTest
    @MethodSource("generatedNames")
    @DisplayName("displayName: parameter types are shortened to their last segment")
    void displayNameShortensTypes(String method, List<String> types, String expected) {
        assertEquals(expected, Solution.displayName(method, types));
    }

    @Test
    @DisplayName("displayName: several parameters are joined with a comma and a space")
    void displayNameJoinsParameters() {
        assertEquals("accepts(String, int)", Solution.displayName("accepts", List.of("java.lang.String", "int")));
    }

    @Test
    @DisplayName("parameterizedNames: {index} counts from one, not zero")
    void parameterizedNamesExpandPlaceholders() {
        assertAll("all three placeholder kinds",
                () -> assertEquals(List.of("[1] a -> 1", "[2] b -> 2"),
                        Solution.parameterizedNames("[{index}] {0} -> {1}",
                                List.of(List.of("a", 1), List.of("b", 2)))),
                () -> assertEquals(List.of("1, 2, 3"),
                        Solution.parameterizedNames("{arguments}", List.of(List.of(1, 2, 3)))),
                () -> assertEquals(List.of("x {5}"),
                        Solution.parameterizedNames("{0} {5}", List.of(List.of("x")))));
    }

    @Test
    @DisplayName("parameterizedNames: nulls render, they do not blow up")
    void parameterizedNamesHandleNulls() {
        List<Object> row = new ArrayList<>();
        row.add(null);
        assertEquals(List.of("[1] null"), Solution.parameterizedNames("[{index}] {0}", List.of(row)));
        assertEquals(List.of(), Solution.parameterizedNames("{index}", List.of()));
    }

    @Test
    @DisplayName("an assumption that holds lets the test run — one that does not would abort it")
    void assumptionsGuardRatherThanFail() {
        assumeTrue(Runtime.version().feature() >= 25, "this curriculum needs JDK 25");
        assertEquals("aborted", Solution.outcome(new TestAbortedException("what assumeTrue(false) throws")));
    }
}
