import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;

/**
 * Part 06, Lesson 04 — Virtual Threads
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
     * Run `tasks` short tasks on the given pool and return how many of them
     * found themselves on a virtual thread.
     *
     *   countVirtual(Executors.newVirtualThreadPerTaskExecutor(), 50)  -> 50
     *   countVirtual(Executors.newFixedThreadPool(4), 50)              -> 0
     *
     * The caller owns the pool and will close it; do not shut it down here.
     * Wait for every task before returning — the count is worthless otherwise.
     */
    static int countVirtual(ExecutorService pool, int tasks) throws InterruptedException {
        throw new UnsupportedOperationException("countVirtual: not implemented");
    }

    /**
     * Run every task on its own virtual thread and return the results in the
     * order the tasks were given.
     *
     *   inParallel(List.of(() -> "a", () -> "b"))  -> ["a", "b"]
     *   inParallel(List.of())                      -> []
     *
     * Create the executor here with Executors.newVirtualThreadPerTaskExecutor()
     * and close it before returning; try-with-resources is the whole story.
     * There is a single ExecutorService method that submits a collection and
     * returns the Futures in the collection's order.
     *
     * If a task throws, the ExecutionException propagates.
     */
    static <T> List<T> inParallel(List<Callable<T>> tasks)
            throws InterruptedException, ExecutionException {
        throw new UnsupportedOperationException("inParallel: not implemented");
    }

    /**
     * Start `tasks` virtual threads that each sleep `millis` milliseconds, wait
     * for all of them, and return how many finished.
     *
     *   fanOutBlocking(10000, 50) -> 10000, in a fraction of a second
     *
     * The point is the number. Ten thousand platform threads would be ten
     * thousand OS threads and about ten gigabytes of stack reservation; ten
     * thousand virtual threads blocked in sleep are ten thousand heap objects.
     *
     * Do not create the threads one at a time with Thread.ofVirtual().start()
     * and a list of handles unless you want to — the thread-per-task executor
     * plus try-with-resources does the waiting for you.
     */
    static int fanOutBlocking(int tasks, long millis) throws InterruptedException {
        throw new UnsupportedOperationException("fanOutBlocking: not implemented");
    }

    /**
     * Measure how many separate values a ThreadLocal ends up holding when
     * `tasks` tasks run on the given pool.
     *
     * Declare a ThreadLocal whose initial value is a fresh object (a new
     * Object, or an incrementing number — anything with its own identity), have
     * each task read it, and return how many DISTINCT values were produced.
     *
     *   distinctThreadLocals(Executors.newVirtualThreadPerTaskExecutor(), 200) -> 200
     *   distinctThreadLocals(Executors.newFixedThreadPool(2), 200)             -> at most 2
     *
     * That is the whole ThreadLocal story under virtual threads: one copy per
     * task instead of one copy per pool thread, and no reuse at all. Nothing is
     * broken; the cost simply moved.
     *
     * The caller owns the pool. Wait for every task before counting.
     */
    static int distinctThreadLocals(ExecutorService pool, int tasks) throws InterruptedException {
        throw new UnsupportedOperationException("distinctThreadLocals: not implemented");
    }

    /**
     * Build — but do not start — a virtual Thread that will run `body`.
     *
     *   Thread t = unstartedVirtual(() -> {});
     *   t.isVirtual()   -> true
     *   t.getState()    -> Thread.State.NEW
     *   t.getName()     -> ""       virtual threads have no name unless you give one
     *   t.isDaemon()    -> true     always, and setDaemon(false) throws
     *   t.getPriority() -> 5        always; setPriority is accepted and ignored
     *
     * Thread.ofVirtual() gives you the builder. Do not name it.
     */
    static Thread unstartedVirtual(Runnable body) {
        throw new UnsupportedOperationException("unstartedVirtual: not implemented");
    }

    /**
     * Ask whether this pool can have `tasks` tasks genuinely in flight at once.
     *
     * Submit `tasks` tasks that each announce their arrival and then wait for a
     * release signal. Wait up to `millis` for all of them to arrive, then
     * release them all and let them finish. Return whether they all arrived.
     *
     *   canRunConcurrently(newVirtualThreadPerTaskExecutor(), 500, 5000) -> true
     *   canRunConcurrently(newFixedThreadPool(2), 500, 500)              -> false
     *
     * Two CountDownLatches do this: one counting down from `tasks`, one to hold
     * everybody until you let go. Release the waiting tasks whatever the answer
     * was, or the pool's threads stay parked forever.
     *
     * The caller owns the pool. Note what this measures: not whether the
     * threads are virtual, but whether anything is limiting how many run.
     */
    static boolean canRunConcurrently(ExecutorService pool, int tasks, long millis)
            throws InterruptedException {
        throw new UnsupportedOperationException("canRunConcurrently: not implemented");
    }

    /**
     * Run `task` on a virtual thread and wait up to `millis` for it. Return its
     * result, or `fallback` if it did not finish in time — and cancel it, with
     * an interrupt, on the way out.
     *
     *   withTimeout(() -> "quick", 5000, "fallback")        -> "quick"
     *   withTimeout(() -> { blockForever(); }, 100, "late") -> "late"
     *
     * Future.get(timeout, unit) throws TimeoutException; that is the branch
     * where you cancel. If the task itself throws, return `fallback` too.
     *
     * A cancelled task blocked in sleep() or await() gets an
     * InterruptedException — the tests check that it really was interrupted, so
     * cancel(true), not cancel(false). Close the executor before you return, so
     * the cancelled task has actually finished by the time the caller sees the
     * fallback.
     */
    static <T> T withTimeout(Callable<T> task, long millis, T fallback) throws InterruptedException {
        throw new UnsupportedOperationException("withTimeout: not implemented");
    }
}
