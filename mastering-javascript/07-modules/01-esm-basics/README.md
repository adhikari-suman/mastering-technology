# 01 — ES Modules

The module system the language actually has. Everything here is about what makes
ESM different from a file you `<script>`-tagged in 2010.

## Named and default

```js
export const a = 1;
export function b() {}
export default thing;

import thing, { a, b } from './mod.js';
import { a as renamed } from './mod.js';
import * as everything from './mod.js';
```

A module can have any number of named exports and at most one default. The
default is really just a named export called `default` — `import * as ns` gives
you `ns.default`.

Prefer named exports. A default can be imported under any name, so
`import thing from './mod.js'` gives you no help when the module is renamed or
the export changes meaning, and it defeats most auto-import tooling.

## Imports are hoisted and static

```js
doThing();                      // works — the import already ran
import { doThing } from './m.js';
```

`import` declarations are hoisted and resolved **before any code runs**. That's
why the specifier must be a string literal — you cannot write
`import x from someVariable`. This is what lets bundlers and engines build the
dependency graph without executing anything, and it's why lesson 03's dynamic
`import()` exists.

## Live bindings, not copies

The one that surprises people:

```js
// counter.js
export let count = 0;
export function increment() { count += 1; }

// main.js
import { count, increment } from './counter.js';
console.log(count);   // 0
increment();
console.log(count);   // 1  ← the import updated
```

An import is a **live view** of the exporting module's binding, not a snapshot.
CommonJS `require` copies the value, so the same code there would print `0`
twice.

You still can't assign to it — imports are read-only from the importing side.

## Modules are singletons

A module's body runs **once**, on first import, no matter how many files import
it. Every importer shares one instance. That makes top-level state global state,
with all that implies.

## Always strict, always deferred

Module code is strict mode automatically, `this` at the top level is `undefined`
(not `globalThis`), and in browsers `<script type="module">` is deferred by
default.

## Extensions are required

In Node's ESM, `./utils` does not resolve. Write `./utils.js`. Directory imports
and extension guessing were CommonJS conveniences that ESM deliberately dropped.

## What to build

| Export | What it does |
| --- | --- |
| `readCount()` / `bumpCount()` | Prove live bindings |
| `namespaceKeys(ns)` | What a namespace object contains |
| `defaultOf(ns)` | Reach the default through a namespace |
| `reexported` | Re-export from another module |
| `isModuleNamespace(value)` | Detect a namespace object |
| `moduleThis` | What `this` is at module top level |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. Import `count`, then try `count = 5`. What's the error, and at what stage
   does it happen?
2. `import * as ns` — is `ns` frozen? Try adding a property.
3. Two modules both import a third. Add a `console.log` to the third and count
   how many times it prints.
