# 01 — The Event Loop

JavaScript runs on **one thread**. Everything asynchronous is a scheduling
trick, and the event loop is the scheduler. Get the ordering rules right and
async stops being guesswork.

## The three places work waits

**The call stack** — what's running right now. Synchronous code runs to
completion here; nothing else gets a turn until the stack is empty.

**The microtask queue** — promise callbacks (`.then`, `await` continuations),
`queueMicrotask`. Drained **completely** after the current synchronous run,
before anything else.

**The macrotask queue** — `setTimeout`, `setInterval`, I/O. One task per loop
turn, and the microtask queue is fully drained between each.

## The rule that answers every ordering question

> Run all synchronous code. Then drain **all** microtasks. Then take **one**
> macrotask. Then drain all microtasks again. Repeat.

Microtasks always beat macrotasks, even a `setTimeout(fn, 0)` registered first:

```js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');

// 1, 4, 3, 2
```

`1` and `4` are synchronous. `3` is a microtask. `2` is a macrotask, and loses
even though it was scheduled first and asked for zero delay.

## `setTimeout(fn, 0)` doesn't mean "now"

It means "queue this as a macrotask, no sooner than 0ms." If the stack is busy
for 500ms, it fires after 500ms. Timers are a **floor**, never a promise.

A microtask that queues another microtask gets drained in the same pass — which
means an infinitely self-queueing microtask **starves the loop entirely**, and
no timer or I/O ever runs again.

## `await` is `.then` in disguise

```js
async function f() {
  console.log('a');
  await null;            // ← everything after this becomes a microtask
  console.log('b');
}
f();
console.log('c');
// a, c, b
```

An async function runs synchronously until its first `await`. The rest is a
microtask continuation. `await null` still yields — awaiting a non-promise
still costs you a trip through the queue.

## Node's extras

Node adds two of its own, which show up in real code:

- `process.nextTick` — drained *before* the promise microtask queue.
- `setImmediate` — a macrotask that runs after I/O, distinct from `setTimeout`.

Order within one turn: sync → `nextTick` → promises → timers/immediate.

## What to build

You're mostly recording ordering here, then proving you can control it.

| Export | What it does |
| --- | --- |
| `ORDER_PREDICTIONS` | Predict four output orders before running anything |
| `recordOrder()` | Produce a known sync/micro/macro interleaving |
| `nextMicrotask()` | Resolve on the microtask queue |
| `nextMacrotask()` | Resolve on the macrotask queue |
| `runAfterDrain(fn)` | Run `fn` only once all pending microtasks are done |
| `isStarved(n)` | Show that queued microtasks all run in one pass |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. Replace `await null` with `await Promise.resolve()`. Does the ordering
   change? It used to, before a spec fix — find out what changed.
2. Write a microtask that queues itself forever. Does your `setTimeout` ever
   fire? (Run it with a kill switch.)
3. Where does `process.nextTick` land relative to `await`? Test it.
