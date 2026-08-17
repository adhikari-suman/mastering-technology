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

`solution.js` is empty. Write these with explicit loops and branches — the array
methods that would shortcut most of them arrive in lesson 05.

### `fizzbuzz(n)`
Numbers `1..n` as an array of strings. Multiples of 3 → `'Fizz'`, of 5 →
`'Buzz'`, of both → `'FizzBuzz'`, otherwise the number as a string. Mind the
order: check 15 before 3 and 5.
`fizzbuzz(5)` → `['1', '2', 'Fizz', '4', 'Buzz']`

### `grade(score)`
Letter grade out of 100: 90+ `'A'`, 80+ `'B'`, 70+ `'C'`, 60+ `'D'`, else
`'F'`. Out of range (below 0 or above 100) → `null`. Write it with guard
clauses — no `else`, no nesting.

### `dayType(day)`
`'weekend'` for `'sat'`/`'sun'`, `'weekday'` for the other five, `null` for
anything else. Use a `switch`, with deliberate fall-through for the shared cases.

### `sumEven(numbers)`
Sum only the even numbers, using a loop with `continue` to skip the odd ones.
Remember that `0` and negatives are even too.
`sumEven([1, 2, 3, 4])` → `6`

### `firstNegativeIndex(numbers)`
Index of the first negative number, or `-1` if there isn't one. Stop looking the
moment you find it.
`firstNegativeIndex([1, 2, -3, -4])` → `2`

### `countdown(n)`
Count down from `n` to 1 as an array, using a `while` loop. `n < 1` → `[]`.
`countdown(3)` → `[3, 2, 1]`

### `halvingSteps(n)`
Repeatedly halve `n` with integer division until it reaches 1, and return how
many halvings that took.
`halvingSteps(8)` → `3` (8 → 4 → 2 → 1) · `halvingSteps(10)` → `3` · `halvingSteps(1)` → `0`

## Running it

From inside this folder:

```bash
node --test --watch
```

That re-runs on every save. Drop `--watch` for a single run — it exits non-zero
while anything is still red.

## Going deeper

1. What does this print, and why is the answer different with `var`?
   ```js
   for (let i = 0; i < 3; i++) setTimeout(() => console.log(i), 0);
   ```
   (This is *the* classic JS interview question. Module 02 explains it properly.)
2. Rewrite `fizzbuzz` without a single `if`. Is it better? Be honest.
