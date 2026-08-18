# 02 — CommonJS and Interop

Node had a module system for thirteen years before ESM arrived. Both still run,
often in the same project, and the seams show.

## The two systems

```js
// CommonJS
const fs = require('node:fs');
module.exports = { a, b };
exports.c = c;

// ESM
import fs from 'node:fs';
export { a, b };
```

| | CommonJS | ESM |
| --- | --- | --- |
| Loading | Synchronous, at the `require` call | Asynchronous, resolved before execution |
| Bindings | **Copies** of values | **Live** views |
| Analysis | Runtime — `require(name)` is legal | Static — specifiers must be literals |
| `this` at top level | `module.exports` | `undefined` |
| Strict mode | Opt in | Always |
| Extensions | Optional, directories resolve | Required |

The copy-versus-live distinction is the one that bites. Reassign an exported
variable in CJS and importers never see it; in ESM they do.

## Which one a file is

Node decides per file:

- `.mjs` → ESM. `.cjs` → CommonJS.
- `.js` → whatever the nearest `package.json` `"type"` says. `"module"` means
  ESM; absent or `"commonjs"` means CommonJS.

This repo sets `"type": "module"`, which is why every `.js` here is ESM and the
fixtures below are `.cjs`.

## Interop, in one direction

**ESM can import CommonJS.** `module.exports` arrives as the default:

```js
import legacy from './legacy.cjs';        // module.exports
import { name } from './legacy.cjs';      // sometimes works — see below
```

Node statically analyses simple CJS files to guess named exports. It's a
heuristic: computed or conditional assignment defeats it, and then only the
default works.

**CommonJS cannot `require` ESM.** It's synchronous and ESM isn't. From CJS you
must use dynamic `import()`, which returns a promise. (Node 22+ can `require()`
a fully-synchronous ESM graph, but it's newer than most codebases.)

## `createRequire`

To load a CJS module from ESM by path, when you want `require` semantics:

```js
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const legacy = require('./legacy.cjs');
```

## What ESM lacks, and the replacements

`__dirname`, `__filename` and `require` don't exist in ESM:

```js
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

`import.meta.url` is the module's own URL — the ESM replacement for both, and
the basis for resolving paths relative to a file.

## What to build

| Export | What it does |
| --- | --- |
| `loadLegacy()` | Load a `.cjs` module from ESM |
| `loadLegacyDefault()` | A single-function `module.exports` |
| `cjsCopiesValues()` | Prove CJS state is shared per module instance |
| `moduleDir()` / `moduleFile()` | `__dirname` / `__filename` in ESM |
| `resolveRelative(path)` | Resolve against this module |
| `moduleTypeOf(filename)` | Which system a filename implies |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. `require` a `.cjs` twice. Is the module body evaluated twice? Compare that to
   ESM's singleton rule.
2. Take a `.cjs` that assigns `module.exports` conditionally. Can Node still
   detect named exports? Try it.
3. Why can't CommonJS `require` an ESM module? Give the answer in terms of
   *when* each system resolves its graph.
