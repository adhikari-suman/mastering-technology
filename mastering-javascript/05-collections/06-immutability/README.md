# 06 — Immutability

Not a language feature — a discipline, supported by a few tools. The payoff is
that a value you hold can't change under you, which removes an entire category
of bug.

## Why bother

```js
function addTag(user, tag) {
  user.tags.push(tag);    // mutates the caller's object
  return user;
}
```

Every holder of that `user` just had it changed, with no notification. In a UI
framework this is why "the state changed but nothing re-rendered" — the object
is the same reference, so equality checks see nothing new.

The immutable version returns a new object and leaves the input alone:

```js
const addTag = (user, tag) => ({ ...user, tags: [...user.tags, tag] });
```

Now `prev !== next` is a reliable "something changed" signal, which is exactly
what `React.memo`, `useMemo` and Redux depend on.

## Non-mutating array methods

The originals mutate. ES2023 added copying twins, and they're in Node 20+:

| Mutates | Copies |
| --- | --- |
| `sort()` | `toSorted()` |
| `reverse()` | `toReversed()` |
| `splice()` | `toSpliced()` |
| `arr[i] = v` | `with(i, v)` |
| `push`/`pop`/`shift`/`unshift` | `[...arr, v]` and friends |

## Updating nested data

Every level you change must be recreated; everything else is shared:

```js
const next = {
  ...state,
  user: { ...state.user, address: { ...state.user.address, city: 'Paris' } },
};
```

`next.user.address` is new. `next.settings` is the *same object* as
`state.settings` — untouched branches are shared, not copied. That's what makes
this cheap: you copy the path you changed, not the tree.

The verbosity is why Immer exists. Worth writing by hand first so you know what
it's doing.

## Freezing

`Object.freeze` makes mutation fail — silently outside strict mode, with a
`TypeError` inside it. It's shallow, so a deep freeze means recursing (you wrote
one in Part 03).

Freezing in development and skipping it in production is a common pattern: you
catch accidental mutation while testing without paying for it in production.

## Structural sharing

The reason immutable updates aren't as expensive as they look. Given a big tree
and a change to one leaf, you allocate one new object per level on that path —
typically a handful — and reuse everything else. That's what libraries like
Immutable.js formalise.

## What to build

| Export | What it does |
| --- | --- |
| `setIn(obj, path, value)` | Non-mutating nested set |
| `updateIn(obj, path, fn)` | Same, computed from the old value |
| `removeIn(obj, path)` | Non-mutating nested delete |
| `push` / `insertAt` / `removeAt` / `replaceAt` | Non-mutating array ops |
| `sortBy(items, keyFn)` | Sorted copy |
| `sharesBranch(a, b, path)` | Prove structural sharing happened |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. After `setIn(state, ['a', 'b'], 1)`, which branches of `state` are the same
   reference in the result? Write it out before checking.
2. `Object.freeze` an array and `push`. What happens in a module versus in the
   REPL? Explain the difference.
3. Immutable updates allocate. When does that actually cost you, and how would
   you measure it rather than guess?
