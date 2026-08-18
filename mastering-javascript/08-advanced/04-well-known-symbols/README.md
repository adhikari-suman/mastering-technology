# 04 — Well-Known Symbols

Part 03 introduced `Symbol.iterator` and `Symbol.toPrimitive`. These are the
rest of the hooks — the places the language asks *your* object how it wants
built-in syntax to behave.

## `Symbol.toPrimitive`

Called when an object must become a primitive, with a **hint**:

| Hint | Triggered by |
| --- | --- |
| `'number'` | `+obj`, `obj * 2`, `Math.max(obj)`, `<` |
| `'string'` | `` `${obj}` ``, `String(obj)`, a property key |
| `'default'` | `obj + x`, `obj == x` |

`'default'` exists because `+` and `==` genuinely don't know which they want.
`Date` treats default as string; almost everything else treats it as number.

Without this symbol, JavaScript falls back to `valueOf` then `toString` (or the
reverse for a string hint) — the legacy path.

## `Symbol.toStringTag`

The word in `[object ___]`:

```js
Object.prototype.toString.call([]);        // '[object Array]'
Object.prototype.toString.call(new Map()); // '[object Map]'
```

That call is the classic reliable type check, because it can't be fooled by a
changed prototype the way `instanceof` can.

## `Symbol.hasInstance`

Overrides `instanceof` entirely:

```js
class Even {
  static [Symbol.hasInstance](n) { return n % 2 === 0; }
}
4 instanceof Even;   // true
```

Useful for structural type checks; abusable for confusion. `instanceof` normally
promises "somewhere in the prototype chain", and this breaks that promise, so
use it where the reading is obvious.

## `Symbol.iterator` and `Symbol.asyncIterator`

`for...of` and `for await...of` respectively. Part 05's protocols.

## `Symbol.species`

Which constructor derived objects use. Subclass `Array` and `map` returns your
subclass — unless `species` says otherwise:

```js
class MyArray extends Array {
  static get [Symbol.species]() { return Array; }   // map gives a plain Array
}
```

## The pattern

Every one of these is the language saying "if you want a say in this, here's
where." Together they're the whole extension surface for making a custom type
feel built in — and the reason a well-written class can behave exactly like
`Map` or `Array` at the syntax level.

## What to build

| Export | What it does |
| --- | --- |
| `Duration` | All three hints, plus a tag |
| `Collection` | Iterable, async iterable, tagged |
| `PositiveNumber` | Structural `instanceof` |
| `PlainArray` | `Symbol.species` returning `Array` |
| `typeTagOf(value)` | The reliable type check |
| `hintUsed(obj, operation)` | Which hint an operation triggers |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. Implement `valueOf` and `toString` but not `toPrimitive`. Which is used for
   each hint, and what's the fallback order?
2. Why does `Date` treat the default hint as a string when everything else
   treats it as a number? What breaks if you flip it?
3. `Symbol.species` — construct a case where not setting it causes a real bug in
   an `Array` subclass.
