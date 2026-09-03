import java.util.List;

/**
 * Part 06, Lesson 01 — Threads and Memory
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
     * A shared counter with an ordinary field. Provided — do not change it.
     * Every thread in racyCount() increments this same object.
     */
    static final class PlainBox {
        int value;
    }

    /**
     * The same counter with a volatile field. Provided — do not change it.
     * Note that there is no way to write this with an `int[]`: array elements
     * cannot be volatile.
     */
    static final class VolatileBox {
        volatile int value;
    }

    /**
     * Sum an int array using `threads` threads, combining the results after the
     * join. Split the array into that many contiguous slices; each thread sums
     * its own slice into its own slot, and the caller adds the slots up.
     *
     *   parallelSum(new int[]{1, 2, 3, 4}, 2)  -> 10
     *   parallelSum(new int[]{7}, 4)           -> 7     (three slices are empty)
     *   parallelSum(new int[0], 4)             -> 0
     *   parallelSum(values, 0)                 -> throws IllegalArgumentException
     *
     * The return type is `long` for a reason: two int values can sum to more
     * than Integer.MAX_VALUE, so every accumulator on the way has to be a long,
     * not just the result.
     *
     * No thread may write to a slot another thread also writes to. Done that
     * way there is no shared mutable state at all, and `join()` publishes every
     * slot to the caller.
     */
    static long parallelSum(int[] values, int threads) throws InterruptedException {
        throw new UnsupportedOperationException("parallelSum: not implemented");
    }

    /**
     * Build `new Thread(body)` and either start it or call run() on it, then
     * report which thread the body actually executed on.
     *
     *   whoRuns(true)   -> "other"     // t.start(); t.join();
     *   whoRuns(false)  -> "caller"    // t.run();
     *
     * Compare Thread objects by identity, not by name. This is the first thing
     * everyone gets wrong in Java: `run()` compiles, does the work, and creates
     * no thread whatsoever.
     */
    static String whoRuns(boolean useStart) throws InterruptedException {
        throw new UnsupportedOperationException("whoRuns: not implemented");
    }

    /**
     * Start `threads` threads that each do `box.value++` exactly `perThread`
     * times on ONE shared PlainBox, join them all, and return the final value.
     *
     *   racyCount(1, 1000)   -> 1000        (one thread cannot race itself)
     *   racyCount(4, 100000) -> at most 400000, usually less
     *
     * Write it with no synchronisation of any kind. The point is to make the
     * lost updates visible, not to avoid them.
     */
    static int racyCount(int threads, int perThread) throws InterruptedException {
        throw new UnsupportedOperationException("racyCount: not implemented");
    }

    /**
     * Exactly racyCount, but sharing a VolatileBox instead of a PlainBox.
     *
     *   volatileCount(1, 1000)   -> 1000
     *   volatileCount(4, 100000) -> still at most 400000, still usually less
     *
     * volatile fixes visibility. This method exists so you can see that it does
     * not fix atomicity, and that the two are separate bugs.
     */
    static int volatileCount(int threads, int perThread) throws InterruptedException {
        throw new UnsupportedOperationException("volatileCount: not implemented");
    }

    /**
     * The same total, computed correctly, without locks or atomics: each thread
     * counts into a local variable and writes its subtotal once into its own
     * slot of an array. The caller sums the slots after joining.
     *
     *   unsharedCount(4, 100000) -> exactly 400000, every time
     *   unsharedCount(0, 100000) -> 0
     */
    static int unsharedCount(int threads, int perThread) throws InterruptedException {
        throw new UnsupportedOperationException("unsharedCount: not implemented");
    }

    /**
     * Hand a value back from another thread through a plain, non-volatile
     * field. Start a thread that writes `message.toUpperCase()` into a slot,
     * join it, and return what is in the slot.
     *
     *   handoff("hi")   -> "HI"
     *
     * `message` is never null. There is deliberately no volatile and no lock
     * here: join() alone makes the read safe, and the README says which rule.
     */
    static String handoff(String message) throws InterruptedException {
        throw new UnsupportedOperationException("handoff: not implemented");
    }

    /**
     * Run `body` on a new thread and report what escaped from it, as the simple
     * name of the throwable, or "none" if it completed normally.
     *
     *   uncaught(() -> {})                              -> "none"
     *   uncaught(() -> { throw new IllegalStateException(); }) -> "IllegalStateException"
     *
     * join() will NOT rethrow for you and does not fail. To see the throwable
     * at all you have to install a handler on the thread before starting it —
     * Thread.setUncaughtExceptionHandler. Do not let the default handler print
     * to stderr; capture it instead.
     */
    static String uncaught(Runnable body) throws InterruptedException {
        throw new UnsupportedOperationException("uncaught: not implemented");
    }

    /**
     * A three-element report on a single Thread object's lifetime:
     *
     *   [0]  its Thread.State before start(), as a String    -> "NEW"
     *   [1]  its Thread.State after join(), as a String      -> "TERMINATED"
     *   [2]  the simple name of the exception thrown by calling start() again
     *        on that same finished thread
     *
     *   lifecycle() -> ["NEW", "TERMINATED", "IllegalThreadStateException"]
     *
     * The thread's body can be empty. Note what element [2] means: a Thread is
     * a single-use object, not a reusable worker.
     */
    static List<String> lifecycle() throws InterruptedException {
        throw new UnsupportedOperationException("lifecycle: not implemented");
    }

    /**
     * A configuration value that is safe to hand to any number of threads.
     *
     *   List<String> tags = new ArrayList<>(List.of("a"));
     *   Config c = new Config("db", tags);
     *   tags.add("b");
     *   c.tags()            -> ["a"]      the caller's later change cannot reach it
     *   c.tags().add("x")   -> throws UnsupportedOperationException
     *
     * A record's fields are final, which is what makes it safely publishable —
     * but a final reference to a mutable list is not immutable. Fix that in the
     * compact constructor, in one line, with a method on java.util.List.
     *
     *   new Config("db", null) -> throws NullPointerException
     */
    record Config(String name, List<String> tags) {
        Config {
            throw new UnsupportedOperationException("Config: not implemented");
        }
    }
}
