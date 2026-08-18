# 06 — Side Effects and Tree Shaking

Why a bundler keeps code you never used, and what you can do about it.

## Tree shaking

Dead-code elimination across modules. Because ESM imports are static, a bundler
can see that `multiply` is never imported and drop it:

```js
import { add } from './math.js';   // multiply is never referenced
```

This only works with ESM. CommonJS `require` is a runtime call with a possibly
computed argument, so the bundler can't prove anything is unused.

## What blocks it

**Top-level side effects.** If evaluating a module *does something*, dropping it
changes behaviour, so the bundler must keep it:

```js
// analytics.js
window.analytics = new Analytics();    // a side effect
export const track = () => {};
```

Import only `track` and the whole file still ships, because the assignment might
matter.

Common offenders: registering globals, polyfills, CSS imports, `console.log` at
module scope, patching prototypes, starting timers.

**Import for effect.** `import './polyfill.js'` with no bindings is *entirely* a
side effect. That's legitimate and intentional — just be aware nothing can shake
it.

## `sideEffects: false`

The package.json flag that tells bundlers "every module here is safe to drop if
unused":

```json
{ "sideEffects": false }
```

Or, honestly, list the ones that aren't:

```json
{ "sideEffects": ["./src/polyfills.js", "*.css"] }
```

Lying here is a real footgun: mark a package side-effect-free when it isn't and
consumers get subtly broken builds where a registration silently vanished.

## Evaluation order

A module's dependencies evaluate depth-first, before its own body:

```js
import './order-a.js';   // a's body runs first
console.log('b');        // then this
```

Every module runs **exactly once**, however many importers it has. Since a
module's top-level code is effectively a constructor for a singleton, top-level
side effects are global state — which is the deeper reason to avoid them.

## Pure functions and purity annotations

A function is pure if it depends only on its arguments and changes nothing
outside itself. Pure functions are trivially shakeable, testable, cacheable.

Bundlers also honour `/*#__PURE__*/` before a call, promising the result can be
dropped if unused — necessary because a bundler can't otherwise prove a function
call does nothing:

```js
const instance = /*#__PURE__*/ createThing();
```

## What to build

| Export | What it does |
| --- | --- |
| `loadPure()` / `loadImpure()` | Show the difference in evaluation |
| `sideEffectLog()` | What the impure fixture recorded |
| `evaluationOrder()` | Depth-first, dependencies first |
| `isPure(fn, args)` | Detect observable global mutation |
| `shouldShake(module)` | Decide whether a module can be dropped |
| `parseSideEffects(pkg, file)` | Interpret the `sideEffects` field |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. `import './x.js'` with no bindings — is there any way a bundler could drop
   it? What would it have to prove?
2. Find a dependency in a real project with `sideEffects: false`. Is it true?
3. Why can't CommonJS be tree-shaken? Answer in terms of when the specifier is
   known.
