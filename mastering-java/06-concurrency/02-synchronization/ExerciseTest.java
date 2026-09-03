import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.locks.ReentrantLock;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("synchronizedCount: a monitor makes the increment atomic")
    void synchronizedCountIsExact() throws Exception {
        assertEquals(400_000, Solution.synchronizedCount(4, 100_000));
        assertEquals(400_000, Solution.synchronizedCount(4, 100_000), "and again, and again");
        assertEquals(0, Solution.synchronizedCount(0, 100_000));
    }

    @Test
    @DisplayName("atomicCount: incrementAndGet is the same guarantee without a lock")
    void atomicCountIsExact() throws Exception {
        assertEquals(400_000, Solution.atomicCount(4, 100_000));
        assertEquals(1, Solution.atomicCount(1, 1));
        assertEquals(0, Solution.atomicCount(4, 0));
    }

    @Test
    @DisplayName("reentrantDepth: a thread may re-enter a monitor it already holds")
    void reentrantDepthTerminates() {
        assertEquals(0, Solution.reentrantDepth(0));
        assertEquals(1, Solution.reentrantDepth(1));
        assertEquals(50, Solution.reentrantDepth(50), "50 nested acquires of one lock, no blocking");
    }

    @Test
    @DisplayName("transfer: moves the money, and is safe when both accounts are the same")
    void transferMovesMoney() {
        Solution.Account a = new Solution.Account(1, 100);
        Solution.Account b = new Solution.Account(2, 100);
        Solution.transfer(a, b, 30);
        assertEquals(70, a.balance());
        assertEquals(130, b.balance());
        Solution.transfer(a, b, 200);
        assertEquals(-130, a.balance(), "overdrafts are allowed here");
        Solution.transfer(a, a, 5);
        assertEquals(-130, a.balance(), "self-transfer changes nothing and must not deadlock");
    }

    @Test
    @DisplayName("transfer: opposite directions at once — lock ordering, or deadlock")
    void transferOrdersItsLocks() throws Exception {
        Solution.Account a = new Solution.Account(1, 1000);
        Solution.Account b = new Solution.Account(2, 1000);
        Runnable aToB = () -> {
            for (int i = 0; i < 20_000; i++) {
                Solution.transfer(a, b, 1);
            }
        };
        Runnable bToA = () -> {
            for (int i = 0; i < 20_000; i++) {
                Solution.transfer(b, a, 1);
            }
        };
        AtomicReference<Throwable> died = new AtomicReference<>();
        Thread t1 = new Thread(aToB);
        Thread t2 = new Thread(bToA);
        t1.setUncaughtExceptionHandler((t, e) -> died.compareAndSet(null, e));
        t2.setUncaughtExceptionHandler((t, e) -> died.compareAndSet(null, e));
        t1.setDaemon(true);
        t2.setDaemon(true);
        t1.start();
        t2.start();
        t1.join(30_000);
        t2.join(30_000);
        assertFalse(t1.isAlive(), "deadlocked: take the two locks in a fixed order, not in argument order");
        assertFalse(t2.isAlive(), "deadlocked: take the two locks in a fixed order, not in argument order");
        assertNull(died.get(), "a worker thread died: a thread that throws also stops being alive");
        assertEquals(2000, a.balance() + b.balance(), "money is conserved");
        assertEquals(1000, a.balance(), "40000 moves that cancel out exactly");
    }

    @Test
    @DisplayName("tryRun: a free lock is taken and the body runs")
    void tryRunAcquiresFreeLock() {
        ReentrantLock lock = new ReentrantLock();
        AtomicBoolean ran = new AtomicBoolean(false);
        assertTrue(Solution.tryRun(lock, 50, () -> ran.set(true)));
        assertTrue(ran.get());
        assertFalse(lock.isLocked(), "and it was released again");
    }

    @Test
    @DisplayName("tryRun: a lock held by another thread times out instead of blocking forever")
    void tryRunGivesUp() throws Exception {
        ReentrantLock lock = new ReentrantLock();
        AtomicBoolean ran = new AtomicBoolean(false);
        AtomicBoolean acquired = new AtomicBoolean(true);
        lock.lock();
        try {
            Thread other = new Thread(() -> acquired.set(Solution.tryRun(lock, 100, () -> ran.set(true))));
            other.start();
            other.join();
        } finally {
            lock.unlock();
        }
        assertFalse(acquired.get(), "the lock was held for the whole 100ms");
        assertFalse(ran.get(), "and the body must not run when the lock was not taken");
    }

    @Test
    @DisplayName("tryRun: the holder can take its own lock again — ReentrantLock is reentrant")
    void tryRunIsReentrant() {
        ReentrantLock lock = new ReentrantLock();
        AtomicBoolean ran = new AtomicBoolean(false);
        lock.lock();
        try {
            assertTrue(Solution.tryRun(lock, 50, () -> ran.set(true)), "same thread, so no contention");
            assertTrue(ran.get());
            assertEquals(1, lock.getHoldCount(), "tryRun released only what it took");
        } finally {
            lock.unlock();
        }
    }

    @Test
    @DisplayName("tryRun: catching InterruptedException must not eat the interrupt flag")
    void tryRunRestoresTheInterruptFlag() throws Exception {
        ReentrantLock lock = new ReentrantLock();
        AtomicBoolean acquired = new AtomicBoolean(true);
        AtomicBoolean stillInterrupted = new AtomicBoolean(false);
        lock.lock();
        try {
            Thread other = new Thread(() -> {
                Thread.currentThread().interrupt();
                acquired.set(Solution.tryRun(lock, 60_000, () -> { }));
                stillInterrupted.set(Thread.currentThread().isInterrupted());
            });
            other.start();
            other.join();
        } finally {
            lock.unlock();
        }
        assertFalse(acquired.get(), "an already-interrupted thread fails the timed tryLock at once");
        assertTrue(stillInterrupted.get(), "Thread.currentThread().interrupt() puts the flag back");
    }

    @Test
    @DisplayName("tryRun: a throwing body still releases the lock")
    void tryRunUnlocksOnThrow() {
        ReentrantLock lock = new ReentrantLock();
        assertThrows(IllegalStateException.class,
                () -> Solution.tryRun(lock, 50, () -> { throw new IllegalStateException("boom"); }));
        assertFalse(lock.isLocked(), "the unlock belongs in a finally");
    }

    @Test
    @DisplayName("Counters: counts, absent keys, and a snapshot that is a copy")
    void countersBasics() {
        Solution.Counters counters = new Solution.Counters();
        counters.bump("a");
        counters.bump("a");
        counters.bump("b");
        assertEquals(2, counters.count("a"));
        assertEquals(1, counters.count("b"));
        assertEquals(0, counters.count("zzz"), "an unseen key counts zero");
        Map<String, Integer> snapshot = counters.snapshot();
        assertEquals(Map.of("a", 2, "b", 1), snapshot);
        counters.bump("a");
        assertEquals(Map.of("a", 2, "b", 1), snapshot, "a snapshot already handed out cannot change");
        assertEquals(3, counters.count("a"));
    }

    @Test
    @DisplayName("Counters: the write lock makes concurrent bumps add up exactly")
    void countersUnderContention() throws Exception {
        Solution.Counters counters = new Solution.Counters();
        Thread[] workers = new Thread[4];
        for (int i = 0; i < workers.length; i++) {
            workers[i] = new Thread(() -> {
                for (int j = 0; j < 25_000; j++) {
                    counters.bump("hits");
                }
                counters.bump("threads");
            });
            workers[i].start();
        }
        for (Thread w : workers) {
            w.join();
        }
        assertEquals(100_000, counters.count("hits"));
        assertEquals(4, counters.count("threads"));
    }

    @Test
    @DisplayName("updateAtomically: reads, applies, and stores the new value")
    void updateAtomicallyBasics() {
        AtomicReference<Integer> ref = new AtomicReference<>(1);
        assertEquals(2, Solution.updateAtomically(ref, n -> n + 1));
        assertEquals(2, ref.get());
        assertEquals(20, Solution.updateAtomically(ref, n -> n * 10));
        AtomicReference<String> text = new AtomicReference<>("a");
        assertEquals("ab", Solution.updateAtomically(text, s -> s + "b"), "any reference type");
    }

    @Test
    @DisplayName("updateAtomically: an immutable record swapped by CAS needs no lock at all")
    void updateAtomicallyUnderContention() throws Exception {
        AtomicReference<Solution.Tally> ref = new AtomicReference<>(new Solution.Tally(0, 0));
        AtomicInteger applications = new AtomicInteger();
        Thread[] workers = new Thread[4];
        for (int i = 0; i < workers.length; i++) {
            workers[i] = new Thread(() -> {
                for (int j = 0; j < 20_000; j++) {
                    Solution.updateAtomically(ref, t -> {
                        applications.incrementAndGet();
                        return new Solution.Tally(t.calls() + 1, t.total() + 2);
                    });
                }
            });
            workers[i].start();
        }
        for (Thread w : workers) {
            w.join();
        }
        assertEquals(80_000, ref.get().calls(), "not one update lost");
        assertEquals(160_000L, ref.get().total());
        assertTrue(applications.get() >= 80_000,
                "the function runs once per attempt, not once per update — which is why it must be pure");
    }
}
