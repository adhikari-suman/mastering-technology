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
| `symbol`    | `Symbol('id')`       | Unique keys. Module 03.                         |

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

`solution.js` is empty. Export each of these. The examples below are
illustrative — `solution.test.js` is the authority.

### `typeOf(value)`
Like `typeof`, but honest: `'null'` for `null`, `'array'` for arrays, otherwise
the normal `typeof` string.
`typeOf(null)` → `'null'` · `typeOf([1,2])` → `'array'` · `typeOf('hi')` → `'string'`

### `toNumber(value)`
Convert to a number, but return `null` rather than letting `NaN` escape into the
rest of the program.
`toNumber('42')` → `42` · `toNumber('42abc')` → `null` · `toNumber(true)` → `1`

### `isReallyNaN(value)`
True only when the value **is** `NaN`. No coercion — the old global `isNaN`
would say `true` for `'hello'`, and that's the bug you're avoiding.
`isReallyNaN(NaN)` → `true` · `isReallyNaN('hello')` → `false`

### `describeNumber(n)`
Classify a number as `'integer'`, `'float'`, `'infinite'`, or `'not a number'`
(the last one covers both non-numbers and `NaN` itself).
`describeNumber(42)` → `'integer'` · `describeNumber(Infinity)` → `'infinite'`

### `formatIntro(name, age)`
Build a sentence with a template literal, not `+` concatenation.
`formatIntro('Ada', 36)` → `'Ada is 36 years old.'`

### `almostEqual(a, b, epsilon = 1e-9)`
Compare two floats safely: true when they differ by less than `epsilon`.
`almostEqual(0.1 + 0.2, 0.3)` → `true`

## Running it

From inside this folder:

```bash
node --test --watch
```

That re-runs on every save. Drop `--watch` for a single run — it exits non-zero
while anything is still red.

## Going deeper

Once green, answer these in the REPL (`node`):

1. Why does `typeof NaN` return `'number'`?
2. What does `Number.MAX_SAFE_INTEGER + 2` give you, and why is that not a bug?
3. `null` and `undefined` are different types — so why does `null == undefined`
   come out `true`? (Lesson 02 answers this.)
