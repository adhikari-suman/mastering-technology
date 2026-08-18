# 03 — Tagged Templates

A function call with template-literal syntax, where you receive the static
strings and the interpolated values **separately** — before they're joined.

```js
tag`Hello ${name}, you are ${age}`;
```

calls:

```js
tag(['Hello ', ', you are ', ''], name, age);
```

## The shape

The first argument is an array of the literal chunks; the rest are the
interpolated values. There is **always one more string than value** — the array
begins and ends with a string, even when empty:

```js
tag`${a}`;        // strings: ['', ''], values: [a]
tag`x`;           // strings: ['x'],    values: []
```

That invariant is what makes the reassembly loop straightforward.

The strings array also carries a `.raw` property with escapes uninterpreted —
`\n` as two characters rather than a newline. That's how `String.raw` works.

## Why it matters: values are identifiable

Because you get values separately, you can treat them differently from the
literal text. That's the whole basis for safe interpolation:

```js
sql`SELECT * FROM users WHERE id = ${userId}`;
```

The tag knows `userId` came from a hole, so it can parameterise it rather than
splicing it in. A plain template literal has already lost that distinction by
the time your code sees the string — which is why string concatenation and SQL
injection are the same sentence.

The same idea drives `html` escaping tags, CSS-in-JS, i18n extraction, and
`gql`.

## The default behaviour

An identity tag reproduces exactly what the literal would have produced:

```js
function identity(strings, ...values) {
  return strings.reduce((out, s, i) => out + s + (values[i] ?? ''), '');
}
```

Note `values[i] ?? ''` — there's no value after the last string.

## `String.raw`

The built-in tag returning the raw strings. It's how you write a Windows path or
a regex without doubling every backslash:

```js
String.raw`C:\new\table`;   // 'C:\new\table' — backslash-n, not a newline
```

## What to build

| Export | What it does |
| --- | --- |
| `identity` | Reassemble exactly |
| `upper` | Uppercase only the interpolated values |
| `escapeHtml` | Escape values, never the literal text |
| `sql` | Return `{ text, values }` with placeholders |
| `oneLine` | Collapse whitespace |
| `raw` | Reimplement `String.raw` |
| `partsOf` | Expose the raw call shape |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. Tag a literal with a value that's an object. What does the default
   stringification give you, and how would you handle it better?
2. `escapeHtml` escapes values but not literals. Construct the injection that
   would happen if it escaped both, or neither.
3. The strings array is frozen and cached per call site. Prove the caching:
   call the same tagged literal twice in a loop and compare identity.
