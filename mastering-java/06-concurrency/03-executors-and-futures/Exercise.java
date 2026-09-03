import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.function.Function;

/**
 * Part 06, Lesson 03 — Executors and Futures
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
     * Run every task on a fixed pool of `poolSize` threads and return the
     * results in SUBMISSION order — not completion order.
     *
     *   runAll(List.of(() -> 1, () -> 2), 2)  -> [1, 2]
     *   runAll(List.of(), 2)                  -> []
     *
     * Submit them all first, then collect: submitting and immediately calling
     * get() on each one runs them one at a time and the pool never helps.
     *
     * Shut the pool down before returning, however you leave the method.
     * ExecutorService is AutoCloseable, so try-with-resources does it.
     *
     * If a task throws, the ExecutionException from get() propagates — that is
     * why this method declares it.
     */
    static List<Integer> runAll(List<Callable<Integer>> tasks, int poolSize)
            throws InterruptedException, ExecutionException {
        throw new UnsupportedOperationException("runAll: not implemented");
    }

    /**
     * Run one task on an executor and report what it threw, as the simple name
     * of the exception the task itself raised.
     *
     *   causeName(() -> 42)                              -> "none"
     *   causeName(() -> { throw new IllegalStateException(); }) -> "IllegalStateException"
     *   causeName(() -> { throw new IOException(); })    -> "IOException"
     *
     * Note the third one: a Callable may throw checked exceptions, which is a
     * thing a Runnable cannot do.
     *
     * Future.get() does not throw what the task threw. It throws
     * ExecutionException wrapping it, so returning
     * `e.getClass().getSimpleName()` gives you the wrapper and fails here.
     */
    static String causeName(Callable<?> task) throws InterruptedException {
        throw new UnsupportedOperationException("causeName: not implemented");
    }

    /**
     * Show what shutdownNow() hands back. Build a single-thread executor and:
     *
     *   1. submit a task that signals it has started and then blocks until it
     *      is interrupted (catch InterruptedException and return);
     *   2. wait for that signal, so the pool's one thread is definitely busy;
     *   3. submit two more tasks, which therefore sit in the queue;
     *   4. call shutdownNow() and return the size of the List<Runnable> it
     *      returns.
     *
     *   shutdownNowPending() -> 2
     *
     * Those two never ran and never will. shutdownNow gives them back to you
     * rather than throwing them away, and what to do with them is your problem.
     */
    static int shutdownNowPending() throws InterruptedException {
        throw new UnsupportedOperationException("shutdownNowPending: not implemented");
    }

    /**
     * Shut a pool down properly: ask nicely, wait up to `millis`, and if it has
     * still not finished, interrupt what is left and wait `millis` again.
     * Return whether the pool ended up terminated.
     *
     *   awaitOrForce(idlePool, 100)              -> true
     *   awaitOrForce(poolWithABlockedTask, 100)  -> true, but only because
     *                                               shutdownNow interrupted it
     *
     * A plain shutdown() plus awaitTermination() would return false for the
     * second one and leave the thread parked forever. The tests use a task that
     * blocks until interrupted, so only the two-stage version passes.
     */
    static boolean awaitOrForce(ExecutorService pool, long millis) throws InterruptedException {
        throw new UnsupportedOperationException("awaitOrForce: not implemented");
    }

    /**
     * The Promise.all that CompletableFuture.allOf is not: wait for every
     * future and produce their values, in the order they were given.
     *
     *   all(List.of(completedFuture("a"), completedFuture("b")))
     *       -> a future of ["a", "b"]
     *   all(List.of())        -> a future of []
     *
     * allOf takes a varargs array and completes with Void, so it tells you
     * "they are all done" and nothing else. Collect the values afterwards.
     *
     * If any input fails, the returned future fails too — you get that for free
     * from allOf; don't add anything for it.
     */
    static <T> CompletableFuture<List<T>> all(List<CompletableFuture<T>> futures) {
        throw new UnsupportedOperationException("all: not implemented");
    }

    /**
     * Combine two independent futures into one, as "<a>+<b>", without blocking
     * on either.
     *
     *   combine(completedFuture("x"), completedFuture("y"))  -> a future of "x+y"
     *
     * There is one operator for exactly this. Calling get() or join() on the
     * arguments is the wrong answer even though it produces the right string.
     */
    static CompletableFuture<String> combine(CompletableFuture<String> a, CompletableFuture<String> b) {
        throw new UnsupportedOperationException("combine: not implemented");
    }

    /**
     * Feed the value of one future into a function that returns ANOTHER future,
     * and produce a flat future of the final value.
     *
     *   chain(completedFuture("abc"), s -> completedFuture(s.length()))
     *       -> a future of 3, not a future of a future of 3
     *
     * This is flatMap. The map operator would give you
     * CompletableFuture<CompletableFuture<Integer>>, which will not compile
     * against this return type — which is the compiler doing you a favour.
     */
    static CompletableFuture<Integer> chain(CompletableFuture<String> input,
            Function<String, CompletableFuture<Integer>> lookup) {
        throw new UnsupportedOperationException("chain: not implemented");
    }

    /**
     * Replace a failure with a fallback value, leaving a success untouched.
     *
     *   recover(completedFuture("ok"), "fallback")                -> "ok"
     *   recover(failedFuture(new IOException()), "fallback")      -> "fallback"
     *
     * The returned future must never be a failed one.
     */
    static CompletableFuture<String> recover(CompletableFuture<String> future, String fallback) {
        throw new UnsupportedOperationException("recover: not implemented");
    }

    /**
     * Describe how a future ended, as a future of a String:
     *
     *   describe(completedFuture("x"))                       -> "ok:x"
     *   describe(failedFuture(new IllegalStateException()))   -> "err:IllegalStateException"
     *   describe(supplyAsync(() -> { throw new IllegalStateException(); }))
     *                                                        -> "err:IllegalStateException"
     *
     * Those last two are the trap, and they must produce the same string. A
     * failure raised inside a task arrives at your callback wrapped in a
     * CompletionException; a failure handed to failedFuture arrives raw. Unwrap
     * one level when, and only when, you were given a CompletionException with
     * a cause.
     *
     * Handle both outcomes in one operator, and never let the result fail.
     */
    static CompletableFuture<String> describe(CompletableFuture<String> future) {
        throw new UnsupportedOperationException("describe: not implemented");
    }
}
