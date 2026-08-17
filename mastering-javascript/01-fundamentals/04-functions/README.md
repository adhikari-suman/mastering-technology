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

`solution.js` is empty. The first three specify *which form* to use — the point
is to write all three by hand, not to pick a favourite.

### `square(n)`
Write this as a function **declaration**. `square(4)` → `16`

### `cube(n)`
Write this as a function **expression** assigned to a `const`. `cube(3)` → `27`

### `double(n)`
Write this as an **arrow** function with an implicit return — no braces.
`double(5)` → `10`

### `makeGreeting(name, greeting)`
`greeting` defaults to `'Hello'`. Put the default in the parameter list, not in
the body.
`makeGreeting('Ada')` → `'Hello, Ada!'` · `makeGreeting('Ada', 'Howdy')` → `'Howdy, Ada!'`

### `sumAll(...numbers)`
Sum any number of arguments using rest parameters. No arguments → `0`.
`sumAll(1, 2, 3)` → `6`

### `applyTwice(fn, value)`
Apply `fn` to `value` twice. Your first higher-order function.
`applyTwice(n => n + 3, 1)` → `7`

### `makeAdder(amount)`
Return a **new function** that adds `amount` to whatever it's given. Two adders
must not interfere with each other.
`makeAdder(5)(10)` → `15`

### `makeCounter()`
Return a counter function. Each call returns the next number, starting at 1.
Two separate counters must each have their own independent count — that
independence is the closure doing its job.
`const next = makeCounter(); next(); next()` → `1`, then `2`

### `makePoint(x, y)`
An arrow function with an implicit return of an **object literal**. Remember the
parentheses, or the braces are read as a function body.
`makePoint(1, 2)` → `{ x: 1, y: 2 }`

## Running it

From inside this folder:

```bash
node --test --watch
```

That re-runs on every save. Drop `--watch` for a single run — it exits non-zero
while anything is still red.

## Going deeper

1. Why can you call `square(2)` on the line above its declaration, but not
   `cube(2)`?
2. What does `typeof square` return? What does that tell you about functions?
3. Make `makeCounter` take a starting value that defaults to 0.
