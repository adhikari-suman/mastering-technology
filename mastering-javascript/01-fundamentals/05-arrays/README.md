# 05 — Arrays

An array is an ordered, zero-indexed, resizable list. It's also an object with
numeric keys, which is why `typeof []` is `'object'` and why `Array.isArray()`
exists.

## The methods that matter

Split them into two piles. **This distinction is the lesson.**

### Returns a new array (safe, chainable)

```js
[1, 2, 3].map((n) => n * 2)          // [2, 4, 6]      same length, transformed
[1, 2, 3].filter((n) => n > 1)       // [2, 3]         subset, same values
[1, 2, 3].reduce((acc, n) => acc + n, 0)  // 6         collapse to one value
[1, 2, 3].slice(1)                   // [2, 3]
[1, 2, 3].concat([4])                // [1, 2, 3, 4]
[[1], [2]].flat()                    // [1, 2]
```

### Mutates in place (dangerous in shared code)

```js
arr.push(x)      arr.pop()      arr.shift()     arr.unshift(x)
arr.sort()       arr.reverse()  arr.splice(...)
```

`sort` and `reverse` mutating is the one that bites everyone, because they also
*return* the array, so the bug looks like working code:

```js
const sorted = users.sort(byAge);   // `users` is now reordered too. Same array.
```

Copy first — `[...users].sort(byAge)` — or use the modern non-mutating twins:
`toSorted()`, `toReversed()`, `toSpliced()`, `with()`.

### Searching

```js
[1, 2, 3].find((n) => n > 1)      // 2          the element, or undefined
[1, 2, 3].findIndex((n) => n > 1) // 1          the index, or -1
[1, 2, 3].includes(2)             // true
[1, 2, 3].some((n) => n > 2)      // true       "any?"
[1, 2, 3].every((n) => n > 0)     // true       "all?"
```

## `sort` sorts strings by default

```js
[10, 9, 1].sort()                  // [1, 10, 9]   <- compared as text!
[10, 9, 1].sort((a, b) => a - b)   // [1, 9, 10]
```

Always pass a comparator for numbers. It returns negative / zero / positive —
the `compare` function you wrote in lesson 02.

## Spread and destructuring

```js
const merged = [...a, ...b];           // copy and combine
const [first, ...rest] = [1, 2, 3];    // first = 1, rest = [2, 3]
const [, second] = [1, 2];             // skip a position with a bare comma
const [x = 0] = [];                    // default for a missing element
```

Spread copies **one level deep**. Nested objects inside the array are still
shared between the copy and the original.

## Reduce, demystified

`reduce` is the general case; `map` and `filter` are special cases of it. It
takes an accumulator and each element, and returns the next accumulator:

```js
[1, 2, 3].reduce((acc, n) => acc + n, 0);
// acc=0 n=1 -> 1
// acc=1 n=2 -> 3
// acc=3 n=3 -> 6
```

**Always pass the initial value** (that trailing `0`). Without it, reduce uses
the first element as the seed and throws on an empty array.

## What to build

You write these in `solution.js`. The full spec for each — signature,
examples, edge cases — is in the JSDoc above the corresponding stub in
`exercise.js`, and `exercise.test.js` is the final authority.

Reach for the array methods rather than hand-rolled loops — except in `chunk`,
where a loop is genuinely clearer. **None of these may mutate their arguments**;
several tests check exactly that.

| Export | What it does |
| --- | --- |
| `doubleAll(numbers)` | `map` |
| `evensOnly(numbers)` | `filter` |
| `total(numbers)` | `reduce` — and `total([])` must be `0`, not a crash |
| `findUser(users, id)` | `find`, or `undefined` |
| `sortByAge(users)` | A **new** sorted array; `sort` mutates |
| `names(users)` | The names, as strings |
| `merge(a, b)` | Spread, touching neither input |
| `firstAndRest(items)` | Array destructuring into `{ first, rest }` |
| `allPositive(numbers)` | `every`; empty is vacuously true |
| `chunk(items, size)` | Fixed-size groups, last one possibly shorter |
| `tally(items)` | Count occurrences into an object |

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

1. Implement `map` yourself using only `reduce`. Then `filter`.
2. What does `[1, 2, 3].map(parseInt)` return? (It is not `[1, 2, 3]`.) Why?
3. What is `new Array(3)` and why does `.map()` skip its holes?
