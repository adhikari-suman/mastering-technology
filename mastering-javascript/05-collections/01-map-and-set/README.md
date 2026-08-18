# 01 — `Map` and `Set`

Objects and arrays were doing two jobs each. `Map` and `Set` do one job well.

## `Map` vs plain object

```js
const m = new Map();
m.set('a', 1).set(obj, 2);   // set returns the map, so it chains
m.get('a');    // 1
m.has('a');    // true
m.delete('a'); // true if it was there
m.size;        // a property, not a method
```

Four real differences:

**Any key type.** Object keys are strings and symbols only — `obj[1]` and
`obj['1']` are the same key, and an object key becomes `'[object Object]'`.
A `Map` key can be an object, a function, `NaN`, anything, compared by identity.

**Guaranteed insertion order.** Objects mostly preserve it, except
integer-like keys, which always sort numerically first:

```js
Object.keys({ b: 1, 2: 2, a: 3, 1: 4 });   // ['1', '2', 'b', 'a']
```

**No prototype surprises.** `{}.constructor` exists; `new Map().get('constructor')`
is `undefined`. A plain object used as a lookup table can collide with
`Object.prototype`. (`Object.create(null)` avoids this, and is the honest
alternative when you want an object.)

**`size`, and it's cheap.** Counting object keys means building an array first.

Use a `Map` when keys are dynamic, non-string, or numerous. Use an object for
fixed, known-at-author-time shapes — and when you need JSON, since `Map` does
not serialise.

## `Set`

A collection of unique values, insertion-ordered:

```js
const s = new Set([1, 2, 2, 3]);   // {1, 2, 3}
s.add(4); s.has(2); s.delete(1);
[...new Set(array)];               // the idiomatic dedupe
```

Membership is O(1), where `array.includes` is O(n). For repeated lookups over
anything sizeable, that's the whole reason to reach for it.

## Equality is SameValueZero

Both use identity, with one deliberate exception: `NaN` equals itself here,
unlike `===`.

```js
new Set([NaN, NaN]).size;   // 1
NaN === NaN;                // false
new Set([{}, {}]).size;     // 2 — different objects, never equal
```

## Iteration

Both are iterable, so `for...of` and spread work directly:

```js
for (const [key, value] of map) { }
map.keys(); map.values(); map.entries();
Object.fromEntries(map);    // Map -> object
new Map(Object.entries(obj));  // object -> Map
```

## What to build

| Export | What it does |
| --- | --- |
| `countWords(words)` | Frequency count in a `Map` |
| `groupBy(items, keyFn)` | Group into a `Map` of arrays |
| `unique(items)` | Dedupe, order preserved |
| `intersection` / `union` / `difference` | Set algebra |
| `mapToObject` / `objectToMap` | Convert both ways |
| `cacheWith(fn)` | Memoize with a `Map`, so object keys work |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. `new Set([0, -0]).size` — what, and why? Now try `new Map().set(0, 'a').set(-0, 'b')`.
2. Why does `JSON.stringify(new Map([['a', 1]]))` give `{}`? What would you
   write to serialise one properly?
3. Modern engines have `Set.prototype.union` and friends. Check whether your
   Node has them, and compare to what you wrote.
