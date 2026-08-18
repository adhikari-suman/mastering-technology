# 05 — Currying and Partial Application

Two related ideas people constantly conflate. The difference is worth being
precise about.

**Partial application**: fix *some* arguments now, get back a function wanting
the rest.

```js
const add = (a, b, c) => a + b + c;
const add1 = partial(add, 1);
add1(2, 3);      // 6   — one call, remaining args together
```

**Currying**: turn an n-argument function into a chain of **one-argument**
functions.

```js
const curried = curry(add);
curried(1)(2)(3);   // 6   — three calls, one argument each
```

Partial application is a single step. Currying is a full transformation into
unary functions. In practice, most JavaScript "curry" helpers are lenient and
accept both `curried(1)(2)(3)` and `curried(1, 2)(3)`, which is what you'll
build.

## How curry works

Collect arguments until you have enough, then call the real function. "Enough"
comes from `fn.length` — a function's **arity**, the number of declared
parameters:

```js
((a, b, c) => 0).length      // 3
((a, b = 1) => 0).length     // 1   ← defaults stop the count
((...args) => 0).length      // 0   ← rest params don't count
```

That's why `curry` needs `curryN` as an escape hatch: `fn.length` lies about
any function with defaults or rest parameters.

The shape:

```js
function curry(fn) {
  return function collect(...args) {
    if (args.length >= fn.length) return fn(...args);   // enough — go
    return (...more) => collect(...args, ...more);      // not yet — remember
  };
}
```

Each partial call closes over the arguments so far. It's lesson 01 again.

## Why bother

Curried functions compose. Every helper in lesson 06 wants **unary** functions —
one in, one out — and currying is how you turn a two-argument function into one:

```js
const prop = curry((key, obj) => obj[key]);
const getName = prop('name');       // now unary
users.map(getName);
```

Without currying you'd write `users.map(u => u.name)` — which is fine! Currying
earns its keep when you're building pipelines, not one-off callbacks.

## The `map` gotcha this fixes

```js
['1', '2', '3'].map(parseInt);      // [1, NaN, NaN]
```

`map` passes `(value, index, array)`, and `parseInt` reads the second argument
as a radix. `parseInt('2', 1)` is `NaN`. The fix is to force arity down to one:

```js
['1', '2', '3'].map(unary(parseInt));   // [1, 2, 3]
```

That's `unary`, and you're building it below.

## What to build

You write these in `solution.js`. The full spec for each is in the JSDoc above
the corresponding stub in `exercise.js`, and `exercise.test.js` is the final
authority.

| Export | What it does |
| --- | --- |
| `curry(fn)` | Curry using `fn.length`, accepting args one or many at a time |
| `curryN(n, fn)` | The same, with the arity stated explicitly |
| `partial(fn, ...preset)` | Fix leading arguments |
| `partialRight(fn, ...preset)` | Fix trailing arguments |
| `unary(fn)` | Force a function to accept exactly one argument |
| `flip(fn)` | Swap the first two arguments |

## Running it

Both of these run from inside this folder:

```bash
cp exercise.js solution.js   # once
npm run watch                # scopes to this lesson automatically
```

## Going deeper

1. What does your `curry` do with a function that has default parameters? Try
   `curry((a, b = 2) => a + b)` and explain the result.
2. `partialRight` looks symmetric with `partial` but isn't quite. What happens
   with a variadic function, and why is "trailing" ambiguous?
3. Could `curry` be written with `bind` instead of a closure? Try it. Which
   reads better, and what does `bind` cost you?
