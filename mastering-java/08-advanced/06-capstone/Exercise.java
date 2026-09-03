import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Part 08, Lesson 06 — Capstone: an event-sourced store
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
 * This is the largest lesson in the curriculum. The type skeleton is given —
 * the tests need it to compile — and the behaviour is yours. Two things depart
 * from the usual shape:
 *
 *   - the compact constructors have empty bodies rather than a `throw`, so that
 *     the rest of the file is testable while you work through it. Filling them
 *     in is the first task, not an optional one.
 *   - `Account` and the two exception classes are complete. Everything else is
 *     a stub.
 *
 * A reasonable order: constructors, apply, replay, Repository, EventStore,
 * runConcurrently.
 */
class Solution {

    // ---------------------------------------------------------------- events

    /**
     * Every kind of thing that can happen to an account.
     *
     * `sealed` closes the set, which is what makes the switch in apply()
     * exhaustive without a default arm. Add a fifth event later and every
     * switch that does not handle it stops compiling — which is the point.
     */
    sealed interface Event permits Opened, Deposited, Withdrawn, Closed {
        String accountId();
    }

    /**
     * An account came into existence.
     *
     *   new Opened("a1", "Ada")   -> fine
     *   new Opened("", "Ada")     -> throws InvalidEventException
     *   new Opened("a1", null)    -> throws InvalidEventException
     *   new Opened("a1", "  ")    -> throws InvalidEventException
     *
     * Reject a null or blank accountId, and a null or blank owner. Validation
     * goes in the compact constructor, which runs before the fields are
     * assigned and on every construction path — so an invalid Opened cannot be
     * made to exist.
     */
    record Opened(String accountId, String owner) implements Event {
        Opened {
            // TODO: reject a blank accountId and a blank owner
        }
    }

    /**
     * Money arrived.
     *
     *   new Deposited("a1", 500)  -> fine
     *   new Deposited("a1", 0)    -> throws InvalidEventException
     *   new Deposited("a1", -1)   -> throws InvalidEventException
     *   new Deposited(null, 500)  -> throws InvalidEventException
     *
     * Amounts are in pence, and are always strictly positive: a deposit of
     * nothing is a bug, not a no-op. Note what this constructor CANNOT check —
     * whether the account exists at all. That belongs in apply().
     */
    record Deposited(String accountId, long pence) implements Event {
        Deposited {
            // TODO: reject a blank accountId and a non-positive amount
        }
    }

    /**
     * Money left.
     *
     *   new Withdrawn("a1", 200)  -> fine
     *   new Withdrawn("a1", 0)    -> throws InvalidEventException
     *
     * Same rules as Deposited. "Is there enough money" is a question about
     * state, so it is not asked here.
     */
    record Withdrawn(String accountId, long pence) implements Event {
        Withdrawn {
            // TODO: reject a blank accountId and a non-positive amount
        }
    }

    /**
     * The account was closed. The balance stays; nothing more may happen to it.
     *
     *   new Closed("a1")  -> fine
     *   new Closed(" ")   -> throws InvalidEventException
     */
    record Closed(String accountId) implements Event {
        Closed {
            // TODO: reject a blank accountId
        }
    }

    // ----------------------------------------------------------------- state

    /**
     * The state an account is in after folding its events. Complete — you do
     * not need to change it.
     */
    record Account(String id, String owner, long balancePence, boolean closed) {}

    // ------------------------------------------------------------ exceptions

    /**
     * The event itself is malformed: a blank id, a negative amount. Thrown from
     * a compact constructor, and always a bug in the caller. Complete.
     */
    static final class InvalidEventException extends RuntimeException {
        InvalidEventException(String message) {
            super(message);
        }
    }

    /**
     * The event is well formed but cannot happen to this account right now:
     * withdrawing more than the balance, depositing into a closed account.
     * Thrown from apply(), and a legitimate rejection rather than a bug — the
     * same command might succeed later. Complete.
     */
    static final class IllegalTransitionException extends RuntimeException {
        IllegalTransitionException(String message) {
            super(message);
        }
    }

    // ------------------------------------------------------------- the fold

    /**
     * Apply one event to an account's state and return the new state.
     *
     *   apply(null, new Opened("a1", "Ada"))
     *       -> Account["a1", "Ada", 0, open]
     *   apply(account(500), new Deposited("a1", 250))
     *       -> Account["a1", "Ada", 750, open]
     *   apply(account(500), new Withdrawn("a1", 200))
     *       -> Account["a1", "Ada", 300, open]
     *   apply(account(500), new Closed("a1"))
     *       -> Account["a1", "Ada", 500, closed]
     *
     * The rejections, all IllegalTransitionException:
     *
     *   apply(account(500), new Opened("a1", "Ada"))   already open
     *   apply(null, new Deposited("a1", 100))          no such account
     *   apply(account(500), new Withdrawn("a1", 501))  insufficient funds
     *   anything at all applied to a closed account
     *
     * A null `state` means "this account does not exist yet"; only Opened is
     * legal there.
     *
     * Write it as ONE switch over the sealed interface with NO default arm, so
     * that adding a fifth event type breaks the compile. Record patterns —
     * `case Deposited(String id, long pence)` — pull the components out as they
     * match. A guarded label (`when ...`) never dominates a later label, so a
     * general `case Event e when state == null` can sit above the specific
     * cases without making them unreachable.
     *
     * `state` is never returned unchanged: every arm either builds a new
     * Account or throws.
     */
    static Account apply(Account state, Event event) {
        throw new UnsupportedOperationException("apply: not implemented");
    }

    /**
     * Fold a whole log into the state it produces.
     *
     *   replay([Opened("a1","Ada"), Deposited("a1",500), Withdrawn("a1",200)])
     *       -> Optional[Account["a1", "Ada", 300, open]]
     *   replay([])  -> Optional.empty
     *
     * Empty is a lookup that legitimately missed, which is what Optional is
     * for. Anything the fold rejects propagates out of here unchanged.
     */
    static Optional<Account> replay(List<Event> events) {
        throw new UnsupportedOperationException("replay: not implemented");
    }

    // -------------------------------------------------------- the repository

    /**
     * A tiny in-memory store, generic in both key and value.
     *
     *   Repository<String, Account> repo = new Repository<>();
     *   repo.save("a1", account);
     *   repo.find("a1")   -> Optional[account]
     *   repo.find("a2")   -> Optional.empty
     *   repo.all()        -> [account]     (insertion order)
     *   repo.size()       -> 1
     *
     * `save` with a key that is already present overwrites the value and keeps
     * the key's ORIGINAL position in all(). A plain HashMap gives no order at
     * all; there is a Map in java.util that gives you exactly this one.
     */
    static final class Repository<K, V> {

        /**
         * Store a value under a key, replacing any previous value. The key's
         * position in all() does not change on an overwrite.
         */
        void save(K key, V value) {
            throw new UnsupportedOperationException("Repository.save: not implemented");
        }

        /**
         * The value for a key, or empty when there is none. A lookup that can
         * legitimately miss is the one place Optional belongs.
         */
        Optional<V> find(K key) {
            throw new UnsupportedOperationException("Repository.find: not implemented");
        }

        /**
         * Every value, in the order the keys were first inserted. The returned
         * list must not be a live view: mutating the repository afterwards does
         * not change a list already handed out.
         */
        List<V> all() {
            throw new UnsupportedOperationException("Repository.all: not implemented");
        }

        /** How many keys are stored. */
        int size() {
            throw new UnsupportedOperationException("Repository.size: not implemented");
        }
    }

    // ----------------------------------------------------------- the store

    /**
     * The append-only log, plus the projections read off it.
     *
     * Hold two things: the events in arrival order, and a
     * Repository<String, Account> of current state. Keep the projection up to
     * date as events arrive rather than re-folding on every read.
     */
    static final class EventStore {

        /**
         * Record an event, after checking that it is legal in the account's
         * current state.
         *
         *   store.append(new Opened("a1", "Ada"));
         *   store.append(new Deposited("a1", 500));
         *   store.append(new Withdrawn("a1", 900));   // IllegalTransitionException
         *
         * Read the account's current state, run apply() to get the next one,
         * and only then record the event and save the new state. A rejected
         * event must leave the store EXACTLY as it was — no event in the log,
         * no change to the balance.
         *
         * This method is called from many threads at once. Read-check-write is
         * three steps, and three steps are a race unless something makes them
         * one. Without that, 500 concurrent deposits do not add up.
         */
        void append(Event event) {
            throw new UnsupportedOperationException("EventStore.append: not implemented");
        }

        /**
         * Every event, in the order it was appended.
         *
         * Return a snapshot, not a live view: a caller must not be able to
         * append to the log through the list you hand back, and a list handed
         * out earlier must not change when new events arrive.
         */
        List<Event> events() {
            throw new UnsupportedOperationException("EventStore.events: not implemented");
        }

        /**
         * Every event for one account, in order.
         *
         *   eventsFor("a1")       -> [Opened("a1","Ada"), Deposited("a1",500)]
         *   eventsFor("nothing")  -> []
         *
         * An unknown account is an EMPTY LIST, not an Optional and not null. A
         * method returning a collection has an empty value already.
         */
        List<Event> eventsFor(String accountId) {
            throw new UnsupportedOperationException("EventStore.eventsFor: not implemented");
        }

        /**
         * The current state of one account.
         *
         *   find("a1")       -> Optional[Account["a1","Ada",300,open]]
         *   find("nothing")  -> Optional.empty
         */
        Optional<Account> find(String accountId) {
            throw new UnsupportedOperationException("EventStore.find: not implemented");
        }

        /**
         * Every account's balance, keyed by account id.
         *
         *   balances()  -> {"a1": 300, "a2": 1000}
         *
         * Closed accounts are included, with the balance they closed at. Build
         * it with a stream and Collectors.toMap.
         */
        Map<String, Long> balances() {
            throw new UnsupportedOperationException("EventStore.balances: not implemented");
        }

        /**
         * The owners of the n largest balances, richest first.
         *
         *   topOwners(2)   -> ["Grace", "Ada"]
         *   topOwners(0)   -> []
         *   topOwners(99)  -> every owner, in order
         *
         * Ties break by account id, ascending. That is not decoration: sorting
         * on balance alone leaves equal balances in arrival order, and a query
         * whose answer depends on arrival order is not a query.
         *
         * n larger than the number of accounts returns all of them rather than
         * throwing.
         */
        List<String> topOwners(int n) {
            throw new UnsupportedOperationException("EventStore.topOwners: not implemented");
        }

        /**
         * The total of every deposit ever recorded, across all accounts.
         *
         *   totalDeposited()  -> 1500
         *
         * Withdrawals do not count; this is a figure about the log, not about
         * the balances. Filter the events to Deposited and sum the amounts.
         */
        long totalDeposited() {
            throw new UnsupportedOperationException("EventStore.totalDeposited: not implemented");
        }

        /**
         * How many events of each kind are in the log, keyed by the record's
         * simple name.
         *
         *   countByType()  -> {"Opened": 2, "Deposited": 3, "Withdrawn": 1}
         *
         * A kind with no events is ABSENT from the map rather than present with
         * zero. Collectors.groupingBy with Collectors.counting does this in one
         * expression.
         */
        Map<String, Long> countByType() {
            throw new UnsupportedOperationException("EventStore.countByType: not implemented");
        }
    }

    // ------------------------------------------------------ the command path

    /**
     * Append every command to the store, one virtual thread per command, and
     * return the balances once they have all finished.
     *
     *   runConcurrently(store, 500 deposits of 5 into "a1")
     *       -> {"a1": <opening balance + 2500>}
     *
     * Use Executors.newVirtualThreadPerTaskExecutor() in a try-with-resources:
     * closing that executor blocks until every submitted task is done, which is
     * how you get "join them all" without tracking a single Future.
     *
     * 500 virtual threads are 500 objects on the heap, not 500 OS threads.
     *
     * Every command in the tests is one that succeeds. If append() is not
     * atomic the arithmetic silently comes out short, which is the whole point
     * of the exercise — two threads read the same balance, both add to it, and
     * one write lands on top of the other.
     */
    static Map<String, Long> runConcurrently(EventStore store, List<Event> commands) {
        throw new UnsupportedOperationException("runConcurrently: not implemented");
    }
}
