# 01 — `Proxy`

A `Proxy` wraps an object and lets you intercept the fundamental operations on
it — reading, writing, deleting, checking existence. It's the closest thing
JavaScript has to operator overloading for property access.

```js
const proxy = new Proxy(target, handler);
```

`target` is the real object. `handler` holds **traps** — functions called
instead of the default behaviour. Omit a trap and the operation passes through
untouched.

## The traps you'll actually use

| Trap | Intercepts |
| --- | --- |
| `get(target, prop, receiver)` | `obj.x`, `obj[x]` |
| `set(target, prop, value, receiver)` | `obj.x = 1` |
| `has(target, prop)` | `'x' in obj` |
| `deleteProperty(target, prop)` | `delete obj.x` |
| `ownKeys(target)` | `Object.keys`, `for...in`, spread |
| `apply(target, thisArg, args)` | calling a proxied function |
| `construct(target, args)` | `new` on a proxied constructor |

```js
const withDefault = new Proxy({}, {
  get: (target, prop) => (prop in target ? target[prop] : 'default'),
});
```

## What it's for

**Defaults and negative indices** — behaviour a plain object can't express.

**Validation on write** — reject bad values at assignment rather than checking
everywhere:

```js
set(target, prop, value) {
  if (prop === 'age' && typeof value !== 'number') throw new TypeError('age must be a number');
  target[prop] = value;
  return true;   // ← required
}
```

**Observation** — logging every access, or tracking which properties were read.
That last one is how Vue's reactivity and most modern signal libraries work, and
it's this Part's capstone.

**Lazy loading** — build the expensive thing on first access.

## The rules that catch you out

**`set` and `deleteProperty` must return a boolean.** Returning `false` (or
nothing, in strict mode) throws a `TypeError` at the assignment site. Forgetting
`return true` is the single most common Proxy bug.

**`ownKeys` must be consistent with the target.** If the target has a
non-configurable property, `ownKeys` must include it, or you get a `TypeError`.
These are the *invariants* — the engine enforces that a proxy can't lie about
things code is entitled to rely on. Lesson 02 covers them properly.

**`this` inside a method is the proxy, not the target** — which is what makes
nested interception work, and what makes `#private` fields break:

```js
class C { #x = 1; getX() { return this.#x; } }
new Proxy(new C(), {}).getX();   // TypeError — the proxy has no #x
```

## The cost

Every intercepted operation goes through a function call, and proxied objects
opt out of most engine optimisations. Fine for config objects and reactivity
roots; not for a hot loop over a million elements.

## What to build

| Export | What it does |
| --- | --- |
| `withDefault(target, fallback)` | Missing keys return a fallback |
| `readOnly(target)` | Writes and deletes throw |
| `validated(target, validators)` | Per-property validation on write |
| `negativeIndex(array)` | `arr[-1]` is the last element |
| `observed(target, onGet)` | Record every property read |
| `countingProxy(target)` | Tally operations by trap |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. Proxy a class instance with `#private` fields and call a method. Why the
   `TypeError`, and what does that say about where `#` fields live?
2. Write a `get` trap that returns a proxy for object values. You've made deep
   observation — what does it cost?
3. `Proxy.revocable` — when would you want to turn a proxy off?
