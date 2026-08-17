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

Two parts. **Do part 1 first, from your head, before you run anything.**

### Part 1 — `PREDICTIONS`

Export an object mapping each expression below to what you believe it evaluates
to. Copy this skeleton into `solution.js` and replace every `'TODO'`. Guessing
wrong here is the single most useful thing that can happen in this lesson, so
predict before you verify.

```js
export const PREDICTIONS = {
  'null == undefined': 'TODO',
  'null === undefined': 'TODO',
  'null == 0': 'TODO',
  'null >= 0': 'TODO',
  '0 == "0"': 'TODO',
  '0 == ""': 'TODO',
  '"" == "0"': 'TODO',
  'NaN == NaN': 'TODO',
  '[] == false': 'TODO',
  'typeof NaN': 'TODO',
  '1 + "2"': 'TODO',
  '"3" - 1': 'TODO',
  '"3" * "4"': 'TODO',
  '[] + {}': 'TODO',
  'Boolean([])': 'TODO',
  'Boolean("false")': 'TODO',
};
```

The test evaluates each expression for real and compares it to your answer, so a
wrong prediction is a red test with your name on it.

### Part 2 — the functions

### `isTruthy(value)`
True when the value is truthy. Let the language convert it — don't write a list
of comparisons.
`isTruthy('0')` → `true` · `isTruthy('')` → `false`

### `defaultTo(value, fallback)`
Return `value` unless it is `null` or `undefined`. A legitimate `0`, `''`, or
`false` must survive.
`defaultTo(0, 100)` → `0` · `defaultTo(null, 100)` → `100`

### `orDefault(value, fallback)`
Return `value` unless it is falsy in **any** way. The deliberate contrast with
`defaultTo`.
`orDefault(0, 100)` → `100` · `orDefault('hi', 'x')` → `'hi'`

### `addNumeric(a, b)`
Add two values that may have arrived as strings, from a form or a CSV. Return
`null` if either isn't numeric.
`addNumeric('10', 5)` → `15` (not `'105'`) · `addNumeric('10', 'x')` → `null`

### `compare(a, b)`
A comparator of the shape `Array.prototype.sort` expects: negative if `a` sorts
first, positive if `b` does, `0` if equal.
`[10, 1, 5].sort(compare)` → `[1, 5, 10]`

### `isNullish(value)`
True for `null` and `undefined`, false for everything else — including `0`,
`''`, and `NaN`. This is the one place `==` earns its keep.

## Running it

From inside this folder:

```bash
node --test --watch
```

That re-runs on every save. Drop `--watch` for a single run — it exits non-zero
while anything is still red.

## Going deeper

1. Why is `[] == false` true, but `[] == []` false?
2. `"b" + "a" + +"a" + "a"` produces a famous result. Work out why by hand.
3. When would `a ?? b` and `a || b` give the same answer for every input?
