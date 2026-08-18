# 05 — JSON

Two functions, and a surprising number of ways to lose data.

## What `stringify` silently drops

```js
JSON.stringify({
  fn: () => {},        // gone
  und: undefined,      // gone
  sym: Symbol('s'),    // gone
  nan: NaN,            // becomes null
  inf: Infinity,       // becomes null
  date: new Date(),    // becomes an ISO string, one-way
  map: new Map([['a', 1]]),   // becomes {}
  set: new Set([1]),          // becomes {}
  big: 10n,            // THROWS — TypeError
});
// '{"nan":null,"inf":null,"date":"2026-...","map":{},"set":{}}'
```

Only one of those is an error. The rest are silent, which is worse — the round
trip appears to work and quietly changes your data.

In an **array**, the dropped types become `null` rather than vanishing, because
an array can't have holes in JSON: `JSON.stringify([undefined])` is `'[null]'`.

`Map` and `Set` becoming `{}` catches everyone. They have no own enumerable
properties, so there's nothing to serialise. Convert first.

## `toJSON`

Any object with a `toJSON()` method controls its own serialisation — which is
exactly how `Date` produces an ISO string:

```js
class Money {
  toJSON() { return { amount: this.amount, currency: this.currency }; }
}
```

## The replacer and reviver

`stringify(value, replacer, space)` — the replacer visits every key/value pair
and can transform or drop:

```js
JSON.stringify(obj, (key, value) => (key === 'password' ? undefined : value));
```

`parse(text, reviver)` does the same on the way back, which is how you restore
`Date`s and other types the format can't carry.

Both are called with `this` bound to the containing object, and the first call
has an empty-string key for the root.

`space` pretty-prints: `JSON.stringify(obj, null, 2)`.

**A reviver returning `undefined` deletes the key.** That makes it impossible to
restore an `undefined` value with a reviver alone — you have to parse first,
then walk the result assigning explicitly. Worth knowing before you design an
encoding that has to survive `undefined`.

## Two traps worth naming

**Key order is insertion order**, so two objects that are `deepEqual` can
stringify differently. Never use `JSON.stringify` to compare objects, and be
careful using it as a cache key.

**Circular references throw.** `structuredClone` handles them; JSON cannot.

## `structuredClone`

The built-in deep clone. It handles `Map`, `Set`, `Date`, `RegExp`, typed
arrays, and cycles. It does **not** handle functions, DOM nodes, or class
identity — a cloned instance comes back as a plain object.

For deep-copying data, prefer it to `JSON.parse(JSON.stringify(x))`, which is
the old trick and loses everything above.

## What to build

| Export | What it does |
| --- | --- |
| `safeParse(text)` | Parse without throwing — `[error, value]` |
| `stringifyStable(value)` | Key-sorted output, so equal objects match |
| `redact(obj, keys)` | Drop sensitive keys via a replacer |
| `reviveDates(text)` | Turn ISO strings back into `Date`s |
| `serialise` / `deserialise` | Survive `Map`, `Set`, `undefined` |
| `deepClone(value)` | Cycles and `Map`/`Set` intact |
| `losesData(value)` | Does a JSON round trip change it? |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. `JSON.stringify({ a: undefined })` versus `JSON.stringify([undefined])`.
   Explain the difference from the format's constraints.
2. Write a `toJSON` on a class, then `structuredClone` it. Is `toJSON` used?
3. `JSON.parse('{"__proto__": {"admin": true}}')` — is that a prototype
   pollution vector? Test what actually lands on the object.
