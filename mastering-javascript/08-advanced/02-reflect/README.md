# 02 — `Reflect`

A plain object holding one function per fundamental operation — exactly the set
`Proxy` can trap. It is the other half of the same design.

```js
Reflect.get(obj, 'x');
Reflect.set(obj, 'x', 1);
Reflect.has(obj, 'x');
Reflect.deleteProperty(obj, 'x');
Reflect.ownKeys(obj);
Reflect.getPrototypeOf(obj);
Reflect.defineProperty(obj, 'x', desc);
Reflect.apply(fn, thisArg, args);
Reflect.construct(Ctor, args);
```

Every `Reflect` method corresponds to a `Proxy` trap of the same name and
signature. That's not a coincidence — it's the point.

## Why not just use the operators

**It returns booleans instead of throwing.** `Object.defineProperty` throws on
failure; `Reflect.defineProperty` returns `false`. When you're *asking* whether
something worked, a boolean beats a `try/catch`:

```js
if (!Reflect.defineProperty(obj, 'x', desc)) handleFailure();
```

**It's the correct default trap behaviour.** A trap that wants to observe and
then behave normally should forward through `Reflect`:

```js
new Proxy(target, {
  get(target, prop, receiver) {
    log(prop);
    return Reflect.get(target, prop, receiver);   // ← not target[prop]
  },
});
```

The signatures match exactly, so forwarding is always `Reflect[trap](...arguments)`.

## `receiver`, and why `target[prop]` is wrong

This is the substantive reason `Reflect` exists. Consider a getter:

```js
const target = {
  _name: 'target',
  get name() { return this._name; },
};
```

With `return target[prop]`, the getter runs with `this === target`. With
`Reflect.get(target, prop, receiver)`, it runs with `this === receiver` — the
proxy. So any further property access inside the getter goes back *through* the
proxy and gets intercepted too.

Skip the `receiver` and your interception silently stops at the first getter.
For a reactivity system, that's the difference between tracking nested reads and
missing them.

## Invariants

The engine enforces that a proxy cannot lie about certain things. If the target
has a non-configurable, non-writable property, a `get` trap **must** return that
exact value, or you get a `TypeError`. Likewise `ownKeys` must report every
non-configurable own key.

Forwarding through `Reflect` satisfies the invariants automatically. Hand-rolled
traps are where you accidentally violate them.

## `Reflect.ownKeys`

The only single call returning **every** own key — string and symbol,
enumerable and not. `Object.keys` gives enumerable strings;
`getOwnPropertyNames` gives all strings; `getOwnPropertySymbols` gives symbols.
`Reflect.ownKeys` is all of them.

## What to build

| Export | What it does |
| --- | --- |
| `safeDefine(obj, key, desc)` | Boolean instead of throwing |
| `allKeys(obj)` | Every own key, both kinds |
| `forwardingProxy(target, log)` | Observe, then forward correctly |
| `brokenProxy(target, log)` | The `target[prop]` version, so you see it fail |
| `receiverMatters(target)` | Prove the difference |
| `construct(Ctor, args)` | `new` via `Reflect` |
| `describeOperations()` | Which `Reflect` methods pair with which traps |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. Freeze an object, proxy it with a `get` trap returning a constant, and read
   the frozen property. What stops you, and why is that rule there?
2. `Reflect.ownKeys` on a class instance with `#private` fields — are they
   listed? What does that tell you?
3. Rewrite lesson 01's `countingProxy` to forward via `Reflect`. Does any
   behaviour change?
