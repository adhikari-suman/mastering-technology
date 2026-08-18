# 02 — Callbacks

Before promises, asynchrony meant handing someone a function to call when they
were done. Every Node API still has this shape underneath, and you'll meet it in
any codebase older than about 2018.

## The error-first convention

Node settled on one signature, and near-universal adherence is what made it
workable:

```js
fs.readFile('a.txt', (err, data) => {
  if (err) return handle(err);   // always check first, always return
  use(data);
});
```

`err` is `null` on success. The `return` matters — without it you fall through
and use `data` that doesn't exist.

## Why callbacks got a bad name

**Nesting.** Sequential async steps nest instead of stacking:

```js
readFile('a', (err, a) => {
  if (err) return done(err);
  readFile(b, (err, b) => {
    if (err) return done(err);
    readFile(c, (err, c) => {     // and onward, rightward, forever
      ...
    });
  });
});
```

Each level repeats the error check. Miss one and the failure vanishes silently.

**`try/catch` doesn't work.** By the time the callback runs, the stack that had
your `try` on it is long gone:

```js
try {
  readFile('missing', (err, data) => { throw err; });   // NOT caught below
} catch (e) {
  // never runs
}
```

That single fact is why promises exist.

**Call-twice bugs.** Nothing stops a badly written API from calling your
callback twice, or never. A promise can only settle once, by construction.

**Zalgo.** A callback that's *sometimes* synchronous and sometimes async is a
genuine menace, because callers can't reason about ordering. If you write a
callback API, always defer — make it async every time, even on the cached path.

## Converting to promises

The bridge, and the reason `util.promisify` exists:

```js
const promisified = (...args) =>
  new Promise((resolve, reject) => {
    fn(...args, (err, value) => (err ? reject(err) : resolve(value)));
  });
```

## What to build

| Export | What it does |
| --- | --- |
| `delay(ms, value, cb)` | An error-first async function to practise against |
| `promisify(fn)` | Error-first callback → promise |
| `callbackify(fn)` | Promise → error-first callback |
| `series(tasks, cb)` | Run async tasks one after another |
| `parallel(tasks, cb)` | Run them at once, collect in order |
| `once(fn)` | Guarantee a callback fires at most once |
| `deferred(fn)` | Force a sync function to always be async |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. What should `parallel` do when two tasks fail? Your version calls back once —
   which error wins, and is that the right choice?
2. `series` on an empty array — what do you call back with, and when?
3. Write a callback API that's synchronous when cached. Then demonstrate the
   bug it causes. That's Zalgo, and now you'll never ship it.
