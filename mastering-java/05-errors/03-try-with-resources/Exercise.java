import java.io.IOException;
import java.util.List;

/**
 * Part 05, Lesson 03 — try-with-resources
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
 * Most methods here take a `List<String> log` and append to it. The list, read
 * afterwards, is the evidence: it shows which blocks ran and in what order.
 */
class Solution {

    /**
     * A resource you can watch. Every interesting moment appends a line to the
     * shared log.
     *
     *   var log = new ArrayList<String>();
     *   try (Probe p = new Probe("a", log, false)) { p.use(); }
     *   log -> ["open:a", "use:a", "close:a"]
     *
     * Constructing it appends `"open:" + name`.
     * `use()` appends `"use:" + name`.
     * `close()` appends `"close:" + name` and then, if `failOnClose`, throws
     * `new IllegalStateException("close:" + name)` — after logging, so the log
     * always records that close was attempted.
     *
     * Declare `close()` with NO throws clause. `AutoCloseable.close()` declares
     * `throws Exception`, and an override is free to narrow that to nothing —
     * which is why callers of a well-behaved resource need no catch at all.
     */
    static final class Probe implements AutoCloseable {
        Probe(String name, List<String> log, boolean failOnClose) {
            throw new UnsupportedOperationException("Probe: not implemented");
        }

        void use() {
            throw new UnsupportedOperationException("use: not implemented");
        }

        @Override
        public void close() {
            throw new UnsupportedOperationException("close: not implemented");
        }
    }

    /**
     * Open two probes in ONE try-with-resources header, use both, close nothing
     * by hand.
     *
     *   closeOrder(log)
     *   log -> ["open:a", "open:b", "use:a", "use:b", "close:b", "close:a"]
     *
     * Neither probe fails on close. Note the tail of that list before you run
     * it: resources are closed in the reverse of the order they were declared,
     * because b may depend on a.
     */
    static void closeOrder(List<String> log) {
        throw new UnsupportedOperationException("closeOrder: not implemented");
    }

    /**
     * One probe that closes cleanly, a body that throws, and a catch and a
     * finally on the SAME try statement.
     *
     *   try (Probe a = new Probe("a", log, false)) {
     *       log.add("body");
     *       throw new IllegalStateException("body");
     *   } catch (IllegalStateException e) {
     *       log.add("catch");
     *   } finally {
     *       log.add("finally");
     *   }
     *
     *   closeBeforeCatch(log)
     *   log -> ["open:a", "body", ???, ???, ???]
     *
     * Nothing escapes the method. Write down the order of the last three
     * entries before you run it — most people get this one wrong.
     */
    static void closeBeforeCatch(List<String> log) {
        throw new UnsupportedOperationException("closeBeforeCatch: not implemented");
    }

    /**
     * Two probes that BOTH fail on close, and a body that throws first.
     *
     *   try (Probe a = new Probe("a", log, true); Probe b = new Probe("b", log, true)) {
     *       log.add("body");
     *       throw new IllegalStateException("body");
     *   }
     *
     *   bodyWinsOverClose(log)
     *       -> throws IllegalStateException, getMessage() == "body"
     *          getSuppressed() == the two close failures, in close order
     *   log -> ["open:a", "open:b", "body", "close:b", "close:a"]
     *
     * Three exceptions, one of them thrown. Nothing is lost: the two that lost
     * are attached to the winner. No catch clause here — let it out.
     */
    static void bodyWinsOverClose(List<String> log) {
        throw new UnsupportedOperationException("bodyWinsOverClose: not implemented");
    }

    /**
     * One probe that fails on close, and a body that succeeds.
     *
     *   try (Probe a = new Probe("a", log, true)) { log.add("body"); }
     *
     *   closeFailsAlone(log)
     *       -> throws IllegalStateException, getMessage() == "close:a"
     *          getSuppressed().length == 0
     *   log -> ["open:a", "body", "close:a"]
     *
     * With no body failure to lose to, the close failure is the failure.
     */
    static void closeFailsAlone(List<String> log) {
        throw new UnsupportedOperationException("closeFailsAlone: not implemented");
    }

    /**
     * The same situation as bodyWinsOverClose, written the pre-Java-7 way, with
     * ONE probe and a hand-written finally:
     *
     *   Probe a = new Probe("a", log, true);
     *   try {
     *       log.add("body");
     *       throw new IllegalStateException("body");
     *   } finally {
     *       a.close();
     *   }
     *
     *   finallyCloseBug(log)
     *       -> throws IllegalStateException, getMessage() == ???
     *          getSuppressed().length == ???
     *   log -> ["open:a", "body", "close:a"]
     *
     * Write it exactly like that. This is the shape every Java tutorial taught
     * before 2011, and the README explains why it is a bug rather than a style
     * preference. Do not fix it — the point is to see what it does.
     */
    static void finallyCloseBug(List<String> log) {
        throw new UnsupportedOperationException("finallyCloseBug: not implemented");
    }

    /**
     * Close a probe you were handed, without redeclaring it.
     *
     *   useExisting(probe)   // calls probe.use(), then closes it
     *
     * Since Java 9 a try-with-resources header may name an existing final or
     * effectively-final variable instead of declaring a new one:
     *
     *     try (probe) { … }
     *
     * A method parameter you never reassign is effectively final, so this
     * compiles. Use that form.
     */
    static void useExisting(Probe probe) {
        throw new UnsupportedOperationException("useExisting: not implemented");
    }

    /**
     * A try-with-resources whose resource is null:
     *
     *   try (Probe p = null) { log.add("body"); }
     *
     *   nullResource(log)
     *   log -> ["body"]     and nothing is thrown
     *
     * Predict this one first. A hand-written `finally { p.close(); }` would do
     * something different.
     */
    static void nullResource(List<String> log) {
        throw new UnsupportedOperationException("nullResource: not implemented");
    }

    /**
     * Read every line of a string through a real java.io resource, using
     * try-with-resources so it is closed for you.
     *
     *   readLines("a\nb\n")   -> ["a", "b"]
     *   readLines("a\nb")     -> ["a", "b"]     (no trailing newline needed)
     *   readLines("")         -> []
     *   readLines("\n")       -> [""]           (one empty line)
     *
     * Build a `java.io.BufferedReader` over a `java.io.StringReader`. Both are
     * `Closeable`, whose `close()` narrows `AutoCloseable`'s to
     * `throws IOException` — which is why this method must declare it.
     */
    static List<String> readLines(String text) throws IOException {
        throw new UnsupportedOperationException("readLines: not implemented");
    }
}
