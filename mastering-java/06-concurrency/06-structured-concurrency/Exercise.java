import java.util.List;
import java.util.concurrent.Callable;

/**
 * Part 06, Lesson 06 — Structured Concurrency
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
 * StructuredTaskScope is a PREVIEW API in Java 25, so this folder carries a
 * java.flags file holding --enable-preview. The runner passes it to javac and
 * to the JVM for you; javac will print a "uses preview features" note on every
 * compile, which is expected. ScopedValue is final in 25 and needs no flag.
 */
class Solution {

    /**
     * The current user, as a ScopedValue. Provided — do not change it.
     *
     * A ScopedValue is a key, not a variable: it holds nothing until someone
     * binds it, and the binding lasts exactly as long as the block that made
     * it. One static final instance per piece of context is the idiom.
     */
    static final ScopedValue<String> USER = ScopedValue.newInstance();

    /**
     * Read USER, falling back when nothing has bound it.
     *
     *   currentUser()                      -> "anonymous"    outside any binding
     *   inside where(USER, "alice"): ...   -> "alice"
     *
     * USER.get() on an unbound value throws NoSuchElementException, so this
     * cannot be a plain get(). There is a one-call answer on ScopedValue.
     */
    static String currentUser() {
        throw new UnsupportedOperationException("currentUser: not implemented");
    }

    /**
     * Run `body` with USER bound to `user`, and return what it produced.
     *
     *   asUser("alice", () -> currentUser())  -> "alice"
     *   currentUser()                         -> "anonymous" again afterwards
     *
     * ScopedValue.where(KEY, value) gives you a carrier; the carrier runs
     * something. There is no set() and no remove(): the binding ends when the
     * call ends, whether it returned or threw.
     */
    static <T> T asUser(String user, Callable<T> body) throws Exception {
        throw new UnsupportedOperationException("asUser: not implemented");
    }

    /**
     * A five-step trace of what binding and rebinding actually do. Each element
     * is the value of currentUser() at that moment:
     *
     *   [0]  before any binding
     *   [1]  inside a binding of "outer"
     *   [2]  inside a nested binding of "inner"
     *   [3]  back in the outer binding, after the inner block ended
     *   [4]  after both blocks ended
     *
     *   rebindTrace() -> ["anonymous", "outer", "inner", "outer", "anonymous"]
     *
     * Element [3] is the point: rebinding shadows, it does not assign, so
     * nothing you do further down the stack can change what the caller sees.
     */
    static List<String> rebindTrace() {
        throw new UnsupportedOperationException("rebindTrace: not implemented");
    }

    /**
     * Bind USER to `user`, fork `tasks` subtasks in a StructuredTaskScope that
     * each report currentUser(), and return their answers.
     *
     *   userInForkedTasks("alice", 3) -> ["alice", "alice", "alice"]
     *   userInForkedTasks("alice", 0) -> []
     *
     * Open the scope with StructuredTaskScope.open(...) inside the binding,
     * fork, join, and read the results. A binding in force at the fork is
     * inherited by the subtask — which is the reason ScopedValue exists at all.
     *
     * Use try-with-resources on the scope. Subtask.get() before join() throws
     * IllegalStateException; a Subtask is a handle, not a Future.
     */
    static List<String> userInForkedTasks(String user, int tasks) throws Exception {
        throw new UnsupportedOperationException("userInForkedTasks: not implemented");
    }

    /**
     * The same question asked of an ordinary executor: bind USER to `user`, run
     * one task on Executors.newVirtualThreadPerTaskExecutor() that returns
     * currentUser(), and give back what it saw.
     *
     *   userSeenByExecutor("alice") -> "anonymous"
     *
     * Not a bug, and the point of the lesson. An executor thread has no
     * structural relationship to the thread that submitted the work, so there
     * is nothing for the binding to be inherited through. Only a fork inside a
     * scope has that relationship.
     */
    static String userSeenByExecutor(String user) throws Exception {
        throw new UnsupportedOperationException("userSeenByExecutor: not implemented");
    }

    /**
     * Fork every task into one scope, wait for them all, and return the results
     * in the order the tasks were given.
     *
     *   forkAll(List.of(() -> "a", () -> "b"))  -> ["a", "b"]
     *   forkAll(List.of())                      -> []
     *
     * Use the Joiner that requires all of them to succeed. If one fails, join()
     * throws StructuredTaskScope.FailedException with the task's own exception
     * as its cause, and the surviving subtasks are cancelled for you — let that
     * propagate rather than catching it.
     */
    static <T> List<T> forkAll(List<Callable<T>> tasks) throws InterruptedException {
        throw new UnsupportedOperationException("forkAll: not implemented");
    }

    /**
     * Race the tasks and return the first result that succeeds, ignoring the
     * ones that fail.
     *
     *   firstSuccess(List.of(() -> { throw new IOException(); }, () -> "b")) -> "b"
     *   firstSuccess(List.of(() -> { throw new IOException(); }))
     *       -> throws StructuredTaskScope.FailedException
     *
     * A different Joiner, and nothing else changes. Note the asymmetry with
     * forkAll: here a failure is not an event, and only every task failing is.
     */
    static String firstSuccess(List<Callable<String>> tasks) throws InterruptedException {
        throw new UnsupportedOperationException("firstSuccess: not implemented");
    }

    /**
     * Show that a failure cancels its siblings. In one scope that requires all
     * subtasks to succeed:
     *
     *   1. fork a subtask that signals it has started, then blocks until it is
     *      interrupted, recording the fact that it was;
     *   2. wait for that signal, so it is definitely blocked;
     *   3. fork a subtask that immediately throws IllegalStateException;
     *   4. join, and catch the FailedException;
     *   5. let the scope close before you read the recorded fact.
     *
     * Step 5 is not a detail. join() returns as soon as the outcome is decided;
     * it does not wait for the cancelled sibling to notice its interrupt. The
     * closing brace does — close() cancels the scope and then waits for every
     * forked thread to finish. So a report built inside the block is a coin
     * flip, and the same report built after it is a fact.
     *
     * Return "cause=" plus the simple name of the FailedException's cause, then
     * " interrupted=" plus whether the first subtask was interrupted.
     *
     *   cancellationReport() -> "cause=IllegalStateException interrupted=true"
     *
     * Nobody wrote the cancellation. It is what the scope is for.
     */
    static String cancellationReport() throws InterruptedException {
        throw new UnsupportedOperationException("cancellationReport: not implemented");
    }

    /**
     * The unstructured version, for contrast. Submit a task that throws
     * IllegalStateException to an executor, and:
     *
     *   - if `callGet` is true, ask the Future for its result and report the
     *     failure as "err:" plus the simple name of the underlying exception;
     *   - if it is false, never touch the Future. Shut the executor down, wait
     *     for it, and return "silence".
     *
     *   executorOutcome(true)  -> "err:IllegalStateException"
     *   executorOutcome(false) -> "silence"
     *
     * Both calls run the same failing task. In one of them the exception exists
     * only inside a Future nobody kept: no log line, no stack trace, no failure
     * — just work that did not happen. That is the bug a scope makes
     * impossible, because you cannot leave the block without joining.
     */
    static String executorOutcome(boolean callGet) throws InterruptedException {
        throw new UnsupportedOperationException("executorOutcome: not implemented");
    }
}
