# 04 — Generators

Lesson 03 had you write `next()` and track position by hand. A generator writes
all of that for you.

```js
function* range(from, to) {
  for (let n = from; n < to; n++) yield n;
}
[...range(0, 3)];   // [0, 1, 2]
```

Calling a generator function runs **no code**. It returns a generator object —
which is both an iterator and iterable. Each `next()` runs until the next
`yield` and pauses there, keeping every local variable alive.

## Pausable functions

This is the genuinely new capability. A normal function runs to completion; a
generator suspends mid-body and resumes later:

```js
function* steps() {
  console.log('a'); yield 1;
  console.log('b'); yield 2;
  console.log('c');
}
const g = steps();
g.next();   // logs 'a', returns { value: 1, done: false }
g.next();   // logs 'b', returns { value: 2, done: false }
g.next();   // logs 'c', returns { value: undefined, done: true }
```

Nothing runs before the first `next()`. That's how infinite generators are safe
— they only compute what's pulled.

## `return` and `yield*`

A `return` value shows up once, with `done: true` — and `for...of` **ignores**
it, since it stops at `done`. If you need it, drive `next()` yourself.

`yield*` delegates to another iterable, flattening it in:

```js
function* inner() { yield 2; yield 3; }
function* outer() { yield 1; yield* inner(); yield 4; }
[...outer()];   // [1, 2, 3, 4]
```

That's what makes recursive generators clean — walking a tree becomes four
lines.

## Two-way communication

`next(value)` sends a value **into** the generator, where it becomes the result
of the paused `yield`:

```js
function* adder() {
  const a = yield 'first?';
  const b = yield 'second?';
  return a + b;
}
const g = adder();
g.next();      // { value: 'first?' } — runs to the first yield
g.next(2);     // 2 becomes the value of the first yield
g.next(3);     // { value: 5, done: true }
```

The first `next()` argument is discarded — nothing is waiting to receive it.
This channel is how `async/await` is implemented underneath: a generator
yielding promises, driven by a runner that feeds resolved values back in.

`throw()` injects an error at the pause point; `return()` finishes it early,
running any `finally` blocks on the way out.

## Async generators

`for await...of` over an `async function*`, for streams and paginated APIs:

```js
async function* pages(url) {
  let next = url;
  while (next) {
    const page = await fetch(next);
    yield page.items;
    next = page.nextUrl;
  }
}
```

## What to build

| Export | What it does |
| --- | --- |
| `range(from, to, step)` | Lesson 03's range, four lines this time |
| `naturals()` | Infinite, safe because it's lazy |
| `takeFrom(iterable, n)` | A generator that yields a prefix |
| `mapGen` / `filterGen` | Lazy `map` and `filter` |
| `flattenGen(value)` | Recursive `yield*` |
| `collect(gen)` | Drive it manually, capturing the `return` value |
| `runner(genFn)` | Drive a promise-yielding generator — mini `async/await` |
| `pages(fetchPage)` | An async generator |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. Put a `try/finally` in a generator, then call `.return()` mid-iteration.
   Does the `finally` run?
2. Your `runner` is `async/await` in miniature. What does it not handle that
   the real thing does?
3. Chain `mapGen(filterGen(naturals(), isEven), double)` and take 3. How many
   times did the filter's predicate actually run?
