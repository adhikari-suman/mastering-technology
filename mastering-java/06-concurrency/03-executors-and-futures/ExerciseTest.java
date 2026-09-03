import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
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
    @DisplayName("runAll: results come back in submission order, not completion order")
    void runAllKeepsOrder() throws Exception {
        List<Callable<Integer>> tasks = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            int value = i;
            tasks.add(() -> {
                Thread.sleep((5 - value) * 20L);   // task 0 finishes last
                return value;
            });
        }
        assertEquals(List.of(0, 1, 2, 3, 4), Solution.runAll(tasks, 5));
    }

    @Test
    @DisplayName("runAll: a pool smaller than the work, and no work at all")
    void runAllEdges() throws Exception {
        assertEquals(List.of(), Solution.runAll(List.of(), 2));
        assertEquals(List.of(7), Solution.runAll(List.of(() -> 7), 4));
        List<Callable<Integer>> ten = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            int value = i;
            ten.add(() -> value);
        }
        assertEquals(55, Solution.runAll(ten, 2).stream().mapToInt(Integer::intValue).sum());
    }

    @Test
    @DisplayName("runAll: a failing task surfaces as ExecutionException")
    void runAllPropagatesFailure() {
        List<Callable<Integer>> tasks = List.of(() -> 1, () -> {
            throw new IllegalStateException("task 2 failed");
        });
        ExecutionException thrown = assertThrows(ExecutionException.class, () -> Solution.runAll(tasks, 2));
        assertInstanceOf(IllegalStateException.class, thrown.getCause(), "the real exception is the cause");
        assertEquals("task 2 failed", thrown.getCause().getMessage());
    }

    @Test
    @DisplayName("causeName: get() wraps, so you have to unwrap")
    void causeNameUnwraps() throws Exception {
        assertEquals("none", Solution.causeName(() -> 42));
        assertEquals("IllegalStateException", Solution.causeName(() -> {
            throw new IllegalStateException("boom");
        }));
        assertEquals("IOException", Solution.causeName(() -> {
            throw new IOException("a Callable may throw checked exceptions");
        }));
    }

    @Test
    @DisplayName("shutdownNowPending: the queued tasks are handed back, not discarded")
    void shutdownNowReturnsTheQueue() throws Exception {
        assertEquals(2, Solution.shutdownNowPending());
    }

    @Test
    @DisplayName("awaitOrForce: shutdown() asks, shutdownNow() insists")
    void awaitOrForceInterrupts() throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(1);
        CountDownLatch started = new CountDownLatch(1);
        AtomicBoolean interrupted = new AtomicBoolean(false);
        pool.submit(() -> {
            started.countDown();
            try {
                new CountDownLatch(1).await();     // never released
            } catch (InterruptedException e) {
                interrupted.set(true);
            }
        });
        started.await();
        assertTrue(Solution.awaitOrForce(pool, 200), "the pool must end up terminated");
        assertTrue(pool.isTerminated());
        assertTrue(interrupted.get(), "plain shutdown() would have waited for this task forever");
    }

    @Test
    @DisplayName("awaitOrForce: an idle pool terminates on the first ask")
    void awaitOrForceIdlePool() throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(2);
        pool.submit(() -> "done").get();
        assertTrue(Solution.awaitOrForce(pool, 200));
        assertTrue(pool.isShutdown());
        assertTrue(pool.isTerminated());
    }

    @Test
    @DisplayName("all: allOf gives you Void, so the values are your job")
    void allCollectsValues() {
        CompletableFuture<String> a = CompletableFuture.completedFuture("a");
        CompletableFuture<String> b = new CompletableFuture<>();
        CompletableFuture<List<String>> combined = Solution.all(List.of(a, b));
        assertFalse(combined.isDone(), "b has not completed yet");
        b.complete("b");
        assertEquals(List.of("a", "b"), combined.join(), "input order, not completion order");
        assertEquals(List.of(), Solution.all(List.<CompletableFuture<String>>of()).join());
    }

    @Test
    @DisplayName("all: one failure fails the whole thing")
    void allFailsFast() {
        CompletableFuture<String> ok = CompletableFuture.completedFuture("a");
        CompletableFuture<String> bad = CompletableFuture.failedFuture(new IllegalStateException("nope"));
        CompletableFuture<List<String>> combined = Solution.all(List.of(ok, bad));
        CompletionException thrown = assertThrows(CompletionException.class, combined::join);
        assertInstanceOf(IllegalStateException.class, thrown.getCause());
        assertThrows(ExecutionException.class, combined::get, "join wraps in one type, get in another");
    }

    @Test
    @DisplayName("combine: two independent futures, joined without blocking a thread")
    void combineMerges() {
        CompletableFuture<String> a = new CompletableFuture<>();
        CompletableFuture<String> b = new CompletableFuture<>();
        CompletableFuture<String> merged = Solution.combine(a, b);
        assertFalse(merged.isDone());
        b.complete("y");
        assertFalse(merged.isDone(), "still waiting on a");
        a.complete("x");
        assertEquals("x+y", merged.join());
    }

    @Test
    @DisplayName("chain: thenCompose flattens, thenApply would nest")
    void chainFlattens() {
        assertEquals(3, Solution.chain(CompletableFuture.completedFuture("abc"),
                s -> CompletableFuture.completedFuture(s.length())).join());
        CompletableFuture<String> input = new CompletableFuture<>();
        CompletableFuture<Integer> out = Solution.chain(input, s -> CompletableFuture.completedFuture(s.length() * 2));
        input.complete("hello");
        assertEquals(10, out.join());
    }

    @Test
    @DisplayName("recover: exceptionally swaps a failure for a value")
    void recoverFallsBack() {
        assertEquals("ok", Solution.recover(CompletableFuture.completedFuture("ok"), "fallback").join());
        CompletableFuture<String> recovered =
                Solution.recover(CompletableFuture.failedFuture(new IOException("down")), "fallback");
        assertEquals("fallback", recovered.join());
        assertFalse(recovered.isCompletedExceptionally(), "the recovered future is a success");
    }

    @Test
    @DisplayName("describe: the same exception reaches handle wrapped or raw, so unwrap")
    void describeUnwrapsCompletionException() {
        assertEquals("ok:x", Solution.describe(CompletableFuture.completedFuture("x")).join());
        assertEquals("err:IllegalStateException",
                Solution.describe(CompletableFuture.failedFuture(new IllegalStateException("boom"))).join());
        assertEquals("err:IllegalStateException",
                Solution.describe(CompletableFuture.<String>supplyAsync(() -> {
                    throw new IllegalStateException("boom");
                })).join(),
                "a task that throws is completed with a CompletionException around it");
        assertEquals("CompletionException", CompletableFuture.supplyAsync(() -> {
            throw new IllegalStateException("boom");
        }).handle((value, error) -> error.getClass().getSimpleName()).join(),
                "what handle is actually handed here");
        assertEquals("IllegalStateException",
                CompletableFuture.failedFuture(new IllegalStateException("boom"))
                        .handle((value, error) -> error.getClass().getSimpleName()).join(),
                "and here — same operator, different wrapping");
    }
}
