# 01 — Values and Types

Every value in JavaScript is either a **primitive** or an **object**. That's the
whole taxonomy. Get this layer exact and half of JavaScript's famous weirdness
stops being weird.

## The seven primitives

| Type        | Example              | Notes                                          |
| ----------- | -------------------- | ---------------------------------------------- |
| `string`    | `"hi"`, `` `hi` ``   | Immutable. `s[0] = 'x'` silently does nothing.  |
| `number`    | `42`, `3.14`, `NaN`  | One type for ints and floats. IEEE-754 doubles. |
| `boolean`   | `true`, `false`      |                                                 |
| `undefined` | `undefined`          | "This has no value **yet**." Assigned by JS.    |
| `null`      | `null`               | "This has **no** value." Assigned by you.       |
| `bigint`    | `9007199254740993n`  | For integers beyond `Number.MAX_SAFE_INTEGER`.  |
| `symbol`    | `Symbol('id')`       | Unique keys. Part 03.                         |

Everything else — arrays, functions, dates, regexes, plain `{}` — is an object.

## `typeof` and its one famous bug

```js
typeof "hi"        // 'string'
typeof 42          // 'number'
typeof undefined   // 'undefined'
typeof {}          // 'object'
typeof []          // 'object'   <- arrays are objects
typeof function(){} // 'function' <- special-cased
typeof null        // 'object'   <- a bug from 1995, kept for compatibility
```

`typeof null === 'object'` is wrong and can never be fixed without breaking the
web. To test for null, compare directly: `value === null`. To test for an array,
use `Array.isArray(value)`.

## Numbers are floats, all of them

```js
0.1 + 0.2          // 0.30000000000000004
0.1 + 0.2 === 0.3  // false
```

This is not a JavaScript flaw — it's binary floating point, and Python and Java
do the same thing. `0.1` has no exact binary representation, exactly like `1/3`
has no exact decimal one. **Never compare floats with `===`.** Compare within a
tolerance (an "epsilon") instead.

`NaN` ("not a number") is the result of a failed numeric operation, and it is
the only value in the language not equal to itself:

```js
NaN === NaN         // false
Number.isNaN(NaN)   // true   <- use this
isNaN("hello")      // true   <- the old global coerces first. Avoid it.
```

## Converting on purpose

```js
Number("42")     // 42
Number("42abc")  // NaN
Number("")       // 0        <- surprising
Number(null)     // 0        <- surprising
Number(undefined)// NaN
String(42)       // '42'
Boolean("")      // false
```

Explicit conversion is a feature. Implicit conversion is lesson 02's problem.

## What to build

You write these in `solution.js`. The full spec for each — signature,
examples, edge cases — is in the JSDoc above the corresponding stub in
`exercise.js`, and `exercise.test.js` is the final authority.

| Export | What it does |
| --- | --- |
| `typeOf(value)` | `typeof`, but honest — `'null'` for null, `'array'` for arrays |
| `toNumber(value)` | Convert to number; `null` rather than letting `NaN` escape |
| `isReallyNaN(value)` | True only for the actual `NaN` value, with no coercion |
| `describeNumber(n)` | `'integer'` / `'float'` / `'infinite'` / `'not a number'` |
| `formatIntro(name, age)` | A sentence built with a template literal |
| `almostEqual(a, b, epsilon)` | Float comparison that survives `0.1 + 0.2` |

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

Once green, answer these in the REPL (`node`):

1. Why does `typeof NaN` return `'number'`?
2. What does `Number.MAX_SAFE_INTEGER + 2` give you, and why is that not a bug?
3. `null` and `undefined` are different types — so why does `null == undefined`
   come out `true`? (Lesson 02 answers this.)
