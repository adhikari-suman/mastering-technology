import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("countVirtual: the thread-per-task executor makes virtual threads")
    void countVirtualOnVirtualExecutor() throws Exception {
        try (ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor()) {
            assertEquals(50, Solution.countVirtual(pool, 50));
            assertEquals(0, Solution.countVirtual(pool, 0));
        }
    }

    @Test
    @DisplayName("countVirtual: a fixed pool makes platform threads — unless you hand it a factory")
    void countVirtualOnPlatformPool() throws Exception {
        try (ExecutorService platform = Executors.newFixedThreadPool(4)) {
            assertEquals(0, Solution.countVirtual(platform, 50));
        }
        try (ExecutorService pooledVirtual = Executors.newFixedThreadPool(2, Thread.ofVirtual().factory())) {
            assertEquals(50, Solution.countVirtual(pooledVirtual, 50),
                    "they really are virtual — which is not the same as being useful");
        }
    }

    @Test
    @DisplayName("inParallel: results in task order, one thread per task")
    void inParallelKeepsOrder() throws Exception {
        List<Callable<String>> tasks = List.of(
                () -> { Thread.sleep(60); return "slow"; },
                () -> "fast",
                () -> { Thread.sleep(30); return "middling"; });
        assertEquals(List.of("slow", "fast", "middling"), Solution.inParallel(tasks));
        assertEquals(List.of(), Solution.inParallel(List.<Callable<String>>of()));
        assertEquals(List.of(1, 2, 3), Solution.inParallel(List.<Callable<Integer>>of(() -> 1, () -> 2, () -> 3)));
    }

    @Test
    @DisplayName("inParallel: a failing task still arrives wrapped in ExecutionException")
    void inParallelPropagatesFailure() {
        List<Callable<String>> tasks = List.of(() -> "ok", () -> {
            throw new IllegalStateException("nope");
        });
        ExecutionException thrown = assertThrows(ExecutionException.class, () -> Solution.inParallel(tasks));
        assertInstanceOf(IllegalStateException.class, thrown.getCause());
    }

    @Test
    @DisplayName("fanOutBlocking: ten thousand threads asleep at once is unremarkable")
    void fanOutBlockingScales() throws Exception {
        assertEquals(10_000, Solution.fanOutBlocking(10_000, 50));
        assertEquals(0, Solution.fanOutBlocking(0, 50));
    }

    @Test
    @DisplayName("distinctThreadLocals: thread-per-task means one copy per task")
    void threadLocalsPerTask() throws Exception {
        try (ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor()) {
            assertEquals(200, Solution.distinctThreadLocals(pool, 200),
                    "200 threads, 200 copies, none reused");
        }
    }

    @Test
    @DisplayName("distinctThreadLocals: a pool of two makes at most two copies, forever")
    void threadLocalsPerPoolThread() throws Exception {
        try (ExecutorService pool = Executors.newFixedThreadPool(2)) {
            int copies = Solution.distinctThreadLocals(pool, 200);
            assertTrue(copies >= 1 && copies <= 2, "expected 1 or 2 copies, got " + copies);
        }
    }

    @Test
    @DisplayName("unstartedVirtual: virtual, daemon, unnamed, priority 5, and NEW")
    void unstartedVirtualTraits() {
        Thread t = Solution.unstartedVirtual(() -> { });
        assertTrue(t.isVirtual());
        assertEquals(Thread.State.NEW, t.getState());
        assertEquals("", t.getName(), "no default name at all, not even Thread-0");
        assertTrue(t.isDaemon(), "virtual threads never keep the JVM alive");
        assertEquals(5, t.getPriority());
    }

    @Test
    @DisplayName("unstartedVirtual: daemon and priority are not yours to change")
    void unstartedVirtualRefusesPlatformKnobs() {
        Thread t = Solution.unstartedVirtual(() -> { });
        assertThrows(IllegalArgumentException.class, () -> t.setDaemon(false),
                "'false' is not legal for a virtual thread");
        t.setPriority(Thread.MAX_PRIORITY);
        assertEquals(5, t.getPriority(), "accepted and silently ignored");
    }

    @Test
    @DisplayName("canRunConcurrently: 500 tasks really are all in flight at once")
    void virtualExecutorRunsEverythingAtOnce() throws Exception {
        try (ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor()) {
            assertTrue(Solution.canRunConcurrently(pool, 500, 10_000));
        }
    }

    @Test
    @DisplayName("canRunConcurrently: pooling virtual threads throws the benefit away")
    void poolingCapsConcurrency() throws Exception {
        try (ExecutorService platform = Executors.newFixedThreadPool(2)) {
            assertFalse(Solution.canRunConcurrently(platform, 500, 300), "two threads, two tasks in flight");
        }
        try (ExecutorService pooledVirtual = Executors.newFixedThreadPool(2, Thread.ofVirtual().factory())) {
            assertFalse(Solution.canRunConcurrently(pooledVirtual, 500, 300),
                    "still two in flight — the pool is the limit, not the thread kind");
        }
    }

    @Test
    @DisplayName("withTimeout: a task that finishes in time returns its own value")
    void withTimeoutReturnsResult() throws Exception {
        assertEquals("quick", Solution.withTimeout(() -> "quick", 10_000, "fallback"));
        assertEquals(42, Solution.withTimeout(() -> {
            Thread.sleep(20);
            return 42;
        }, 10_000, -1));
    }

    @Test
    @DisplayName("withTimeout: a task that overruns is cancelled with an interrupt")
    void withTimeoutCancels() throws Exception {
        AtomicBoolean interrupted = new AtomicBoolean(false);
        String result = Solution.withTimeout(() -> {
            try {
                new CountDownLatch(1).await();     // never released
            } catch (InterruptedException e) {
                interrupted.set(true);
            }
            return "never";
        }, 200, "late");
        assertEquals("late", result);
        assertTrue(interrupted.get(), "cancel(true) is what reaches a blocked task");
    }

    @Test
    @DisplayName("withTimeout: a task that throws also falls back")
    void withTimeoutSwallowsFailure() throws Exception {
        assertEquals("fallback", Solution.withTimeout(() -> {
            throw new IllegalStateException("boom");
        }, 10_000, "fallback"));
    }
}
