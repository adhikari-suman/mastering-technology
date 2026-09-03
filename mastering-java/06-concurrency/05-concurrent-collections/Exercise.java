import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

/**
 * Part 06, Lesson 05 — Concurrent Collections
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
     * Count the words, the broken way, so you can see it break. Every one of
     * `threads` threads walks the WHOLE list once, counting into a shared
     * Collections.synchronizedMap, with the count read and written as two
     * separate calls:
     *
     *     counts.put(word, counts.getOrDefault(word, 0) + 1);
     *
     *   tallyUnsafe(List.of("a", "b", "a"), 1)  -> {a=2, b=1}   exact, no race
     *   tallyUnsafe(List.of("a", "b", "a"), 4)  -> {a=?, b=?}   at most {a=8, b=4}
     *
     * Write it exactly like that. Both calls are individually synchronized and
     * the pair is not, which is the entire point. The key set still comes out
     * right; only the numbers are lost.
     */
    static Map<String, Integer> tallyUnsafe(List<String> words, int threads) throws InterruptedException {
        throw new UnsupportedOperationException("tallyUnsafe: not implemented");
    }

    /**
     * The same counts, correct at any number of threads, using a
     * ConcurrentHashMap and ONE call per word.
     *
     *   tally(List.of("a", "b", "a"), 4)  -> exactly {a=8, b=4}
     *   tally(List.of(), 4)               -> {}
     *
     * There is a Map method that takes a key, a value to use if absent, and a
     * function to combine with the value if present. Reading the old value and
     * putting a new one — in any arrangement — is the bug from tallyUnsafe.
     */
    static Map<String, Integer> tally(List<String> words, int threads) throws InterruptedException {
        throw new UnsupportedOperationException("tally: not implemented");
    }

    /**
     * Return the value for `key`, computing it with `supplier` if it is not
     * there yet — and computing it at most once however many threads ask at the
     * same moment.
     *
     *   ConcurrentHashMap<String, String> cache = new ConcurrentHashMap<>();
     *   computeOnce(cache, "k", () -> "loaded")   -> "loaded"
     *   computeOnce(cache, "k", () -> "again")    -> "loaded", supplier not called
     *
     * One ConcurrentHashMap method does this and holds the bin's lock while the
     * function runs. `if (!map.containsKey(k)) map.put(k, supplier.get())` is
     * the check-then-act bug and calls the supplier once per racing thread.
     */
    static <V> V computeOnce(ConcurrentHashMap<String, V> map, String key, Supplier<V> supplier) {
        throw new UnsupportedOperationException("computeOnce: not implemented");
    }

    /**
     * Store `value` under `key` only if nothing is there, and return whichever
     * value is in the map afterwards — the one that was already there, or the
     * one you just put.
     *
     *   map is empty:              firstWriterWins(map, "k", "mine") -> "mine"
     *   map already has k="yours": firstWriterWins(map, "k", "mine") -> "yours"
     *                              and the map still holds "yours"
     *
     * putIfAbsent reads backwards: it returns the PREVIOUS value, so null means
     * the key was absent and your value won. Do not call get() afterwards to
     * find out — that is two operations again, and another thread can move in
     * between them.
     */
    static String firstWriterWins(ConcurrentHashMap<String, String> map, String key, String value) {
        throw new UnsupportedOperationException("firstWriterWins: not implemented");
    }

    /**
     * Walk the collection with an enhanced for loop and, while visiting the
     * FIRST element, add the string "extra" to that same collection. Keep
     * going, and report what happened:
     *
     *   - if the walk finished, "visited=" plus how many elements you saw
     *   - if it threw, the simple name of the exception
     *
     *   iterateWhileMutating(new ArrayList<>(List.of("a","b","c")))
     *       -> "ConcurrentModificationException"    fail-fast, on one thread
     *   iterateWhileMutating(new CopyOnWriteArrayList<>(List.of("a","b","c")))
     *       -> "visited=3"                          the iterator is a snapshot
     *   a ConcurrentHashMap.newKeySet() already holding "a","b","c"
     *       -> "visited=..."                        weakly consistent, count unspecified
     *   iterateWhileMutating(List.of())             -> "visited=0"
     *
     * Add nothing if the collection is empty — there is no first element.
     * Catch only the exception the fail-fast iterators throw.
     */
    static String iterateWhileMutating(Collection<String> collection) {
        throw new UnsupportedOperationException("iterateWhileMutating: not implemented");
    }

    /**
     * Show how a BlockingQueue refuses work when it is full. Make an
     * ArrayBlockingQueue of capacity 1, fill it, then try the named operation
     * with one more element and report the outcome:
     *
     *   whenFull("add")   -> "IllegalStateException"   the name of what it threw
     *   whenFull("offer") -> "false"                   it just says no
     *   whenFull("put")   -> "blocked"                 it waits, forever
     *   whenFull("shove") -> throws IllegalArgumentException
     *
     * For "put" you cannot call it on this thread or nothing else ever happens.
     * Run it on another thread, wait a bounded time, confirm the thread is
     * still alive, interrupt it so it does not leak, and return "blocked".
     */
    static String whenFull(String operation) throws InterruptedException {
        throw new UnsupportedOperationException("whenFull: not implemented");
    }

    /**
     * A bounded work queue, end to end. Put every job into an
     * ArrayBlockingQueue of capacity `capacity`, run `workers` consumer threads
     * that take jobs and add job*job to a shared total, and return the total
     * once everything has been processed.
     *
     *   processJobs(List.of(1, 2, 3), 2, 4)  -> 14        (1 + 4 + 9)
     *   processJobs(List.of(), 2, 4)         -> 0
     *
     * Jobs are never negative. Stop the workers with poison pills: queue the
     * Integer -1 once per worker after the real jobs, and have a worker return
     * when it takes one. One pill is not enough — the worker that takes it is
     * the only one that stops.
     *
     * Watch the comparison. The queue holds boxed Integers, and `==` between
     * two Integer variables is an identity test that happens to work inside the
     * -128..127 cache and silently stops working outside it. Compare against
     * the int literal -1, which unboxes, or use equals.
     *
     * The capacity is deliberately small in the tests, so put() blocks while
     * the workers catch up. That is backpressure. Producing on the calling
     * thread is fine — as long as the workers are already running when you
     * start, or you will block forever against your own empty consumers.
     */
    static long processJobs(List<Integer> jobs, int workers, int capacity) throws InterruptedException {
        throw new UnsupportedOperationException("processJobs: not implemented");
    }
}
