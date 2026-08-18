# 06 — Symbols

The seventh primitive, and the only one whose whole purpose is to be unique.

```js
const a = Symbol('id');
const b = Symbol('id');
a === b;        // false — the string is only a label for debugging
a.description;  // 'id'
```

Two uses: collision-proof keys, and hooking into language behaviour.

## Symbols as keys

A symbol key can't collide with a string key, or with anyone else's symbol:

```js
const ID = Symbol('id');
const user = { name: 'Ada', [ID]: 123 };

user[ID];                       // 123
Object.keys(user);              // ['name']       — symbols skipped
JSON.stringify(user);           // '{"name":"Ada"}'
Object.getOwnPropertySymbols(user);   // [Symbol(id)] — the only way to see them
```

That's how you attach metadata to an object you don't own without any chance of
stepping on its properties. It's not *security* — `getOwnPropertySymbols` finds
them — but it is genuine isolation.

`Symbol.for('key')` is the opposite: a **global registry**, where the same
string always returns the same symbol, even across modules.

```js
Symbol.for('app') === Symbol.for('app');   // true
Symbol('app')     === Symbol('app');       // false
```

## Well-known symbols

The language keeps a set of symbols it looks for on your objects. Define one and
you change how built-in syntax treats your value.

**`Symbol.iterator`** — makes an object work with `for...of`, spread, and
destructuring. This is *the* iteration protocol, and Part 05 builds on it:

```js
const range = {
  from: 1, to: 3,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return { next: () => (current <= last ? { value: current++, done: false } : { done: true }) };
  },
};
[...range];   // [1, 2, 3]
```

**`Symbol.toPrimitive`** — decides what your object becomes in `+`, `==`, and
template strings. Part 01's coercion lesson, now under your control:

```js
[Symbol.toPrimitive](hint) {   // hint is 'number' | 'string' | 'default'
  return hint === 'number' ? this.value : this.label;
}
```

**`Symbol.toStringTag`** — the word inside `[object ___]`:

```js
get [Symbol.toStringTag]() { return 'Money'; }
Object.prototype.toString.call(money);   // '[object Money]'
```

**`Symbol.hasInstance`** — overrides `instanceof` for your type.

## What to build

| Export | What it does |
| --- | --- |
| `attachMetadata(obj, data)` | Hide data under a symbol key |
| `readMetadata(obj)` | Read it back |
| `symbolKeysOf(obj)` | The symbol keys on an object |
| `Range` | A class you can `for...of` and spread |
| `Money` | `Symbol.toPrimitive` and `Symbol.toStringTag` |
| `Even` | `Symbol.hasInstance`, so `4 instanceof Even` is true |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. Symbol keys survive `structuredClone`? Spread? `Object.assign`? Test all
   three — the answers are not the same.
2. Why does `Symbol()` throw when you try `'' + sym` but not `String(sym)`?
3. What happens to a `Symbol.toPrimitive` object inside `==`? Trace it against
   Part 01's coercion rules.
