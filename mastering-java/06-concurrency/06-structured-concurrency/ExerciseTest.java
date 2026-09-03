import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.io.IOException;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.concurrent.Callable;
import java.util.concurrent.StructuredTaskScope;
import java.util.concurrent.StructuredTaskScope.Joiner;
import java.util.concurrent.StructuredTaskScope.Subtask;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 *
 * Compiled and run with --enable-preview, from this lesson's java.flags.
 */
class ExerciseTest {

    @Test
    @DisplayName("currentUser: an unbound ScopedValue has no value at all")
    void currentUserIsUnboundByDefault() {
        assertEquals("anonymous", Solution.currentUser());
        assertFalse(Solution.USER.isBound());
        assertThrows(NoSuchElementException.class, Solution.USER::get, "get() on an unbound value throws");
    }

    @Test
    @DisplayName("asUser: the binding lasts exactly as long as the call")
    void asUserBindsForTheCall() throws Exception {
        assertEquals("alice", Solution.asUser("alice", () -> Solution.currentUser()));
        assertEquals("alice", Solution.asUser("alice", () -> Solution.USER.get()));
        assertEquals("bob", Solution.asUser("bob", () -> Solution.currentUser()));
        assertFalse(Solution.USER.isBound(), "and it is gone again on the way out");
    }

    @Test
    @DisplayName("asUser: the binding is undone even when the body throws")
    void asUserUnbindsOnFailure() {
        assertThrows(IOException.class, () -> Solution.asUser("alice", () -> {
            throw new IOException("boom");
        }));
        assertFalse(Solution.USER.isBound(), "no finally, no remove(), nothing to forget");
    }

    @Test
    @DisplayName("rebindTrace: a nested binding shadows and then gives the value back")
    void rebindingNests() {
        assertEquals(List.of("anonymous", "outer", "inner", "outer", "anonymous"), Solution.rebindTrace());
    }

    @Test
    @DisplayName("userInForkedTasks: subtasks inherit the binding in force at the fork")
    void forkedTasksInheritTheBinding() throws Exception {
        assertEquals(List.of("alice", "alice", "alice"), Solution.userInForkedTasks("alice", 3));
        assertEquals(List.of(), Solution.userInForkedTasks("alice", 0));
        assertFalse(Solution.USER.isBound());
    }

    @Test
    @DisplayName("userSeenByExecutor: an executor thread inherits nothing")
    void executorThreadsDoNotInherit() throws Exception {
        assertEquals("anonymous", Solution.userSeenByExecutor("alice"),
                "no structural relationship, so nothing to inherit through");
    }

    @Test
    @DisplayName("forkAll: every task, in fork order")
    void forkAllReturnsInOrder() throws Exception {
        List<Callable<String>> tasks = List.of(
                () -> { Thread.sleep(60); return "slow"; },
                () -> "fast",
                () -> { Thread.sleep(30); return "middling"; });
        assertEquals(List.of("slow", "fast", "middling"), Solution.forkAll(tasks));
        assertEquals(List.of(), Solution.forkAll(List.<Callable<String>>of()));
        assertEquals(List.of(1, 2), Solution.forkAll(List.<Callable<Integer>>of(() -> 1, () -> 2)));
    }

    @Test
    @DisplayName("forkAll: one failure fails the join, wrapped in FailedException")
    void forkAllPropagatesFailure() {
        List<Callable<String>> tasks = List.of(() -> "ok", () -> {
            throw new IllegalStateException("nope");
        });
        StructuredTaskScope.FailedException thrown =
                assertThrows(StructuredTaskScope.FailedException.class, () -> Solution.forkAll(tasks));
        assertInstanceOf(IllegalStateException.class, thrown.getCause(), "unwrap it, as with ExecutionException");
        assertEquals("nope", thrown.getCause().getMessage());
    }

    @Test
    @DisplayName("firstSuccess: failures are not events; only all of them failing is")
    void firstSuccessIgnoresFailures() throws Exception {
        assertEquals("b", Solution.firstSuccess(List.of(() -> {
            throw new IOException("down");
        }, () -> "b")));
        assertEquals("only", Solution.firstSuccess(List.<Callable<String>>of(() -> "only")));
    }

    @Test
    @DisplayName("firstSuccess: when every task fails, the join does throw")
    void firstSuccessNeedsOne() {
        List<Callable<String>> tasks = List.of(() -> {
            throw new IOException("one");
        }, () -> {
            throw new IOException("two");
        });
        StructuredTaskScope.FailedException thrown =
                assertThrows(StructuredTaskScope.FailedException.class, () -> Solution.firstSuccess(tasks));
        assertInstanceOf(IOException.class, thrown.getCause());
    }

    @Test
    @DisplayName("cancellationReport: a failing subtask interrupts its siblings, unasked")
    void failureCancelsSiblings() throws Exception {
        assertEquals("cause=IllegalStateException interrupted=true", Solution.cancellationReport());
    }

    @Test
    @DisplayName("executorOutcome: submit-and-forget throws the exception away")
    void unstructuredCodeLosesErrors() throws Exception {
        assertEquals("err:IllegalStateException", Solution.executorOutcome(true), "the failure was there all along");
        assertEquals("silence", Solution.executorOutcome(false), "same task, same throw, nobody told");
    }

    @Test
    @DisplayName("Subtask: a handle, not a Future — get() before join() throws")
    void subtaskIsNotAFuture() throws Exception {
        try (var scope = StructuredTaskScope.open(Joiner.<String>allSuccessfulOrThrow())) {
            Subtask<String> task = scope.fork(() -> "value");
            assertThrows(IllegalStateException.class, task::get, "there is nothing to block on");
            scope.join();
            assertEquals("value", task.get());
            assertEquals(Subtask.State.SUCCESS, task.state());
        }
    }
}
