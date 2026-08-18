# 03 — The Iteration Protocol

`for...of`, spread, destructuring and `Array.from` all speak one protocol. Learn
it and you can make anything work with all of them at once.

## Two interfaces

**Iterable**: an object with a `[Symbol.iterator]()` method returning an
iterator.

**Iterator**: an object with a `next()` method returning
`{ value, done }`.

```js
const iterator = [1, 2][Symbol.iterator]();
iterator.next();   // { value: 1, done: false }
iterator.next();   // { value: 2, done: false }
iterator.next();   // { value: undefined, done: true }
```

That's the whole protocol. `for...of` calls `[Symbol.iterator]()`, then `next()`
until `done` is true, ignoring the final `value`.

## What consumes it

Everything, once you define one method:

```js
for (const x of iterable) { }
const [a, b] = iterable;
const all = [...iterable];
Array.from(iterable);
new Set(iterable);
new Map(iterableOfPairs);
Promise.all(iterable);
fn(...iterable);
```

Strings, arrays, `Map`, `Set`, `arguments` and DOM collections are all iterable.
Plain objects are **not** — which is why `[...{a: 1}]` throws while
`[...Object.entries({a: 1})]` works.

## Iterator vs iterable, and why it matters

An **iterable** hands out a fresh iterator each time, so it can be looped
repeatedly. An **iterator** carries position, so it's consumed once.

```js
const arr = [1, 2, 3];
[...arr]; [...arr];      // both give [1, 2, 3] — fresh iterator each time

const it = arr[Symbol.iterator]();
[...it]; [...it];        // [1,2,3] then [] — exhausted
```

Many iterators are also iterable, with `[Symbol.iterator]() { return this; }`.
That's what lets you `for...of` an iterator directly — and why doing so consumes
it permanently.

If your `[Symbol.iterator]` returns state that isn't recreated per call, looping
twice silently gives nothing the second time. That's the bug this lesson's tests
check for.

## Lazy by nature

An iterator computes values on demand, so it can be **infinite**:

```js
function* naturals() { let n = 0; while (true) yield n++; }
```

Nothing runs until something asks. `take(naturals(), 5)` pulls exactly five.
That's the door to lesson 04.

## Early exit and `return()`

`break`, `throw` and an early `return` inside `for...of` call the iterator's
optional `return()` method, if it has one — your chance to release a file handle
or close a connection. It's the `finally` of the protocol.

## What to build

| Export | What it does |
| --- | --- |
| `makeRange(from, to, step)` | Re-iterable, works with `for...of` and spread |
| `toIterator(iterable)` | Get the raw iterator |
| `take(iterable, n)` | First n values, works on infinite sources |
| `zip(a, b)` | Pair up two iterables, stopping at the shorter |
| `enumerate(iterable)` | `[index, value]` pairs |
| `isIterable(value)` | Does it implement the protocol? |
| `counter()` | An iterator that is also iterable |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. Make an object whose `[Symbol.iterator]` returns `this`. Loop it twice.
   Explain the second result to yourself before running it.
2. `break` out of a `for...of` over a custom iterator with a `return()` method.
   Prove `return()` fired.
3. Why is `[...'héllo']` sometimes a different length than `'héllo'.length`?
   The string iterator knows something `.length` doesn't.
