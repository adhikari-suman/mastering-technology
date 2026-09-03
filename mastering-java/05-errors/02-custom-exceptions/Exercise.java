import java.util.List;

/**
 * Part 05, Lesson 02 — Custom Exceptions
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
 * This lesson is partly about writing exception *types*, so three of the stubs
 * are nested classes. Add whatever fields they need — the stubs deliberately
 * have none.
 */
class Solution {

    /**
     * A domain exception that carries DATA, not just a sentence.
     *
     *   var e = new InsufficientFunds(1200, 1700);
     *   e.getMessage()  -> "insufficient funds: balance 1200, requested 1700"
     *   e.balance()     -> 1200
     *   e.requested()   -> 1700
     *   e.shortfall()   -> 500
     *
     * Amounts are in pence, so they are `long` and never negative. The three
     * accessors are the reason this type exists: a caller that wants the
     * shortfall should not have to run a regex over an English sentence.
     *
     * Unchecked, because overdrawing is a condition the caller was supposed to
     * have checked for — see the README on where that line sits.
     */
    static final class InsufficientFunds extends RuntimeException {
        InsufficientFunds(long balance, long requested) {
            super("InsufficientFunds: not implemented");
            throw new UnsupportedOperationException("InsufficientFunds: not implemented");
        }

        long balance() {
            throw new UnsupportedOperationException("balance: not implemented");
        }

        long requested() {
            throw new UnsupportedOperationException("requested: not implemented");
        }

        long shortfall() {
            throw new UnsupportedOperationException("shortfall: not implemented");
        }
    }

    /**
     * A checked domain exception with the full set of four constructors every
     * exception type should have. Each one delegates to `super`.
     *
     *   new ConfigException().getMessage()            -> null
     *   new ConfigException("bad").getMessage()       -> "bad"
     *   new ConfigException("bad").getCause()         -> null
     *   new ConfigException("bad", boom).getCause()   -> boom
     *   new ConfigException(boom).getCause()          -> boom
     *   new ConfigException(boom).getMessage()        -> ???
     *
     * That last one is the trap. Look up what `Throwable(Throwable)` does with
     * the message before you guess — it is not `boom.getMessage()`.
     *
     * Write all four even though the tests only exercise what they can see:
     * the two cause-taking ones are the whole reason chaining works at all.
     */
    static class ConfigException extends Exception {
        ConfigException() {
            throw new UnsupportedOperationException("ConfigException: not implemented");
        }

        ConfigException(String message) {
            throw new UnsupportedOperationException("ConfigException: not implemented");
        }

        ConfigException(String message, Throwable cause) {
            throw new UnsupportedOperationException("ConfigException: not implemented");
        }

        ConfigException(Throwable cause) {
            throw new UnsupportedOperationException("ConfigException: not implemented");
        }
    }

    /**
     * A sentinel exception used for a "not here" answer: no message worth
     * reading, and deliberately no stack trace at all.
     *
     *   new NotFound().getMessage()           -> "not found"
     *   new NotFound().getStackTrace().length -> 0
     *
     * Override `fillInStackTrace()` to return `this` and the JVM never walks
     * the stack — which is the expensive half of an exception. The README is
     * blunt about when this is a good idea.
     */
    static final class NotFound extends RuntimeException {
        NotFound() {
            super("NotFound: not implemented");
            throw new UnsupportedOperationException("NotFound: not implemented");
        }
    }

    /**
     * Take money out, or refuse with the data attached.
     *
     *   withdraw(1200, 500)   -> 700    (the new balance)
     *   withdraw(1200, 1200)  -> 0
     *   withdraw(1200, 1700)  -> throws InsufficientFunds(1200, 1700)
     *   withdraw(1200, -1)    -> throws IllegalArgumentException
     *
     * A negative amount is not a domain condition, it is a bug in the caller,
     * so it gets a different exception type entirely.
     */
    static long withdraw(long balance, long amount) {
        throw new UnsupportedOperationException("withdraw: not implemented");
    }

    /**
     * Parse a port number out of configuration text, reporting failure as a
     * ConfigException that has not lost the original.
     *
     *   readPort("8080")   -> 8080
     *   readPort("1")      -> 1
     *   readPort("65535")  -> 65535
     *   readPort("http")   -> throws ConfigException
     *                           getMessage() == "port must be a number, got \"http\""
     *                           getCause()   instanceof NumberFormatException
     *   readPort(null)     -> throws ConfigException
     *                           getMessage() == "port must be a number, got \"null\""
     *   readPort("0")      -> throws ConfigException
     *                           getMessage() == "port out of range: 0"
     *                           getCause()   == null
     *   readPort("70000")  -> throws ConfigException, "port out of range: 70000"
     *
     * Two different failures, two different shapes: the parse failure has an
     * underlying exception worth keeping, the range failure has none to keep.
     * Do not invent a cause where there isn't one.
     */
    static int readPort(String raw) throws ConfigException {
        throw new UnsupportedOperationException("readPort: not implemented");
    }

    /**
     * Follow the cause chain to the bottom.
     *
     *   rootCause(new RuntimeException("a", new IOException("b")))  -> the IOException
     *   rootCause(new RuntimeException("a"))                        -> that same object
     *   rootCause(null)                                             -> null
     */
    static Throwable rootCause(Throwable t) {
        throw new UnsupportedOperationException("rootCause: not implemented");
    }

    /**
     * The whole chain as readable lines, outermost first, each formatted as
     * `SimpleName + ": " + message`.
     *
     *   causeChain(top) -> ["RuntimeException: startup failed",
     *                       "IllegalStateException: cannot load",
     *                       "IOException: disk gone"]
     *   causeChain(new IllegalStateException("solo")) -> ["IllegalStateException: solo"]
     *   causeChain(new IllegalStateException())       -> ["IllegalStateException: null"]
     *   causeChain(null)                              -> []
     *
     * This is what `printStackTrace` shows as "Caused by:" lines, and it is the
     * reason wrapping is not the same as replacing.
     */
    static List<String> causeChain(Throwable t) {
        throw new UnsupportedOperationException("causeChain: not implemented");
    }

    /**
     * Is `type` anywhere in this throwable or its chain? Subclasses count.
     *
     *   hasCause(top, IOException.class)            -> true
     *   hasCause(top, RuntimeException.class)       -> true   (top itself)
     *   hasCause(top, NumberFormatException.class)  -> false
     *   hasCause(null, IOException.class)           -> false
     *
     * `Class` has a method that does the instanceof test at runtime; find it
     * rather than reaching for `getClass() == type`, which would miss subtypes.
     */
    static boolean hasCause(Throwable t, Class<? extends Throwable> type) {
        throw new UnsupportedOperationException("hasCause: not implemented");
    }

    /**
     * Make a checked exception unchecked so it can cross a layer that cannot
     * declare it — without wrapping something that is already unchecked.
     *
     *   wrapUnchecked("loading config", new IOException("disk gone"))
     *       -> an IllegalStateException
     *          getMessage() == "loading config: disk gone"
     *          getCause()   == that IOException
     *   wrapUnchecked("loading config", boom)      -> boom itself, unchanged
     *       (where boom is any RuntimeException)
     *
     * Returns the exception rather than throwing it, so callers can write
     * `throw wrapUnchecked(...)` and the compiler can see the method ends.
     * Double-wrapping is a real problem: every extra layer pushes the message
     * a reader needs one "Caused by:" further down.
     */
    static RuntimeException wrapUnchecked(String context, Exception e) {
        throw new UnsupportedOperationException("wrapUnchecked: not implemented");
    }

    /**
     * Find a value, throwing the sentinel when it is absent.
     *
     *   indexOfOrThrow(new int[]{5, 7, 9}, 7)  -> 1
     *   indexOfOrThrow(new int[]{5, 7, 9}, 8)  -> throws NotFound
     *
     * Throw a fresh NotFound each time — it costs almost nothing now that no
     * stack is walked.
     */
    static int indexOfOrThrow(int[] values, int target) {
        throw new UnsupportedOperationException("indexOfOrThrow: not implemented");
    }

    /**
     * The same search, answered with a value instead of an exception.
     *
     *   indexOf(new int[]{5, 7, 9}, 7)  -> 1
     *   indexOf(new int[]{5, 7, 9}, 8)  -> -1
     *
     * Compare the two at the call site before reading the README's verdict.
     */
    static int indexOf(int[] values, int target) {
        throw new UnsupportedOperationException("indexOf: not implemented");
    }
}
