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

`solution.js` is empty. Reach for the array methods rather than hand-rolled
loops — except in `chunk`, where a loop is genuinely clearer.

**None of these may mutate their arguments.** Several tests check exactly that.

### `doubleAll(numbers)`
`doubleAll([1, 2, 3])` → `[2, 4, 6]`

### `evensOnly(numbers)`
`evensOnly([1, 2, 3, 4])` → `[2, 4]`

### `total(numbers)`
Sum with `reduce`. Don't forget the initial value — `total([])` must be `0`, not
a crash.

### `findUser(users, id)`
The user with that `id`, or `undefined` if there's no match.

### `sortByAge(users)`
A **new** array sorted by `age`, youngest first. `sort` mutates, so copy first.

### `names(users)`
`names([{ name: 'Ada' }, { name: 'Grace' }])` → `['Ada', 'Grace']`

### `merge(a, b)`
`merge([1, 2], [3])` → `[1, 2, 3]`, without touching either input.

### `firstAndRest(items)`
Split using array destructuring.
`firstAndRest([1, 2, 3])` → `{ first: 1, rest: [2, 3] }` · `firstAndRest([])` → `{ first: undefined, rest: [] }`

### `allPositive(numbers)`
Are they all positive? An empty array is vacuously `true`; `0` is not positive.

### `chunk(items, size)`
Split into chunks of at most `size`. The last chunk may be shorter.
`chunk([1, 2, 3, 4, 5], 2)` → `[[1, 2], [3, 4], [5]]`

### `tally(items)`
Count how many times each value appears.
`tally(['a', 'b', 'a'])` → `{ a: 2, b: 1 }`

## Running it

From inside this folder:

```bash
node --test --watch
```

That re-runs on every save. Drop `--watch` for a single run — it exits non-zero
while anything is still red.

## Going deeper

1. Implement `map` yourself using only `reduce`. Then `filter`.
2. What does `[1, 2, 3].map(parseInt)` return? (It is not `[1, 2, 3]`.) Why?
3. What is `new Array(3)` and why does `.map()` skip its holes?
