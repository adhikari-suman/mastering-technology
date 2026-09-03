# 02 — Synchronization

Lesson 01 showed the damage. This one is the toolbox: intrinsic locks,
`ReentrantLock`, read/write locks, and the atomics — plus the judgement about
which of them is the wrong answer.

## `synchronized` and the intrinsic lock

Every Java object has a monitor. `synchronized` acquires it, and releases it on
the way out however you leave — return, break, or exception.

```java
synchronized (account) { account.balance += 1; }

synchronized void bump() { … }          // locks `this`
static synchronized void tick() { … }   // locks Counter.class, a DIFFERENT lock
```

Those last two are not the same lock, which is a real source of bugs in classes
that have both. Locking on `this` at all is a design smell — anyone holding your
object can lock it too and stall you — so a `private final Object lock = new
Object()` you alone can reach is the safer habit.

Intrinsic locks are **reentrant**: the thread that holds a monitor can enter it
again without blocking, which is what makes a synchronized method able to call
another synchronized method on the same object. A hand-rolled lock that forgets
this self-deadlocks on the second acquire.

Mutual exclusion is not the only thing you bought. Unlocking a monitor
happens-before the next lock of that same monitor, so everything the first
thread wrote is visible to the second. A lock is a visibility barrier as well as
an exclusion device — which is why "I'll just make it `volatile`" is not a
substitute.

## The trap: two locks, two orders, deadlock

Moving money needs both accounts locked at once, or another thread can observe
the money in neither. The obvious code is a deadlock:

```java
void transfer(Account from, Account to, int amount) {
    synchronized (from) {
        synchronized (to) { from.add(-amount); to.add(amount); }
    }
}
```

Thread A does `transfer(x, y, …)` and holds `x`. Thread B does `transfer(y, x,
…)` and holds `y`. Each now waits forever for what the other holds. Nothing
throws, nothing times out, no stack trace appears — the two threads simply stop,
and `jstack` is how you find out.

The fix is not a smarter lock. It is a **global order**: every thread that wants
both locks takes them in the same order, so a cycle cannot form.

```java
Account first  = from.id() <= to.id() ? from : to;
Account second = from.id() <= to.id() ? to   : from;
synchronized (first) { synchronized (second) { … } }
```

Any total order works as long as everybody agrees on it. When there is no
natural key, `System.identityHashCode` is the usual fallback (with a tie-break
lock for the collision).

## `ReentrantLock` when `synchronized` is not enough

Same semantics, explicit object, more powers — at the price that you must
release it yourself, so the `finally` is mandatory:

```java
lock.lock();
try { … } finally { lock.unlock(); }
```

What it adds: `tryLock()` (never blocks), `tryLock(timeout, unit)` (gives up),
`lockInterruptibly()`, condition variables, and a fairness option
(`new ReentrantLock(true)`) that hands the lock to the longest waiter instead of
whoever happens to be running. Fairness costs a lot of throughput; the unfair
default is right unless you have measured starvation.

`tryLock` with a timeout is how you turn a potential deadlock into a failure you
can retry or report. It throws `InterruptedException`, and swallowing that is
its own bug: catching it clears the interrupt flag, so the code above you can
never find out it was asked to stop. Restore it.

```java
catch (InterruptedException e) {
    Thread.currentThread().interrupt();   // put the flag back
    return false;
}
```

## Locks keep threads apart; latches make them wait for each other

Not every coordination problem is mutual exclusion. "Do not continue until the
worker has actually started" is a *rendezvous*, and no lock expresses it —
holding a lock tells you nothing about what another thread has reached.

`CountDownLatch` is the one-shot answer: a counter that only ever goes down, and
a wait that ends when it hits zero.

```java
CountDownLatch started = new CountDownLatch(1);
new Thread(() -> { started.countDown(); work(); }).start();

started.await();                         // returns once the worker really began
started.await(1, TimeUnit.SECONDS);      // ... or give up, and return false
```

It cannot be reset — a latch is built for one event and thrown away, which is
exactly what makes it safe to hand to any number of threads. Counting down more
times than the initial count is harmless; the extra calls do nothing.

The thing it replaces is `Thread.sleep(50)` and hope. A sleep is a guess about
someone else's scheduling: too short and the test fails on a loaded machine, too
long and every run pays for it. A latch waits for the event itself, so it is
both faster and correct.

You will want one three more times in this Part — to prove a pool's only thread
is busy (lesson 03), to ask whether N tasks are genuinely in flight at once
(lesson 04), and to hold a subtask blocked until its sibling fails (lesson 06).

## `ReadWriteLock` for read-mostly state

`ReentrantReadWriteLock` lets any number of readers in at once, but a writer
excludes everyone. It pays off only when reads dominate and are not trivially
short; under write pressure it is slower than a plain lock, and you **cannot
upgrade** — taking the write lock while holding the read lock deadlocks that
thread against itself.

## Atomics, and `compareAndSet`

`AtomicInteger`, `AtomicLong`, `AtomicReference` are single variables with
lock-free read-modify-write:

```java
counter.incrementAndGet();
```

Underneath is one CPU instruction, compare-and-swap, exposed as
`compareAndSet(expected, next)`: "store `next`, but only if the value is still
`expected`". You build everything else from a retry loop.

```java
T current, next;
do { current = ref.get(); next = f.apply(current); }
while (!ref.compareAndSet(current, next));
```

The consequence people miss: **`f` can run more than once**. Under contention
the loop retries, so the function must be pure. Put a counter or a log line in
it and the numbers will not add up.

## When a lock is the wrong tool

A lock protects an invariant across several fields. If what you actually have is
one value, use an atomic. If what you have is a group of fields that change
together, don't lock them — put them in an immutable record and swap the whole
record with one CAS:

```java
record Tally(int calls, long total) { }
AtomicReference<Tally> state = new AtomicReference<>(new Tally(0, 0));
```

Readers get a consistent snapshot with no lock at all, because the thing they
read cannot change underneath them. That is usually the better design, and it is
the one JavaScript's single thread gave you for free without telling you.

## What to build

| Method | What it does |
| --- | --- |
| `synchronizedCount(int, int)` | The lesson-01 race, fixed with a monitor |
| `atomicCount(int, int)` | The same, with `AtomicInteger` |
| `reentrantDepth(int)` | A synchronized method that re-enters its own lock |
| `transfer(Account, Account, int)` | Two locks, taken in a global order |
| `tryRun(ReentrantLock, long, Runnable)` | Timed `tryLock`, with the flag restored |
| `Counters` | A read/write-locked tally with a snapshot |
| `updateAtomically(AtomicReference, UnaryOperator)` | A CAS retry loop by hand |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `transfer(a, a, 5)` locks the same monitor twice. Why is that not a
   deadlock, and what would have to be true of the lock for it to be one?
2. `synchronizedCount` and `atomicCount` produce the same answer. Which is
   faster at four threads, and which is faster at four hundred? Why does the
   answer depend on how long the critical section is?
3. `updateAtomically` may call its function several times per successful
   update. Write down two innocent-looking functions that break under that, and
   one that would deadlock inside the loop.
4. `ReentrantReadWriteLock` cannot upgrade a read lock to a write lock, but it
   can downgrade. What would upgrading have to do to be safe, and why is that
   equivalent to just taking the write lock?
