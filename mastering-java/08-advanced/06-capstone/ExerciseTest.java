import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.IntStream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    private static Solution.Account ada(long balance) {
        return new Solution.Account("a1", "Ada", balance, false);
    }

    private static Solution.EventStore threeAccounts() {
        Solution.EventStore store = new Solution.EventStore();
        store.append(new Solution.Opened("a1", "Ada"));
        store.append(new Solution.Opened("a2", "Grace"));
        store.append(new Solution.Opened("a3", "Linus"));
        store.append(new Solution.Deposited("a1", 500));
        store.append(new Solution.Deposited("a2", 1_200));
        store.append(new Solution.Deposited("a3", 700));
        store.append(new Solution.Withdrawn("a2", 200));
        store.append(new Solution.Withdrawn("a3", 200));
        return store;
    }

    @Test
    @DisplayName("compact constructors: a malformed event cannot be constructed")
    void eventsValidateThemselves() {
        assertThrows(Solution.InvalidEventException.class, () -> new Solution.Opened("", "Ada"));
        assertThrows(Solution.InvalidEventException.class, () -> new Solution.Opened("a1", null));
        assertThrows(Solution.InvalidEventException.class, () -> new Solution.Opened("a1", "   "));
        assertThrows(Solution.InvalidEventException.class, () -> new Solution.Deposited("a1", 0));
        assertThrows(Solution.InvalidEventException.class, () -> new Solution.Deposited("a1", -1));
        assertThrows(Solution.InvalidEventException.class, () -> new Solution.Deposited(null, 500));
        assertThrows(Solution.InvalidEventException.class, () -> new Solution.Withdrawn("a1", 0));
        assertThrows(Solution.InvalidEventException.class, () -> new Solution.Closed(" "));
    }

    @Test
    @DisplayName("compact constructors: a valid event is left an ordinary record")
    void eventsAreRecords() {
        assertThrows(Solution.InvalidEventException.class, () -> new Solution.Withdrawn(null, 200),
                "the validation is on every event type, not only the two above");

        Solution.Event event = new Solution.Deposited("a1", 500);
        assertEquals("a1", event.accountId(), "declared on the sealed interface, implemented by the component");
        assertEquals(new Solution.Deposited("a1", 500), event, "equals for free, and the constructor did not get in the way");
        assertFalse(event.equals(new Solution.Withdrawn("a1", 500)),
                "same components, different type — records do not compare across types");
    }

    @Test
    @DisplayName("apply: opening, and opening twice")
    void applyOpens() {
        Solution.Account opened = Solution.apply(null, new Solution.Opened("a1", "Ada"));
        assertEquals(new Solution.Account("a1", "Ada", 0L, false), opened);

        assertThrows(Solution.IllegalTransitionException.class,
                () -> Solution.apply(ada(500), new Solution.Opened("a1", "Ada")),
                "null state means 'does not exist yet'; this account does");
    }

    @Test
    @DisplayName("apply: the arithmetic, and closing keeps the balance")
    void applyMoves() {
        assertEquals(750L, Solution.apply(ada(500), new Solution.Deposited("a1", 250)).balancePence());
        assertEquals(300L, Solution.apply(ada(500), new Solution.Withdrawn("a1", 200)).balancePence());

        Solution.Account closed = Solution.apply(ada(500), new Solution.Closed("a1"));
        assertTrue(closed.closed());
        assertEquals(500L, closed.balancePence(), "closing does not empty the account");
        assertEquals("Ada", closed.owner());
    }

    @Test
    @DisplayName("apply: the rejections a compact constructor could not have caught")
    void applyRejects() {
        assertThrows(Solution.IllegalTransitionException.class,
                () -> Solution.apply(null, new Solution.Deposited("a1", 100)), "no such account");
        assertThrows(Solution.IllegalTransitionException.class,
                () -> Solution.apply(ada(500), new Solution.Withdrawn("a1", 501)), "insufficient funds");
        assertEquals(0L, Solution.apply(ada(500), new Solution.Withdrawn("a1", 500)).balancePence(),
                "exactly the balance is allowed");
    }

    @Test
    @DisplayName("apply: a closed account accepts nothing at all")
    void applyOnClosedAccount() {
        Solution.Account closed = new Solution.Account("a1", "Ada", 500L, true);
        assertThrows(Solution.IllegalTransitionException.class,
                () -> Solution.apply(closed, new Solution.Deposited("a1", 100)));
        assertThrows(Solution.IllegalTransitionException.class,
                () -> Solution.apply(closed, new Solution.Withdrawn("a1", 100)));
        assertThrows(Solution.IllegalTransitionException.class,
                () -> Solution.apply(closed, new Solution.Closed("a1")));
    }

    @Test
    @DisplayName("replay: fold a log into a state, empty log into Optional.empty")
    void replayFolds() {
        List<Solution.Event> log = List.of(
                new Solution.Opened("a1", "Ada"),
                new Solution.Deposited("a1", 500),
                new Solution.Withdrawn("a1", 200));
        assertEquals(Optional.of(ada(300)), Solution.replay(log));
        assertEquals(Optional.empty(), Solution.replay(List.of()));
        assertThrows(Solution.IllegalTransitionException.class,
                () -> Solution.replay(List.of(new Solution.Deposited("a1", 500))),
                "a rejection during a replay propagates");
    }

    @Test
    @DisplayName("Repository: insertion order survives an overwrite")
    void repositoryKeepsOrder() {
        Solution.Repository<String, String> repo = new Solution.Repository<>();
        repo.save("b", "first");
        repo.save("a", "second");
        repo.save("b", "replaced");

        assertEquals(2, repo.size());
        assertEquals(Optional.of("replaced"), repo.find("b"));
        assertEquals(Optional.empty(), repo.find("missing"));
        assertEquals(List.of("replaced", "second"), repo.all(),
                "b was inserted first and stays first, even though it was written twice");
    }

    @Test
    @DisplayName("Repository: all() is a snapshot, not a window onto the store")
    void repositorySnapshots() {
        Solution.Repository<String, String> repo = new Solution.Repository<>();
        repo.save("a", "one");
        List<String> before = repo.all();
        repo.save("b", "two");

        assertEquals(1, before.size(), "a list handed out earlier does not grow");
        assertEquals(2, repo.all().size());
    }

    @Test
    @DisplayName("EventStore: events land in order, per account and overall")
    void storeRecordsEvents() {
        Solution.EventStore store = threeAccounts();
        assertEquals(8, store.events().size());
        assertEquals(new Solution.Opened("a1", "Ada"), store.events().get(0));

        assertEquals(List.of(new Solution.Opened("a1", "Ada"), new Solution.Deposited("a1", 500)),
                store.eventsFor("a1"));
        assertEquals(List.of(), store.eventsFor("nothing"), "an empty list, not an Optional and not null");

        assertEquals(Optional.of(new Solution.Account("a2", "Grace", 1_000L, false)), store.find("a2"));
        assertEquals(Optional.empty(), store.find("nothing"));
    }

    @Test
    @DisplayName("EventStore: a rejected append changes nothing")
    void storeIsUnchangedByRejection() {
        Solution.EventStore store = threeAccounts();
        List<Solution.Event> snapshot = store.events();

        assertThrows(Solution.IllegalTransitionException.class,
                () -> store.append(new Solution.Withdrawn("a1", 900)));

        assertEquals(8, store.events().size(), "the rejected event was not recorded");
        assertEquals(500L, store.find("a1").orElseThrow().balancePence(), "and the balance did not move");
        assertEquals(8, snapshot.size(), "events() handed back a snapshot, so this list never changed");
    }

    @Test
    @DisplayName("projections: balances, totals and a count per event type")
    void storeProjects() {
        Solution.EventStore store = threeAccounts();

        assertEquals(Map.of("a1", 500L, "a2", 1_000L, "a3", 500L), store.balances());
        assertEquals(2_400L, store.totalDeposited(), "deposits only — the withdrawals do not net off");
        assertEquals(Map.of("Opened", 3L, "Deposited", 3L, "Withdrawn", 2L), store.countByType(),
                "Closed has no events, so it is absent rather than zero");
    }

    @Test
    @DisplayName("topOwners: richest first, ties broken by account id")
    void topOwnersOrders() {
        Solution.EventStore store = threeAccounts();
        assertEquals(List.of("Grace", "Ada"), store.topOwners(2),
                "a1 and a3 both hold 500; a1 sorts first");
        assertEquals(List.of("Grace", "Ada", "Linus"), store.topOwners(3));
        assertEquals(List.of("Grace", "Ada", "Linus"), store.topOwners(99), "more than there are is fine");
        assertEquals(List.of(), store.topOwners(0));
    }

    @Test
    @DisplayName("runConcurrently: 500 virtual threads, and the money still adds up")
    void concurrentDepositsAddUp() {
        Solution.EventStore store = new Solution.EventStore();
        store.append(new Solution.Opened("a1", "Ada"));

        List<Solution.Event> commands = new ArrayList<>(IntStream.range(0, 500)
                .mapToObj(i -> (Solution.Event) new Solution.Deposited("a1", 5))
                .toList());

        Map<String, Long> balances = Solution.runConcurrently(store, commands);

        assertEquals(2_500L, balances.get("a1"), "500 x 5 pence, with nothing lost to a race");
        assertEquals(501, store.events().size(), "the open, plus every deposit");
        assertEquals(2_500L, store.totalDeposited());
    }
}
