# 02 — Operators and Coercion

Lesson 01 was about converting types **on purpose**. This lesson is about what
happens when JavaScript converts them **for** you, whether you asked or not.

## Truthiness

Anywhere a boolean is expected (`if`, `&&`, `!`), JS converts the value first.
There are exactly **eight** falsy values. Memorize them; everything else in the
language is truthy.

```
false   0   -0   0n   ""   null   undefined   NaN
```

That's the whole list. Notably truthy and worth burning in:

```js
Boolean([])       // true  <- empty array is truthy
Boolean({})       // true  <- empty object is truthy
Boolean("0")      // true  <- non-empty string
Boolean("false")  // true  <- non-empty string
Boolean(-1)       // true  <- only zero is falsy
```

## `==` vs `===`

`===` compares type **and** value. No conversion. `==` converts first, following
a genuinely baroque algorithm from the spec.

```js
1 === "1"   // false
1 ==  "1"   // true   — string converted to number

null == undefined  // true  — special-cased in the spec
null == 0          // false — null only ever loosely equals undefined
null >= 0          // true  — relational operators use a DIFFERENT path
```

That last pair is the clearest proof that `==` is not "compare loosely." `null`
is not equal to 0, yet it is greater-than-or-equal to 0, because `>=` numerically
converts (`null` → `0`) while `==` refuses to.

**Rule: always use `===`.** The single defensible use of `==` is
`value == null`, which is a compact test for "null or undefined."

## `+` is two operators wearing a trench coat

If either side is a string, `+` concatenates. Otherwise it adds.

```js
1 + 2       // 3
1 + "2"     // '12'
"3" - 1     // 2    <- only + is overloaded; - always converts to number
"3" * "4"   // 12
[] + {}     // '[object Object]'
```

This is why form inputs — always strings — need explicit `Number()` conversion
before arithmetic, or you'll get `"10" + 5 === "105"` in production.

## `||` vs `??`

Both pick a fallback, but they disagree on what "missing" means.

```js
value || fallback   // fallback when value is ANY of the 8 falsy values
value ?? fallback   // fallback only when value is null or undefined
```

```js
0     || 100   // 100   <- probably a bug
0     ?? 100   // 0     <- probably what you meant
""    || "N/A" // 'N/A'
""    ?? "N/A" // ''
```

If `0` or `""` are legitimate values in your domain — quantities, counts,
temperatures, empty search boxes — `||` will silently eat them. Reach for `??`
by default.

Both **short-circuit**: the right side never runs if the left side decides it.
That's why `user && user.name` works, and why the modern version — optional
chaining `user?.name` — exists.

## What to build

You write these in `solution.js`. The full spec for each — signature,
examples, edge cases — is in the JSDoc above the corresponding stub in
`exercise.js`, and `exercise.test.js` is the final authority.

First, `PREDICTIONS` — an object mapping 16 expressions to what you believe
each one evaluates to. **Fill it in from your head before you run anything.**
The test evaluates each expression for real and compares, so a wrong guess is a
red test with your name on it. That is the point of the lesson, so don't peek
at the REPL first.

Then the functions:

| Export | What it does |
| --- | --- |
| `isTruthy(value)` | Truthiness, by letting the language convert |
| `defaultTo(value, fallback)` | Falls back only on `null`/`undefined` |
| `orDefault(value, fallback)` | Falls back on any falsy value — the contrast |
| `addNumeric(a, b)` | Adds possibly-string input; `null` if not numeric |
| `compare(a, b)` | A comparator of the shape `sort` expects |
| `isNullish(value)` | `null` or `undefined`, nothing else |

## Running it

Make your working copy once, then start the watcher from the repo root:

```bash
cp exercise.js solution.js          # from inside this folder
npm run watch -- 02-operators-and-coercion
```

`exercise.js` is never edited, so that `cp` is also how you start the lesson
over from scratch. For a single run instead of a watcher, `cd` in here and run
`node --test` — it exits non-zero while anything is still red.

> Don't use `node --test --watch`. Node's watcher follows the module graph, so
> the moment `solution.js` has a syntax error it stops being watched — you fix
> the typo and nothing re-runs. `npm run watch` watches the folder instead.

## Going deeper

1. Why is `[] == false` true, but `[] == []` false?
2. `"b" + "a" + +"a" + "a"` produces a famous result. Work out why by hand.
3. When would `a ?? b` and `a || b` give the same answer for every input?
