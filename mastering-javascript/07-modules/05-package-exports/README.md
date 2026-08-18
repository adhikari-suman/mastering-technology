# 05 — Package Entry Points

How a bare specifier like `import x from 'my-lib'` becomes a file on disk, and
how a package controls what's reachable.

## The old way

```json
{ "main": "./index.js" }
```

One entry point, and **everything else in the package is importable too** —
`import internal from 'my-lib/src/secret-internals.js'` works whether you meant
it to or not. Every file is public API, so every refactor is a breaking change
for somebody.

## The `exports` field

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./utils": "./dist/utils.js",
    "./package.json": "./package.json"
  }
}
```

Two things change:

1. **Subpaths are remapped.** `my-lib/utils` resolves to `dist/utils.js` — the
   public name is decoupled from the file layout.
2. **Everything unlisted is blocked.** Anything not in `exports` is now
   genuinely private, and `import 'my-lib/dist/internal.js'` throws
   `ERR_PACKAGE_PATH_NOT_EXPORTED`.

That second point is the real feature: an actual public API boundary, enforced
by the runtime.

`exports` also **turns off extension guessing** for the package. `./utils` won't
silently find `utils.js` unless you said so.

## Conditional exports

The value can be an object keyed by **condition**, matched in order:

```json
{
  "exports": {
    ".": {
      "types": "./index.d.ts",
      "import": "./esm/index.js",
      "require": "./cjs/index.cjs",
      "default": "./esm/index.js"
    }
  }
}
```

Conditions include `import`, `require`, `node`, `browser`, `development`,
`production`, `default`. **Order matters** — the first match wins, so
`"default"` goes last and `"types"` goes first.

This is how one package serves ESM and CJS consumers from one name. It's also
how you get the "dual package hazard": load both builds and you have two copies
of the module, with separate state and failing `instanceof` checks.

## Wildcards

```json
{ "exports": { "./features/*": "./dist/features/*.js" } }
```

`my-lib/features/auth` → `dist/features/auth.js`. One rule, any number of
subpaths, still a closed set.

## `imports` and `#` specifiers

The mirror image, for a package's own internals:

```json
{ "imports": { "#config": "./src/config.js" } }
```

Then `import config from '#config'` works anywhere in the package, with no
`../../..` chains. Specifiers starting with `#` are always package-internal.

## What to build

You're implementing the resolution algorithm — the clearest way to learn it.

| Export | What it does |
| --- | --- |
| `resolveExport(pkg, subpath, conditions)` | The core resolver |
| `isExported(pkg, subpath)` | Is a subpath public? |
| `listPublicSubpaths(pkg)` | The package's public surface |
| `resolveInternal(pkg, specifier)` | `#`-prefixed internal imports |
| `matchWildcard(pattern, target, subpath)` | The `*` rule |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. What's the dual package hazard, concretely? Write the two-copies scenario
   where `instanceof` fails.
2. Why must `"default"` be the last condition? What happens if it isn't?
3. Look up a package you use with a complex `exports` map. Can you follow it?
