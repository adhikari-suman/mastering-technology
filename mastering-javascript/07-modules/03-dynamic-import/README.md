# 03 — Dynamic `import()`

Static `import` is resolved before anything runs. `import()` is a function call
that happens whenever you like, and returns a promise for the namespace.

```js
const module = await import('./heavy.js');
module.default;    // the default export
module.named;      // named exports
```

## What it unlocks

**Lazy loading.** The module isn't fetched or evaluated until the call runs. A
route or feature nobody visits costs nothing:

```js
button.onclick = async () => {
  const { openEditor } = await import('./editor.js');
  openEditor();
};
```

This is what "code splitting" means — bundlers use `import()` as the seam where
one bundle becomes two.

**Computed specifiers.** Static imports need string literals; `import()` doesn't:

```js
const messages = await import(`./locales/${locale}.js`);
```

**Conditional loading.** Platform-specific implementations, optional
dependencies, dev-only tooling.

## Still cached

`import()` obeys the same singleton rule. Call it fifty times and the module
evaluates once; every call resolves to the same namespace object. So it's cheap
to call repeatedly — no need to memoize it yourself.

## Failures are rejections

A missing module, or one that throws while evaluating, rejects the promise.
`try/catch` around the `await` works normally — which makes `import()` the way
to attempt an optional dependency:

```js
let optional = null;
try { optional = await import('optional-thing'); } catch { }
```

Note the two failure modes: **resolution** failure (no such file) and
**evaluation** failure (the body threw). A module that throws while evaluating
also poisons the cache — later imports get the same rejection.

## Top-level `await`

ESM allows `await` at module top level, which pairs naturally:

```js
const config = await loadConfig();
export default config;
```

The cost: every module importing yours waits for it. Top-level await turns your
module into a synchronisation point for the whole graph below it.

## `import.meta`

Metadata about the current module. `import.meta.url` is universal;
`import.meta.resolve(specifier)` gives you the resolved URL without loading.

## What to build

| Export | What it does |
| --- | --- |
| `loadHeavy()` | Import on demand |
| `heavyLoadCount()` | Prove it evaluated exactly once |
| `loadLocale(locale)` | A computed specifier |
| `tryImport(specifier)` | Never throws — null when it fails |
| `importAll(specifiers)` | Load several in parallel |
| `lazy(specifier, name)` | A function that imports on first call |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. Import a module that throws on evaluation, twice. Does the second call
   re-run the body, or hand back the same rejection?
2. `import.meta.resolve('./x.js')` — does it check the file exists?
3. Your `lazy` caches the promise, not the module. Why is that the right thing
   to cache?
