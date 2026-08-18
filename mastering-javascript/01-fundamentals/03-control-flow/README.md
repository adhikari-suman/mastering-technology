# 03 — Control Flow

Branching and looping. The mechanics are ten minutes of learning; the taste —
knowing which construct makes the code readable — is the actual skill.

## Declaring variables

Before the loops, the bindings:

```js
const x = 1;  // cannot be reassigned. Your default.
let y = 1;    // reassignable. Use when you genuinely need to reassign.
var z = 1;    // legacy. Function-scoped, hoisted, surprising. Never use it.
```

`const` does **not** mean immutable — it means the *binding* can't be
repointed. `const arr = []; arr.push(1)` is perfectly legal.

Start with `const` for everything. Downgrade to `let` only when the compiler
complains. Code where every binding is `const` is code where nothing changes
under you.

## Branching

```js
if (score >= 90) return 'A';
if (score >= 80) return 'B';
return 'F';
```

Prefer **guard clauses** — early returns for the exceptional cases — over deep
`else` nesting. Nesting is where bugs hide.

The ternary is an *expression*, so it produces a value:

```js
const label = count === 1 ? 'item' : 'items';
```

Use it for choosing a value. Don't use it for choosing an action, and never
nest one inside another.

`switch` compares with `===` and **falls through** unless you `break`:

```js
switch (day) {
  case 'sat':
  case 'sun':
    return 'weekend';   // deliberate fall-through: sat and sun share a body
  default:
    return 'weekday';
}
```

## Looping

```js
for (let i = 0; i < n; i++)      // when you need the index
for (const item of array)        // when you need the values  <- your default
for (const key in object)        // keys of an object (see the trap below)
while (condition)                // when the count isn't known up front
```

`break` exits the loop. `continue` skips to the next iteration.

**The trap:** `for...in` iterates *keys*, including inherited ones, and gives
you strings. On an array `[10, 20]` it yields `"0"` and `"1"`, not `10` and
`20`. Use `for...of` for arrays, always.

## When not to loop at all

Lesson 05 covers `map`, `filter`, and `reduce`, which replace most hand-written
loops with something shorter and harder to get wrong. Write the loops here so
you understand what those methods are doing — then mostly stop writing them.

## What to build

You write these in `solution.js`. The full spec for each — signature,
examples, edge cases — is in the JSDoc above the corresponding stub in
`exercise.js`, and `exercise.test.js` is the final authority.

Write these with explicit loops and branches — the array methods that would
shortcut most of them arrive in lesson 05.

| Export | What it does |
| --- | --- |
| `fizzbuzz(n)` | `1..n` as strings, with Fizz/Buzz/FizzBuzz |
| `grade(score)` | Letter grade via guard clauses; `null` out of range |
| `dayType(day)` | `switch` with deliberate fall-through |
| `sumEven(numbers)` | A loop using `continue` |
| `firstNegativeIndex(numbers)` | Stop looking the moment you find it |
| `countdown(n)` | A `while` loop, descending |
| `halvingSteps(n)` | How many integer halvings reach 1 |

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

1. What does this print, and why is the answer different with `var`?
   ```js
   for (let i = 0; i < 3; i++) setTimeout(() => console.log(i), 0);
   ```
   (This is *the* classic JS interview question. Module 02 explains it properly.)
2. Rewrite `fizzbuzz` without a single `if`. Is it better? Be honest.
