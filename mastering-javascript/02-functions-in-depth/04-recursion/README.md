# 04 — Recursion

A recursive function calls itself on a smaller version of the problem until the
problem is small enough to answer outright.

Two parts, always:

1. **Base case** — the input so small you answer without recursing. Forget this
   and you get `RangeError: Maximum call stack size exceeded`.
2. **Recursive case** — reduce the problem and call yourself.

```js
function countdown(n) {
  if (n <= 0) return [];               // base case
  return [n, ...countdown(n - 1)];     // smaller problem
}
```

## The stack is real and it is finite

Every pending call holds a frame. `countdown(5)` stacks five frames before any
of them finishes:

```
countdown(5) → countdown(4) → countdown(3) → countdown(2) → countdown(1) → []
```

Node's default limit is roughly 10,000–12,000 frames. Recurse once per element
over a million-item array and you crash. Loops have no such limit — which is why
"use recursion" is a judgement call, not a virtue.

**Tail calls don't save you.** A tail call is one where the recursive call is
the very last thing the function does, and in principle the engine can reuse the
frame. ES2015 specified this. **V8 never shipped it**, so Node and Chrome still
grow the stack. Only JavaScriptCore (Safari) implements it. Write recursion for
clarity on bounded data, not as a loop replacement on unbounded data.

## Where recursion genuinely wins

Anything **tree-shaped**, where the data nests to an unknown depth:

- a directory tree
- the DOM
- JSON of arbitrary depth
- nested arrays

A loop over these needs an explicit stack you manage yourself. Recursion gets
that stack from the language for free. That's the trade: the call stack *is*
your data structure.

## Two shapes worth knowing

**Linear** — one call per step, like `factorial`. Depth grows with `n`.

**Branching** — several calls per step, like walking a tree, or naive Fibonacci:

```js
const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));
```

`fib(40)` makes over 300 million calls, because it recomputes the same values
endlessly. Memoize it — with the `memoize` you wrote in lesson 01 — and it
becomes instant. That's the same closure, doing real work.

## What to build

You write these in `solution.js`. The full spec for each is in the JSDoc above
the corresponding stub in `exercise.js`, and `exercise.test.js` is the final
authority.

**Every function here must be recursive.** No `for`, no `while`, no `.reduce`
standing in for the recursion — the point is the shape.

| Export | What it does |
| --- | --- |
| `factorial(n)` | The linear case, with a base case |
| `fibonacci(n)` | Branching recursion |
| `fastFibonacci(n)` | The same, memoized — must handle `n = 60` |
| `sumNested(value)` | Sum numbers nested in arrays to any depth |
| `flattenDeep(array)` | Flatten to a single level, any depth |
| `countNodes(tree)` | Count nodes in a `{ value, children }` tree |
| `maxDepth(tree)` | How deep that tree goes |
| `reverseString(str)` | Recursion on something that isn't a number |

## Running it

Both of these run from inside this folder:

```bash
cp exercise.js solution.js   # once
npm run watch                # scopes to this lesson automatically
```

## Going deeper

1. Find your actual stack limit: recurse with a counter until it throws, and
   catch the `RangeError`. Does the number change if the function takes more
   arguments?
2. Rewrite `flattenDeep` with an explicit array as a stack and no recursion.
   Which version would you rather maintain?
3. `fastFibonacci(200)` — does it return the right answer? Check it against
   `BigInt`. What broke, and at which `n` did it start?
