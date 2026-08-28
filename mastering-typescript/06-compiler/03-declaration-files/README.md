# 03 — Declaration files

A `.d.ts` is types with no implementation. It's how a compiled library ships its
API, how untyped JavaScript gets described from outside, and how you tell the
checker about things that exist at runtime but appear in no source file.

## Ambient declarations

`declare` says "this exists; emit nothing":

```ts
declare const BUILD_ID: string;      // injected by the bundler
declare function gtag(...args: unknown[]): void;   // added by a script tag
```

Everything under `declare` is erased. In a `.d.ts` file the keyword is implied.

## Script files versus module files

The rule that catches everyone:

> A file with a top-level `import` or `export` is a **module**. Everything else
> is a **script**, and its declarations are global.

That determines what `declare module 'x'` means:

```ts
// in a SCRIPT (no imports/exports): declares a NEW ambient module
declare module 'untyped-lib' { export function f(): void; }

// in a MODULE: AUGMENTS an existing one, which must already resolve
declare module './plugin-host.ts' { interface PluginRegistry { extra: number } }
```

Get the file kind wrong and you get `Invalid module name in augmentation,
module 'x' cannot be found` — which means "you wrote an augmentation and I
think you meant a declaration, but this file has imports so I can't."

## `declare global`

Inside a module, `declare global { }` reaches back out to global scope:

```ts
declare global {
  var FEATURE_FLAGS: Record<string, boolean>;
  interface AppContext { userId: string }
}
```

Two rules that trip people up:

- Use `var`, not `const` or `let`. Only `var` declarations become properties of
  the global object, and `globalThis.X` only typechecks for `var`.
- Interfaces merge; type aliases don't. `declare global { interface Window {...} }`
  works because `Window` is an interface. The same with a `type` is a
  duplicate-identifier error.

## Interface merging is the extension point

Two `interface` blocks with the same name in the same scope combine. That is the
entire mechanism behind:

- augmenting a library's options type from your own code,
- `declare global { namespace NodeJS { interface ProcessEnv { ... } } }`,
- every plugin system in the TypeScript ecosystem.

It only works for `interface`. This is the one situation where `interface` is
not merely a style preference.

## What to build

Everything here is type-level; the runtime half is a registry that the types
describe.

| Export | What it is |
| --- | --- |
| `declare global` block | A global `var` and a global interface |
| Module augmentation | Two new members on the fixture's `PluginRegistry` |
| `registerTyped` | A typed wrapper over the fixture's untyped `register` |
| `lookupTyped` | The typed read |
| `AppContext` | A global interface, merged from two places |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Remove every `import`/`export` from your solution and see the augmentation
   error change. What did the file just become?
2. Change `var` to `const` in the `declare global` block. Which access breaks —
   the bare name, or `globalThis.name`? Why only one?
3. Try to augment a `type` alias instead of an `interface`. What error, and what
   does it tell you about which one is reopenable?
4. Your augmentation adds members to `PluginRegistry` for *every* importer of
   that module, globally. When is that the right design, and when is it a
   landmine?
