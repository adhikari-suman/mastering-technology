import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotSame;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    /** A three-deep chain, built by hand, used by several tests below. */
    private static final IOException ROOT = new IOException("disk gone");
    private static final IllegalStateException MIDDLE = new IllegalStateException("cannot load", ROOT);
    private static final RuntimeException TOP = new RuntimeException("startup failed", MIDDLE);

    @Test
    @DisplayName("InsufficientFunds: the numbers are fields, not text to parse back out")
    void domainExceptionCarriesData() {
        Solution.InsufficientFunds e = assertThrows(Solution.InsufficientFunds.class,
                () -> Solution.withdraw(1200, 1700));
        assertEquals(1200, e.balance());
        assertEquals(1700, e.requested());
        assertEquals(500, e.shortfall(), "derived from the fields, not from the message");
        assertEquals("insufficient funds: balance 1200, requested 1700", e.getMessage());
    }

    @Test
    @DisplayName("withdraw: the ordinary path returns the new balance")
    void withdrawSucceeds() {
        assertEquals(700, Solution.withdraw(1200, 500));
        assertEquals(0, Solution.withdraw(1200, 1200), "exactly emptying the account is allowed");
    }

    @Test
    @DisplayName("withdraw: a caller bug gets a different type from a domain condition")
    void withdrawRejectsNonsense() {
        assertThrows(IllegalArgumentException.class, () -> Solution.withdraw(1200, -1));
    }

    @Test
    @DisplayName("ConfigException: all four constructors, and what each leaves behind")
    void fourConstructors() {
        assertNull(new Solution.ConfigException().getMessage());
        assertNull(new Solution.ConfigException().getCause());
        assertEquals("bad", new Solution.ConfigException("bad").getMessage());
        assertNull(new Solution.ConfigException("bad").getCause());

        IllegalStateException boom = new IllegalStateException("boom");
        assertEquals("bad", new Solution.ConfigException("bad", boom).getMessage());
        assertSame(boom, new Solution.ConfigException("bad", boom).getCause());
    }

    @Test
    @DisplayName("ConfigException: the cause-only constructor borrows cause.toString() as its message")
    void causeOnlyConstructorMessage() {
        IllegalStateException boom = new IllegalStateException("boom");
        Solution.ConfigException e = new Solution.ConfigException(boom);
        assertSame(boom, e.getCause());
        assertEquals("java.lang.IllegalStateException: boom", e.getMessage(),
                "not \"boom\" — toString(), so the type name comes along");
        assertEquals("java.lang.IllegalStateException: boom", boom.toString(), "same in plain Java");
    }

    @Test
    @DisplayName("readPort: valid ports come back as ints")
    void readPortParses() throws Exception {
        assertEquals(8080, Solution.readPort("8080"));
        assertEquals(1, Solution.readPort("1"));
        assertEquals(65535, Solution.readPort("65535"));
    }

    @Test
    @DisplayName("readPort: a parse failure is wrapped, and the original survives underneath")
    void readPortChainsTheCause() {
        Solution.ConfigException e = assertThrows(Solution.ConfigException.class,
                () -> Solution.readPort("http"));
        assertEquals("port must be a number, got \"http\"", e.getMessage());
        assertTrue(e.getCause() instanceof NumberFormatException,
                "the low-level detail is kept, just not shown to the caller first");

        Solution.ConfigException fromNull = assertThrows(Solution.ConfigException.class,
                () -> Solution.readPort(null));
        assertEquals("port must be a number, got \"null\"", fromNull.getMessage());
    }

    @Test
    @DisplayName("readPort: a range failure has no underlying exception, so it has no cause")
    void readPortRangeHasNoCause() {
        Solution.ConfigException low = assertThrows(Solution.ConfigException.class,
                () -> Solution.readPort("0"));
        assertEquals("port out of range: 0", low.getMessage());
        assertNull(low.getCause(), "do not invent a cause you do not have");

        Solution.ConfigException high = assertThrows(Solution.ConfigException.class,
                () -> Solution.readPort("70000"));
        assertEquals("port out of range: 70000", high.getMessage());
    }

    @Test
    @DisplayName("rootCause: walks to the bottom of the chain")
    void rootCauseWalksDown() {
        assertSame(ROOT, Solution.rootCause(TOP));
        assertSame(ROOT, Solution.rootCause(MIDDLE), "starting one link down finds the same bottom");
        IllegalStateException solo = new IllegalStateException("solo");
        assertSame(solo, Solution.rootCause(solo), "no cause means it is its own root");
        assertNull(Solution.rootCause(null));
    }

    @Test
    @DisplayName("causeChain: outermost first, one line per link")
    void causeChainReads() {
        assertEquals(List.of(
                        "RuntimeException: startup failed",
                        "IllegalStateException: cannot load",
                        "IOException: disk gone"),
                Solution.causeChain(TOP));
        assertEquals(List.of("IllegalStateException: solo"),
                Solution.causeChain(new IllegalStateException("solo")));
        assertEquals(List.of("IllegalStateException: null"),
                Solution.causeChain(new IllegalStateException()), "a missing message prints as null");
        assertEquals(List.of(), Solution.causeChain(null));
    }

    @Test
    @DisplayName("hasCause: subtypes count, and the throwable itself counts")
    void hasCauseSearchesTheChain() {
        assertTrue(Solution.hasCause(TOP, IOException.class));
        assertTrue(Solution.hasCause(TOP, RuntimeException.class), "TOP itself matches");
        assertTrue(Solution.hasCause(TOP, Exception.class), "everything here is an Exception");
        assertFalse(Solution.hasCause(TOP, NumberFormatException.class));
        assertFalse(Solution.hasCause(null, IOException.class));
    }

    @Test
    @DisplayName("wrapUnchecked: wraps a checked exception, passes an unchecked one straight through")
    void wrapUncheckedDoesNotDoubleWrap() {
        IOException checked = new IOException("disk gone");
        RuntimeException wrapped = Solution.wrapUnchecked("loading config", checked);
        assertTrue(wrapped instanceof IllegalStateException);
        assertEquals("loading config: disk gone", wrapped.getMessage());
        assertSame(checked, wrapped.getCause());

        IllegalArgumentException already = new IllegalArgumentException("bad input");
        assertSame(already, Solution.wrapUnchecked("loading config", already),
                "no second layer for a reader to dig through");
    }

    @Test
    @DisplayName("NotFound: a sentinel that never walks the stack")
    void sentinelHasNoStackTrace() {
        Solution.NotFound e = assertThrows(Solution.NotFound.class,
                () -> Solution.indexOfOrThrow(new int[] { 5, 7, 9 }, 8));
        assertEquals("not found", e.getMessage());
        assertEquals(0, e.getStackTrace().length, "fillInStackTrace was overridden away");

        Solution.NotFound second = assertThrows(Solution.NotFound.class,
                () -> Solution.indexOfOrThrow(new int[] { 5, 7, 9 }, 8));
        assertNotSame(e, second, "fresh each time — it is cheap now, not shared");
        assertTrue(new RuntimeException("x").getStackTrace().length > 0,
                "an ordinary exception would have walked the stack here");
    }

    @Test
    @DisplayName("indexOfOrThrow vs indexOf: the same answer, one of them without exceptions")
    void sentinelVersusReturnValue() {
        assertEquals(1, Solution.indexOfOrThrow(new int[] { 5, 7, 9 }, 7));
        assertEquals(1, Solution.indexOf(new int[] { 5, 7, 9 }, 7));
        assertEquals(-1, Solution.indexOf(new int[] { 5, 7, 9 }, 8), "absence is data, not an event");
        assertEquals(-1, Solution.indexOf(new int[] {}, 8));
    }
}
