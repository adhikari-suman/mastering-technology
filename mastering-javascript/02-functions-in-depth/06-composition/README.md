# 06 — Composition

The last idea in this Part, and the one the other five were building toward.
Composition is gluing small functions into bigger ones without writing any glue.

```js
const shout = (s) => s.toUpperCase();
const exclaim = (s) => `${s}!`;

const excited = pipe(shout, exclaim);
excited('hello');    // 'HELLO!'
```

No intermediate variables, no nesting. The pipeline *is* the description.

## `compose` and `pipe` are the same function backwards

```js
compose(f, g, h)(x)   // f(g(h(x)))   — right to left, like the maths notation
pipe(f, g, h)(x)      // h(g(f(x)))   — left to right, like reading
```

`compose` matches how you'd write it by hand: `f(g(h(x)))`. `pipe` matches the
order things happen. Use `pipe` unless you have a reason not to — reading
top-to-bottom beats inside-out.

Both are one line with `reduce`:

```js
const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);
```

Everything else in this lesson is a variation on that.

## The unary rule

Composition only works when each function takes **one** argument and returns
**one** value. Anything else has nowhere to put the extra arguments.

That's what lesson 05 was for. A two-argument function becomes composable by
currying it:

```js
const multiply = curry((factor, n) => n * factor);
pipe(multiply(2), multiply(3))(5);    // 30
```

## `tap`, for the thing pipelines make hard

Pipelines have no obvious place to put a `console.log`. `tap` runs a side effect
and passes the value through untouched:

```js
pipe(
  parse,
  tap(console.log),     // look, but don't touch
  validate,
)(input);
```

It's the debugger for point-free code, and the only sanctioned way to do
something impure mid-pipeline.

## `identity` earns its keep

`identity = (x) => x` looks useless. It is the neutral element:

```js
pipe()            // no functions at all — must still return something sane
filter(identity)  // drop falsy values
maybe ?? identity // "no transform" as a default
```

Any function that takes a list of functions needs an answer for the empty list,
and `identity` is that answer.

## What to build

You write these in `solution.js`. The full spec for each is in the JSDoc above
the corresponding stub in `exercise.js`, and `exercise.test.js` is the final
authority.

| Export | What it does |
| --- | --- |
| `identity(x)` | Returns its argument |
| `pipe(...fns)` | Left to right |
| `compose(...fns)` | Right to left |
| `tap(fn)` | Run a side effect, pass the value through |
| `juxt(...fns)` | Apply every function to one input, collect the results |
| `complement(predicate)` | Negate a predicate |

## Running it

Both of these run from inside this folder:

```bash
cp exercise.js solution.js   # once
npm run watch                # scopes to this lesson automatically
```

## Going deeper

1. `pipe(f)` and `compose(f)` are the same for one function. At what point do
   they diverge, and can you write one in terms of the other?
2. Your `pipe` only passes one value along. What would it take to support
   multi-argument first calls — `pipe(add, double)(1, 2)`?
3. Rewrite `juxt` using `pipe` and `map`. Is it clearer? This is the honest
   question about point-free style: it isn't always better.
