# 05 — Project references

One `tsconfig.json` per package, wired together so the compiler knows the
dependency graph. It's what makes a monorepo build incrementally instead of
rechecking everything every time.

```jsonc
// packages/app/tsconfig.json
{
  "compilerOptions": { "composite": true, "outDir": "dist" },
  "references": [{ "path": "../core" }, { "path": "../ui" }]
}
```

## What `composite` buys and costs

A referenced project must set `composite: true`, which forces:

- `declaration: true` — it must emit `.d.ts`, since that's what dependents read
- `rootDir` defaults to the config's directory
- every input file must be listed by `include`/`files`

The payoff: `tsc --build` reads each dependency's emitted `.d.ts` and
`.tsbuildinfo` instead of its source. A change inside `core` that doesn't change
its public types doesn't re-check `app` at all.

The cost is the one people hit: **dependents see the emitted declarations, not
the source.** If `core` hasn't been built, `app` doesn't typecheck. `tsc --build`
handles that; a plain `tsc` does not.

## Build order is a topological sort

`tsc --build app` builds `core` and `ui` first, in dependency order, skipping
anything already up to date. That means:

- the graph must be **acyclic**. A cycle is an error, not a warning — unlike
  ES module cycles, which merely misbehave.
- a project depended on by two others is built once.
- order among independent projects is unspecified, so don't rely on it.

Implementing that sort is this Lesson's exercise, because writing it is the
fastest way to understand what `--build` is doing and why a cycle is fatal.

## `tsc --build` versus `tsc`

| | `tsc` | `tsc --build` |
| --- | --- | --- |
| Reads `references` | for path mapping only | as a build graph |
| Builds dependencies | no | yes, in order |
| Skips up-to-date work | no | yes, via `.tsbuildinfo` |
| Can `--clean` | no | yes |

Most "it works in my editor but not in CI" monorepo problems are a `tsc` where a
`tsc --build` was needed. The editor resolves through source; the CLI resolves
through emitted declarations.

## When you don't need this

If a bundler builds your app and `noEmit` is on, project references buy you much
less — you're not consuming `.d.ts` files, so the incremental win is smaller and
the `composite` constraints are pure cost. Reach for references when you
genuinely publish packages to each other.

## What to build

| Export | What it is |
| --- | --- |
| `Project` | A name plus the projects it references |
| `ReferenceCycleError` | Thrown, naming the cycle |
| `buildOrder` | The topological sort `tsc --build` performs |
| `dependenciesOf` | Everything a project needs, transitively |
| `affectedBy` | The reverse: what must rebuild when this changes |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Your `buildOrder` must be deterministic for the tests to pass. Which
   tie-breaking rule did you pick, and does `tsc` promise the same one?
2. `affectedBy` is `dependenciesOf` with the edges reversed. Why does a build
   system need both?
3. What would `buildOrder` have to do differently to build independent projects
   in parallel? What information does it currently throw away?
4. A cycle between projects is fatal, while a cycle between ES modules merely
   gives you a TDZ error at runtime. Why can the compiler be stricter here?
