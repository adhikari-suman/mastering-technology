import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.UnaryOperator;

/**
 * Part 06, Lesson 02 — Synchronization
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
     * A bank account with no protection of its own. Provided — do not change
     * it. Nothing here is synchronized, on purpose: the safety has to come from
     * transfer(), because that is where the invariant lives.
     */
    static final class Account {
        private final int id;
        private int balance;

        Account(int id, int balance) {
            this.id = id;
            this.balance = balance;
        }

        int id() {
            return id;
        }

        int balance() {
            return balance;
        }

        void add(int amount) {
            balance += amount;
        }
    }

    /**
     * An immutable pair of numbers, for updateAtomically. Provided.
     */
    record Tally(int calls, long total) { }

    /**
     * Start `threads` threads that each increment a shared counter `perThread`
     * times, guarded by a monitor, and return the total after joining.
     *
     *   synchronizedCount(4, 100000) -> exactly 400000, every time
     *   synchronizedCount(0, 100000) -> 0
     *
     * Use `synchronized`, not an atomic — that is the next method. Lock on
     * something private that only this method can reach.
     */
    static int synchronizedCount(int threads, int perThread) throws InterruptedException {
        throw new UnsupportedOperationException("synchronizedCount: not implemented");
    }

    /**
     * The same total again, with an AtomicInteger and no lock anywhere.
     *
     *   atomicCount(4, 100000) -> exactly 400000, every time
     *
     * One call per increment. `counter.set(counter.get() + 1)` is the same
     * broken read-modify-write as `++` and will not pass.
     */
    static int atomicCount(int threads, int perThread) throws InterruptedException {
        throw new UnsupportedOperationException("atomicCount: not implemented");
    }

    /**
     * Recurse `n` times, acquiring the SAME monitor at every level, and return
     * how many levels deep you got.
     *
     *   reentrantDepth(0)  -> 0
     *   reentrantDepth(5)  -> 5
     *
     * The whole point is that this terminates. A lock that was not reentrant
     * would block the thread on its own second acquire and hang here forever.
     * Take the lock at every level, not only the first.
     */
    static int reentrantDepth(int n) {
        throw new UnsupportedOperationException("reentrantDepth: not implemented");
    }

    /**
     * Move `amount` from one account to the other, holding BOTH locks for the
     * whole move so no other thread can see the money in neither place.
     *
     *   Account a = new Account(1, 100), b = new Account(2, 100);
     *   transfer(a, b, 30);   // a.balance() -> 70, b.balance() -> 130
     *   transfer(a, a, 30);   // a.balance() unchanged, and must not deadlock
     *
     * Lock the two Account objects themselves. The obvious version — lock
     * `from`, then lock `to` — deadlocks the moment two threads transfer in
     * opposite directions between the same pair. Take them in an order that
     * every caller agrees on; Account.id() is there for that.
     *
     * Overdrafts are allowed; balances may go negative.
     */
    static void transfer(Account from, Account to, int amount) {
        throw new UnsupportedOperationException("transfer: not implemented");
    }

    /**
     * Try to take `lock` for up to `millis` milliseconds. If you get it, run
     * `body`, release the lock, and return true. If you do not, return false
     * without running `body`.
     *
     *   tryRun(freeLock, 50, body)               -> true,  body ran
     *   tryRun(lockHeldByAnotherThread, 50, body) -> false, body did not run
     *
     * Two things this must get right:
     *   - the unlock belongs in a `finally`, or an exception from `body` leaks
     *     the lock and every later caller hangs;
     *   - the timed tryLock throws InterruptedException. Catching it CLEARS the
     *     thread's interrupt flag, so put the flag back before returning false.
     *     After tryRun returns, Thread.currentThread().isInterrupted() must be
     *     exactly what it was when tryRun was called.
     *
     * An exception thrown by `body` propagates to the caller — and the lock is
     * still released on the way out.
     */
    static boolean tryRun(ReentrantLock lock, long millis, Runnable body) {
        throw new UnsupportedOperationException("tryRun: not implemented");
    }

    /**
     * A tally of counts by key, guarded by a ReentrantReadWriteLock: many
     * threads read at once, one writes at a time.
     *
     *   Counters c = new Counters();
     *   c.bump("a"); c.bump("a"); c.bump("b");
     *   c.count("a")   -> 2
     *   c.count("zzz") -> 0        an unseen key counts zero, it is not an error
     *   c.snapshot()   -> {a=2, b=1}
     *
     * snapshot() must return a detached copy: bumping afterwards must not
     * change a snapshot already handed out. Take the read lock for count() and
     * snapshot(), the write lock for bump(), and unlock in a `finally`.
     *
     * Do not take the write lock inside a read lock anywhere — a read lock
     * cannot be upgraded, and the attempt deadlocks the thread against itself.
     */
    static final class Counters {

        void bump(String key) {
            throw new UnsupportedOperationException("Counters.bump: not implemented");
        }

        int count(String key) {
            throw new UnsupportedOperationException("Counters.count: not implemented");
        }

        Map<String, Integer> snapshot() {
            throw new UnsupportedOperationException("Counters.snapshot: not implemented");
        }
    }

    /**
     * Apply `f` to the value in `ref` and store the result, atomically, using a
     * compare-and-set retry loop that you write by hand. Return the new value.
     *
     *   AtomicReference<Integer> ref = new AtomicReference<>(1);
     *   updateAtomically(ref, n -> n + 1)   -> 2, and ref now holds 2
     *
     * Read, apply, compareAndSet, and go round again if the compareAndSet lost.
     * Do not call ref.updateAndGet — writing the loop is the exercise.
     *
     * Note what the loop implies about `f`: it may be called more than once per
     * successful update, so it must be pure. The tests hammer this from four
     * threads at once, and the totals only come out right if a lost
     * compareAndSet sends you back to re-read the value.
     */
    static <T> T updateAtomically(AtomicReference<T> ref, UnaryOperator<T> f) {
        throw new UnsupportedOperationException("updateAtomically: not implemented");
    }
}
