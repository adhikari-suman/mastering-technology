# 05 — Property Descriptors

Every property is really a small record of settings. `obj.x = 1` is a shorthand
that fills that record in with defaults. Read one and the object model stops
having any hidden parts.

```js
Object.getOwnPropertyDescriptor({ x: 1 }, 'x');
// { value: 1, writable: true, enumerable: true, configurable: true }
```

## The four attributes

| Attribute | Means |
| --- | --- |
| `value` | What's stored |
| `writable` | Can it be reassigned? |
| `enumerable` | Does it show up in `Object.keys`, `for...in`, spread, `JSON.stringify`? |
| `configurable` | Can the descriptor itself be changed, or the property deleted? |

**Assignment defaults everything to `true`. `Object.defineProperty` defaults
everything to `false`.** That asymmetry is the single most surprising thing
here:

```js
const o = {};
Object.defineProperty(o, 'x', { value: 1 });
o.x;                 // 1
o.x = 2; o.x;        // still 1 — silently, unless in strict mode
Object.keys(o);      // []  — invisible
delete o.x;          // false — refused
```

In a module (always strict), the silent failures become `TypeError`s. Outside
strict mode they're silent, which is worse.

## Accessor properties

A property has *either* `value`/`writable` *or* `get`/`set`. Never both —
trying to specify both is a `TypeError`.

```js
Object.defineProperty(obj, 'full', {
  get() { return `${this.first} ${this.last}`; },
  enumerable: true,
});
```

This is what `get`/`set` in a class body compile to. A getter-only property
throws on assignment in strict mode.

## Locking objects down, weakly

```js
Object.preventExtensions(obj);  // no new properties
Object.seal(obj);               // + no deletions (configurable: false)
Object.freeze(obj);             // + no writes      (writable: false)
```

All three are **shallow**. `Object.freeze` on an object holding an array does
nothing to that array:

```js
const config = Object.freeze({ tags: [] });
config.tags.push('still works');   // no error, no protection
```

Deep-freezing means recursing yourself, which is your last exercise.

## Why `enumerable: false` matters

It's how the language hides its own plumbing. `Object.prototype.toString`
exists on every object but never appears in `Object.keys` or `JSON.stringify`
— because it's non-enumerable. When you added `myCall` to `Function.prototype`
in Part 02, that's the rule you were respecting.

## What to build

| Export | What it does |
| --- | --- |
| `describe(obj, key)` | An own descriptor, or null |
| `defineConstant(obj, key, value)` | Visible, but unwritable and undeletable |
| `defineHidden(obj, key, value)` | Normal to use, invisible to enumeration |
| `defineComputed(obj, key, getter)` | An enumerable accessor |
| `enumerableKeys(obj)` vs `allOwnKeys(obj)` | Prove the difference |
| `deepFreeze(obj)` | Freeze all the way down |
| `isDeeplyFrozen(obj)` | Verify it |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. Freeze an object, then try to add a property in strict and sloppy mode.
   Which one tells you it failed?
2. Can you make a property `writable: true` but `configurable: false`? What can
   you still change afterwards, and what's locked forever?
3. What does `Object.defineProperty` do on an array's `length`? Why is that
   property so strange?
