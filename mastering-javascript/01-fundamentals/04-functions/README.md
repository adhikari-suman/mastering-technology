# 04 — Functions

Functions in JavaScript are **values**. You can store one in a variable, put it
in an array, pass it to another function, and return it from one. That single
fact is what the rest of the language is built on.

## Three ways to write one

```js
// 1. Declaration — hoisted: callable before its definition appears
function square(n) {
  return n * n;
}

// 2. Expression — a value assigned to a binding. Not usable before this line.
const cube = function (n) {
  return n * n * n;
};

// 3. Arrow — concise, and it does NOT get its own `this` (module 02)
const double = (n) => n * 2;
```

Arrow bodies without braces **return implicitly**. With braces you must
`return` yourself — a classic silent bug:

```js
const a = (n) => n * 2;        // returns n * 2
const b = (n) => { n * 2; };   // returns undefined
```

To implicitly return an object literal, wrap it in parens — otherwise the
braces are read as a function body:

```js
const makePoint = (x, y) => ({ x, y });
```

## Parameters

```js
function greet(name, greeting = 'Hello') { ... }  // default
function sumAll(...numbers) { ... }               // rest: collects into an array
```

Defaults fire only for `undefined`, not for `null` or `""`. A missing argument
is `undefined`, so it gets the default; an explicitly-passed `null` does not.

Rest must be last, and gives you a real array — unlike the legacy `arguments`
object, which you should ignore.

## Return

Every function returns something. Without an explicit `return`, that something
is `undefined`. Watch for ASI (automatic semicolon insertion) eating your value:

```js
return
  { ok: true };   // returns undefined — a semicolon is inserted after `return`
```

Put the brace on the same line as `return`. Always.

## Higher-order functions

A function that takes or returns a function.

```js
const applyTwice = (fn, x) => fn(fn(x));
applyTwice((n) => n + 3, 1);   // 7
```

This is the whole idea behind `map`, `filter`, `sort`, event listeners, and
every middleware system you'll ever touch. `setTimeout(fn, 0)` is the same
idea: you hand JS a function to run later.

## A first taste of closures

```js
function makeCounter() {
  let count = 0;
  return () => ++count;
}
const next = makeCounter();
next();  // 1
next();  // 2
```

The returned arrow still has access to `count` after `makeCounter` has
returned. The variable lives as long as something references it. That's a
**closure**, and it's the single most important concept in the language —
module 02 is devoted to it. For now, just make it work and notice that each
call to `makeCounter()` gets a fresh, independent `count`.

## What to build

You write these in `solution.js`. The full spec for each — signature,
examples, edge cases — is in the JSDoc above the corresponding stub in
`exercise.js`, and `exercise.test.js` is the final authority.

The first three specify *which form* to use — the point is to write all three
by hand, not to pick a favourite.

| Export | What it does |
| --- | --- |
| `square(n)` | Written as a function **declaration** |
| `cube(n)` | Written as a function **expression** |
| `double(n)` | Written as an **arrow** with an implicit return |
| `makeGreeting(name, greeting)` | Default parameter |
| `sumAll(...numbers)` | Rest parameters |
| `applyTwice(fn, value)` | Your first higher-order function |
| `makeAdder(amount)` | Returns a new function |
| `makeCounter()` | Returns a counter — independent per call. A closure. |
| `makePoint(x, y)` | Arrow implicitly returning an object literal |

## Running it

Both of these run from inside this folder:

```bash
cp exercise.js solution.js   # once
npm run watch                # scopes to this lesson automatically
```

`exercise.js` is never edited, so that `cp` is also how you start the lesson
over from scratch. For a single run instead of a watcher, `cd` in here and run
`node --test` — it exits non-zero while anything is still red.

> Don't use `node --test --watch`. Node's watcher follows the module graph, so
> the moment `solution.js` has a syntax error it stops being watched — you fix
> the typo and nothing re-runs. `npm run watch` watches the folder instead.

## Going deeper

1. Why can you call `square(2)` on the line above its declaration, but not
   `cube(2)`?
2. What does `typeof square` return? What does that tell you about functions?
3. Make `makeCounter` take a starting value that defaults to 0.
