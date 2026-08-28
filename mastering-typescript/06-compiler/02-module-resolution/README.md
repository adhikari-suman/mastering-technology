# 02 — Module resolution

The compiler has to answer one question for every import: which file is this,
and what kind of module is it? Two settings decide, and they model different
worlds.

## `nodenext` versus `bundler`

| | `nodenext` | `bundler` |
| --- | --- | --- |
| Relative extension | **required** (`'./a.js'`) | optional (`'./a'`) |
| `package.json` `exports` | respected | respected |
| ESM vs CJS distinction | real, and enforced | ignored |
| `import type` needed for cycles | often | rarely |

`nodenext` is what Node does. `bundler` is what Vite, esbuild and webpack do.
Pick the one matching what actually loads your code — this project uses
`nodenext`, because Node loads it.

## Why the extension is required, and why it's `.js`

Under `nodenext`, `import './greeter'` is an error: Node does not do extension
guessing for ESM. You must write the extension that will exist **at runtime**,
which for a compiled project is `.js` even though the file on disk is `.ts`.

This project sidesteps that with `allowImportingTsExtensions`, which lets you
write `'./greeter.ts'` — legal only because `noEmit` is on, so nothing is
rewritten and Node loads the `.ts` directly. In a project that emits, you write
`.js` and live with the strangeness.

## File extensions decide the format

| Extension | Format |
| --- | --- |
| `.mts` / `.mjs` | always ESM |
| `.cts` / `.cjs` | always CommonJS |
| `.ts` / `.js` | whatever the nearest `package.json` `"type"` says |

This project sets `"type": "module"`, so a bare `.ts` is ESM.

`.d.cts` declares types for a `.cjs`. The pairing matters: a `.d.ts` next to a
`.cjs` is not consulted.

## `export =` and default imports

CommonJS modules that assign to `module.exports` are typed with `export =`:

```ts
declare const legacy: { ... };
export = legacy;
```

From an ES module under `nodenext`, that is reached with a **default import**:

```ts
import legacy from './legacy.cjs';        // works
import { shout } from './legacy.cjs';     // error — no named exports
```

Node can sometimes synthesise named exports from CJS by static analysis, but the
type system doesn't try, and relying on it is how a build breaks in production
and not in dev.

## `verbatimModuleSyntax` and `import type`

On in this project. Every import that exists only for types must say so:

```ts
import type { Greeter } from './greeter.ts';   // erased entirely
import { greet } from './greeter.ts';          // kept, and runs
```

The flag's name is the promise: imports are emitted **verbatim**, with no
compiler cleverness about eliding unused ones. That makes side-effect imports
predictable and makes the erasure boundary visible in the source — which is
exactly what a type stripper needs, since it cannot do whole-program analysis.

## What to build

Half of this Lesson is real imports from `fixtures/`, and half is a resolver
that models the rules.

| Export | What it does |
| --- | --- |
| `esmGreeting` / `cjsShout` | Real imports of both module kinds |
| `formatOf` | Decide a file's module format from its extension and `"type"` |
| `candidatesFor` | The specifiers a resolver would try, per mode |
| `resolveSpecifier` | Pick the first candidate that exists |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Change `'./fixtures/greeter.ts'` to `'./fixtures/greeter'` in your solution.
   Which light goes red, and what does the message tell you to write instead?
2. Import `{ shout }` from `legacy.cjs` as a named import. Read the error, then
   check whether Node would actually have managed it.
3. Delete `type` from an `import type` line. Does the runtime change? Does the
   emitted-code story change? What is `verbatimModuleSyntax` actually buying?
4. Under `bundler`, extensions are optional. What breaks if you ship that code
   to Node unbundled — and when would you find out?
