# 06 — Capstone: an event-sourced store

Everything the curriculum has covered, in one program: sealed interfaces,
records, pattern matching, generics, streams, `Optional`, custom exceptions, and
virtual threads. It is bigger than any other lesson here and it is meant to be.

## The idea

An event-sourced store does not keep the current state. It keeps the **events
that produced it**, and derives the state by folding over them.

```
Opened("a1", "Ada")     →  Account[a1, Ada, 0, open]
Deposited("a1", 500)    →  Account[a1, Ada, 500, open]
Withdrawn("a1", 200)    →  Account[a1, Ada, 300, open]
Closed("a1")            →  Account[a1, Ada, 300, closed]
```

The event log is append-only and never edited, so the state at any past moment
is a matter of replaying a prefix. That is why banks, ledgers and audit systems
are built this way — and it maps onto Java's type system unusually well.

## A sealed interface is a closed set of cases

```java
sealed interface Event permits Opened, Deposited, Withdrawn, Closed {
    String accountId();
}
record Deposited(String accountId, long pence) implements Event { }
```

`sealed` means the compiler knows every possible event. That turns the fold into
an exhaustive `switch` with **no default branch** — and when a fifth event type
is added later, every switch that does not handle it fails to compile. A
`default` arm would have thrown that guarantee away, which is why there isn't
one.

```java
static Account apply(Account state, Event event) {
    return switch (event) {
        case Opened(String id, String owner) when state == null ->
                new Account(id, owner, 0L, false);
        case Opened o ->
                throw new IllegalTransitionException("already open: " + o.accountId());
        case Event e when state == null ->
                throw new IllegalTransitionException("no such account: " + e.accountId());
        ...
    };
}
```

Two things worth noticing. `case Opened(String id, String owner)` is a **record
pattern**: it matches the type and pulls the components out in one move. And a
*guarded* label — `when state == null` — never dominates a later label, which is
what lets the general `case Event e when ...` sit above the specific cases
without making them unreachable.

## Two layers of validation, two exceptions

A compact constructor validates the event **in isolation**:

```java
record Deposited(String accountId, long pence) implements Event {
    Deposited {
        if (accountId == null || accountId.isBlank())
            throw new InvalidEventException("accountId is required");
        if (pence <= 0)
            throw new InvalidEventException("deposit must be positive");
    }
}
```

That runs before the fields are assigned, on every construction path including
`with`-style copies, so an invalid `Deposited` cannot exist. Note what it cannot
check: whether the account exists, or has the money.

That is the second layer, and it lives in `apply`, because it needs the state:

```java
case Withdrawn(String id, long pence) when pence > state.balancePence() ->
        throw new IllegalTransitionException("insufficient funds: " + id);
```

Two exception types, because they mean different things to a caller. An
`InvalidEventException` is a bug in the caller's data. An
`IllegalTransitionException` is a legitimate business rejection — the same
command might succeed a second later. Collapsing both into
`IllegalArgumentException` throws that distinction away.

## Optional at the lookup boundary

```java
Optional<Account> find(String id);        // may not be there
List<Event> eventsFor(String id);         // empty list, never null
```

`Optional` earns its place at exactly one kind of boundary: a lookup that can
legitimately miss. A method returning a collection returns an *empty* collection
instead — `Optional<List<T>>` gives the caller two ways to say "nothing" and no
way to tell them apart. Fields and parameters do not take `Optional` either;
`java.util.Optional` is not even serialisable, which is the JDK team saying so.

## Streams for projections

A projection is a read model derived from the log. Each one is a collector, and
there are only three shapes to know. Borrowing a different domain so the shapes
stay visible — a library's `Book` records and its `Loan` log:

```java
// a keyed lookup: one entry per element, a key function and a value function
books.stream().collect(toMap(Book::isbn, Book::pageCount));

// a total over one case of a mixed log: narrow with instanceof, cast, then
// widen to a primitive stream so the sum is a long rather than boxed
loans.stream().filter(l -> l instanceof Overdue)
     .mapToLong(l -> ((Overdue) l).daysLate()).sum();

// a histogram: a classifier that says which bucket, and a downstream collector
// that says what to do with each bucket
loans.stream().collect(groupingBy(Loan::borrower, counting()));
```

The three projections you write are one of each, with different key and value
functions; the javadoc on each one says which key it wants.

Watch `toMap`: the two-argument form throws `IllegalStateException` on a
duplicate key rather than overwriting, which is a good default and a surprise
the first time. And a stream sort needs a **total** order if the result is to be
reproducible — sorting only by balance leaves accounts with equal balances in
whatever order they arrived, so the tie-break by id is not decoration.

## The concurrent command path

Commands arrive from many threads. Appending has to be atomic across three
steps — read the current state, validate the transition, record the event —
because a check followed by an act is a race:

```java
synchronized void append(Event event) {
    Account current = accounts.find(event.accountId()).orElse(null);
    Account next = apply(current, event);      // throws if not allowed
    log.add(event);
    accounts.save(event.accountId(), next);
}
```

Then a virtual thread per command, and an executor whose `close()` waits:

```java
try (var pool = Executors.newVirtualThreadPerTaskExecutor()) {
    for (Event command : commands) pool.submit(() -> store.append(command));
}   // close() blocks until every task has finished
```

500 virtual threads is not 500 OS threads; they are objects on the heap, parked
and unparked by the JVM. That is what makes "a thread per request" a reasonable
design again.

**The trap this lesson ends on:** without the `synchronized`, 500 concurrent
deposits of 5 pence do not add up to 2500. Two threads read the same balance,
both add to it, and one write lands on top of the other — a lost update. The
tests here are deterministic in the sense that a *correct* implementation always
passes; an unsynchronised one usually fails, and the times it does not are worse
than the times it does.

## What to build

| Piece | What it does |
| --- | --- |
| `Opened`, `Deposited`, `Withdrawn`, `Closed` | Compact constructors that reject nonsense |
| `apply(Account, Event)` | The fold: one exhaustive switch, no default |
| `replay(List<Event>)` | Fold a whole log, `Optional.empty` for none |
| `Repository.save/find/all/size` | A generic in-memory store, insertion-ordered |
| `EventStore.append` | The one place events enter, and the only lock |
| `EventStore.events/eventsFor/find` | Reads |
| `EventStore.balances/topOwners/totalDeposited/countByType` | Projections |
| `runConcurrently(EventStore, List)` | A virtual thread per command |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `apply` throws on an illegal transition, so a bad command aborts the append
   and nothing is recorded. An alternative is to record a `Rejected` event.
   What does each choice do to the audit trail, and to replay?
2. `EventStore` keeps a projection up to date as events arrive, and could
   instead rebuild it from the log on every read. Where is the crossover, and
   what does keeping it break if the fold changes?
3. `append` is `synchronized`, so it serialises every account. What would you
   have to change to lock per account instead, and what new failure appears?
4. Every event here is `long pence`. Work out what goes wrong with `double
   pounds`, and why every ledger you will ever see counts in integers.
