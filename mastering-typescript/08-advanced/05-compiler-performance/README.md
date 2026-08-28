# 05 — Compiler performance

A slow build is usually a slow *type*, not a big codebase. The checker is
memoised and lazy, so a handful of expressions can dominate everything else.

## Where the time goes

`tsc --extendedDiagnostics` gives the breakdown:

```
Files:                 1204
Types:               182043
Instantiations:     4821990        <- the number that matters
Check time:            9.31s
```

**Instantiations** is the count of times a generic type was expanded with
concrete arguments. It is the single best predictor of check time, and it grows
multiplicatively: a type instantiated inside another instantiated inside a third
costs the product, not the sum.

Under a few hundred thousand is comfortable. Millions means something specific
is wrong, and it is findable.

## The expensive shapes

**Deep conditional chains.** Each level is an instantiation, and a chain inside
a mapped type over a fifty-key object is fifty chains.

**Large unions in conditionals.** A distributive conditional over a 200-member
union runs 200 times. Two of them nested runs 40,000.

**Template literal cross products.** `` `${A}-${B}` `` with two 50-member unions
is 2,500 types, materialised.

**Recursive types without tail calls.** Part 04 Lesson 06 — the non-tail version
holds every level on the stack simultaneously.

**Deeply nested object literals checked against big types.** Excess property
checking walks the whole shape at every level.

## The fixes, in order of leverage

**1. Defer.** An unused type costs nothing. Types are computed on demand, so a
type alias that nothing references is free — the cost is at the *use* site.
Moving work out of a hot type and into the few places that need it is often a
10× win.

**2. Break the chain.** Introduce a named intermediate type. The checker
memoises by type identity, so a named alias used twice is computed once, while
the same expression written twice is computed twice.

**3. Narrow before distributing.** Filter a union down before running an
expensive conditional over it, not after.

**4. Annotate the boundary.** An explicit return type on an exported function
stops the checker inferring it — and stops every consumer re-deriving it. This
is why `declaration: true` projects are faster to *consume* even though they are
slower to build.

**5. `skipLibCheck`.** Not a real fix, but it removes `node_modules/**/*.d.ts`
from the work. Almost every project should have it on.

## Measuring, not guessing

```bash
tsc --noEmit --extendedDiagnostics      # the totals
tsc --noEmit --generateTrace ./trace    # a Chrome-trace, opened in perfetto
```

The trace names the file and the type. Guessing which type is slow is a reliable
way to spend an afternoon optimising the wrong one — Part 08's theme, really.

## What to build

An instantiation-cost model. Rough, but it captures the multiplicative structure
that makes real types explode.

| Export | What it is |
| --- | --- |
| `TypeNode` | A small type-expression language |
| `instantiations` | The cost of a node |
| `Diagnostics` | The shape `--extendedDiagnostics` reports |
| `verdict` | Comfortable, slow, or pathological |
| `hotspots` | The costliest sub-expressions, worst first |
| `memoised` | The saving a named alias buys |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Run `tsc --extendedDiagnostics` on this repo. What is the instantiation
   count, and which Part do you think dominates it?
2. `memoised` models naming a repeated sub-expression. Find a type in your Part
   04 solutions where that would help, and check the numbers.
3. Deferring means an unused type is free. What does that imply about where to
   put expensive types in a library you publish?
4. `skipLibCheck` skips checking `.d.ts` files. What class of bug does that let
   through, and why does nearly everyone accept the trade?
