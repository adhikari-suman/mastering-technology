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

## Your task

Implement everything in `exercise.js`.

```bash
node --test --watch .
```

## Going deeper

1. What does this print, and why is the answer different with `var`?
   ```js
   for (let i = 0; i < 3; i++) setTimeout(() => console.log(i), 0);
   ```
   (This is *the* classic JS interview question. Module 02 explains it properly.)
2. Rewrite `fizzbuzz` without a single `if`. Is it better? Be honest.
