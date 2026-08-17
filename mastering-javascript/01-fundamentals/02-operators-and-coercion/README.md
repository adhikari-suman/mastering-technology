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

## Your task

`exercise.js` starts with a `PREDICTIONS` object. **Fill it in before running
anything.** Write down what you believe each expression evaluates to. The test
compares your predictions against reality, so a wrong answer is a red test with
your name on it — which is exactly the point. Then implement the functions below.

## Going deeper

1. Why is `[] == false` true, but `[] == []` false?
2. `"b" + "a" + +"a" + "a"` produces a famous result. Work out why by hand.
3. When would `a ?? b` and `a || b` give the same answer for every input?
