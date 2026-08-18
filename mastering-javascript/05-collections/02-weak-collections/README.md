# 02 — `WeakMap` and `WeakSet`

Same idea as `Map` and `Set`, with one change that alters everything: they don't
keep their keys alive.

## The problem they solve

A normal `Map` holds a **strong** reference to every key. Use one as a cache
keyed by object and it becomes a memory leak:

```js
const cache = new Map();
function process(node) {
  if (!cache.has(node)) cache.set(node, expensive(node));
  return cache.get(node);
}
```

Delete `node` from the DOM, drop every other reference to it — and the cache is
still holding it. The map is the only thing keeping it alive, and the map lives
forever. Nothing will ever collect it.

`WeakMap` holds keys **weakly**. When nothing else references a key, the entry
becomes eligible for garbage collection automatically.

```js
const cache = new WeakMap();   // same code, no leak
```

## What you give up

The restrictions all follow from one fact: entries can vanish at any moment, so
anything that would let you *observe* them vanishing is forbidden.

- **Keys must be objects** (or symbols). No strings or numbers — primitives have
  no identity to be collected.
- **Not iterable.** No `for...of`, no `.keys()`, no spread.
- **No `.size`.** It would change without you doing anything.
- **No `.clear()`.**

You get exactly four methods: `get`, `set`, `has`, `delete`. `WeakSet` gets
`add`, `has`, `delete`.

If you need to enumerate, you need a `Map`. That's the trade.

## The two real uses

**Private data for objects you don't own:**

```js
const privates = new WeakMap();
class Thing {
  constructor(secret) { privates.set(this, { secret }); }
  reveal() { return privates.get(this).secret; }
}
```

This was *the* private-field pattern before `#private` existed. You'll still see
it, and it works on objects you didn't construct.

**Metadata and caches keyed by object** — the case above. Tagging a DOM node,
memoizing per-instance, marking objects as already-visited during a traversal.

## `WeakRef` and `FinalizationRegistry`

The direct forms: `new WeakRef(obj).deref()` returns the object or `undefined`
once collected. `FinalizationRegistry` fires a callback after collection.

Both are genuinely hard to use correctly — collection timing is unspecified, so
anything you build on them is non-deterministic. The MDN docs open by advising
against them. Know they exist; reach for `WeakMap` instead.

## What to build

| Export | What it does |
| --- | --- |
| `makePrivateStore()` | Per-object private data via `WeakMap` |
| `Tagged` | A class using a module-level `WeakMap` for its state |
| `weakMemoize(fn)` | Memoize on an object argument, without leaking |
| `visitOnce(fn)` | Traverse a graph, skipping already-seen nodes |
| `canBeWeakKey(value)` | Which values are legal `WeakMap` keys |
| `deepCountUnique(obj)` | Count distinct objects in a cyclic structure |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. Why is `new WeakMap().set('key', 1)` a `TypeError`, but symbols are allowed
   as of ES2023? What makes a symbol different from a string here?
2. You can't test that a `WeakMap` released a key — collection isn't
   observable. Given that, how would you ever *prove* your cache doesn't leak?
3. Compare `WeakMap`-based privacy to `#private` from Part 03. When would you
   still choose the `WeakMap`?
