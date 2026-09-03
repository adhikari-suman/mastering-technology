import java.io.IOException;
import java.util.List;

/**
 * Part 05, Lesson 01 — Exceptions
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
 * `Fetcher` comes from support/Fetcher.java and is compiled for you.
 */
class Solution {

    /**
     * Say which of the three categories a throwable falls into — the categories
     * the *compiler* cares about, not the ones the class names suggest.
     *
     *   classify(new StackOverflowError())      -> "error"
     *   classify(new OutOfMemoryError())        -> "error"
     *   classify(new IllegalStateException())   -> "unchecked"
     *   classify(new NullPointerException())    -> "unchecked"
     *   classify(new IOException())             -> "checked"
     *   classify(new Exception())               -> "checked"
     *   classify(new Throwable())               -> "checked"
     *   classify(null)                          -> "none"
     *
     * Two of the three branches are `instanceof` tests against classes you can
     * name. The third is everything left over. Note where a bare `Throwable`
     * lands: "unchecked" is a small, specific corner of the hierarchy, and
     * everything outside it must be declared or caught.
     */
    static String classify(Throwable t) {
        throw new UnsupportedOperationException("classify: not implemented");
    }

    /**
     * Fetch, falling back when the fetch fails the way I/O fails.
     *
     *   fetchOr(() -> "hi", "?")                                   -> "hi"
     *   fetchOr(() -> { throw new IOException("gone"); }, "?")     -> "?"
     *   fetchOr(() -> { throw new IllegalStateException(); }, "?") -> propagates
     *
     * Catch the narrowest type that describes what you can actually handle. A
     * programming bug arriving as an IllegalStateException is not something a
     * fallback string fixes, so it must be allowed straight through.
     */
    static String fetchOr(Fetcher source, String fallback) {
        throw new UnsupportedOperationException("fetchOr: not implemented");
    }

    /**
     * Fetch, turning the checked failure into an unchecked one so callers are
     * not forced to declare it — without losing the original.
     *
     *   fetchQuietly(() -> "hi")                              -> "hi"
     *   fetchQuietly(() -> { throw new IOException("gone"); })
     *       -> throws java.io.UncheckedIOException
     *          with getMessage() == "could not fetch"
     *          and  getCause()   == the original IOException
     *
     * java.io.UncheckedIOException exists for exactly this, and its
     * (String, IOException) constructor is the one you want.
     */
    static String fetchQuietly(Fetcher source) {
        throw new UnsupportedOperationException("fetchQuietly: not implemented");
    }

    /**
     * Run a fetch inside try/catch/finally and report, in order, which blocks
     * actually executed. Append these exact strings to a fresh list:
     *
     *   "try"       first thing inside the try block
     *   "no-throw"  in the try block, after the fetch returned
     *   "catch"     inside a catch for IOException
     *   "finally"   inside the finally block
     *   "after"     after the whole statement, before returning
     *
     *   trace(() -> "hi")                            -> [try, no-throw, finally, after]
     *   trace(() -> { throw new IOException("x"); }) -> [try, catch, finally, after]
     *
     * The list is the point: `finally` runs on both paths, and it runs before
     * control leaves the method.
     */
    static List<String> trace(Fetcher source) {
        throw new UnsupportedOperationException("trace: not implemented");
    }

    /**
     * Write this body, exactly, and report what comes out:
     *
     *     try { return 1; } finally { return 2; }
     *
     *   finallyWins() -> 2
     *
     * Both returns are reached. Work out which one the method actually
     * performs before you run it — the answer is the whole point of the
     * method, so make the surprise visible rather than avoiding it.
     */
    static int finallyWins() {
        throw new UnsupportedOperationException("finallyWins: not implemented");
    }

    /**
     * The same shape, with a throw instead of a return in the try:
     *
     *     try { throw new IllegalStateException("boom"); } finally { return 42; }
     *
     *   finallySwallows() -> 42, and nothing is thrown
     *
     * An exception is in flight when the finally block runs. Watch what
     * happens to it. This is the trap the README names.
     */
    static int finallySwallows() {
        throw new UnsupportedOperationException("finallySwallows: not implemented");
    }

    /**
     * Read table[index] where the index arrives as text, answering "?" when the
     * request makes no sense — using ONE catch clause for both failures.
     *
     *   lookup(new String[]{"a","b"}, "1")   -> "b"
     *   lookup(new String[]{"a","b"}, "5")   -> "?"
     *   lookup(new String[]{"a","b"}, "-1")  -> "?"
     *   lookup(new String[]{"a","b"}, "x")   -> "?"
     *   lookup(new String[]{"a","b"}, null)  -> "?"
     *   lookup(null, "0")                    -> propagates NullPointerException
     *
     * Multi-catch: `catch (AException | BException e)`. Two unrelated failures,
     * one recovery. A null table is a bug in the caller, not a bad request, so
     * it must not be swept into the same answer.
     */
    static String lookup(String[] table, String index) {
        throw new UnsupportedOperationException("lookup: not implemented");
    }

    /**
     * Construct an exception, do NOT throw it, and return how many frames its
     * stack trace has.
     *
     *   framesWithoutThrowing() -> some number greater than zero
     *
     * Where does the stack trace come from, and when? The answer decides
     * whether "exceptions are slow" is about throwing or about something else.
     */
    static int framesWithoutThrowing() {
        throw new UnsupportedOperationException("framesWithoutThrowing: not implemented");
    }

    /**
     * Fetch; on failure record the message and let the SAME exception object
     * carry on out of the method.
     *
     *   relay(() -> "hi", log)  -> "hi", log stays empty
     *   relay(() -> { throw boom; }, log)
     *       -> throws that identical `boom` instance
     *          and log == ["logged: " + boom.getMessage()]
     *
     * Rethrow the object you caught. Do not construct a new one: a new
     * exception carries a stack trace that starts here, and the frames showing
     * where the failure actually happened are gone.
     */
    static String relay(Fetcher source, List<String> log) throws IOException {
        throw new UnsupportedOperationException("relay: not implemented");
    }
}
