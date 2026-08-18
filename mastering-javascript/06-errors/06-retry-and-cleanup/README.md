# 06 — Retry, Backoff and Resource Cleanup

The patterns that make failure survivable, and the ones that make it worse.

## Only retry what's worth retrying

```js
retry(() => fetch(url));           // sensible — networks flap
retry(() => JSON.parse(bad));      // pointless — it will fail identically forever
retry(() => charge(card));         // dangerous — you may charge twice
```

Three categories:

**Transient** — network blips, 503, timeouts, lock contention. Retry.

**Permanent** — 400, 404, malformed input, bad credentials. Retrying wastes time
and hides the real problem.

**Ambiguous** — a request that timed out *might* have succeeded. Retrying is
only safe if the operation is **idempotent**: doing it twice has the same effect
as once. `PUT /user/1 {name}` is idempotent; `POST /charge` is not.

So a retry helper needs a predicate: retry *this* error, not all errors.

## Backoff

Retrying immediately, in a loop, from every client at once, is how you turn a
brief outage into a sustained one. Back off exponentially:

```
attempt 1 → wait 100ms
attempt 2 → wait 200ms
attempt 3 → wait 400ms
```

And add **jitter** — randomness — or every client that failed together retries
together, in a synchronised wave. That's the thundering herd, and jitter is the
one-line fix:

```js
const delay = base * 2 ** attempt * (0.5 + Math.random() * 0.5);
```

Cap the total: attempts, elapsed time, or both.

## Circuit breakers

If a dependency is down, hammering it helps nobody. A breaker counts failures;
past a threshold it **opens** and fails immediately without calling the
dependency at all. After a cooldown it lets one request through to test the
water, and closes again if that succeeds.

Three states — closed (normal), open (failing fast), half-open (testing). It
converts a slow cascading failure into a fast local one.

## Cleanup that actually runs

Every acquired resource needs a release on **every** path:

```js
const handle = await open(path);
try { return await use(handle); }
finally { await handle.close(); }
```

`finally`, not "after the return" — a throw would skip it. And per lesson 04, a
`finally` that throws must not mask the original error.

For several resources, release in reverse order of acquisition, and make sure
one failing release still attempts the rest.

## What to build

| Export | What it does |
| --- | --- |
| `retryWithBackoff(fn, options)` | Attempts, delays, a retry predicate |
| `isTransient(err)` | Which errors are worth retrying |
| `exponentialDelay(attempt, base)` | The delay schedule |
| `circuitBreaker(fn, options)` | Closed / open / half-open |
| `withResource(acquire, use)` | Acquire, use, always release |
| `withResources(acquirers, use)` | Several, released in reverse |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. Your breaker counts failures. Should a *slow* success count too? What does
   that change?
2. Add jitter to `exponentialDelay`. How would you test something random
   without making the test flaky?
3. `withResources` releases in reverse. Construct a case where the forward order
   breaks something.
