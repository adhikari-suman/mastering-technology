# 05 — Exhaustiveness

A `switch` over a union either handles every member or it doesn't, and the
difference should be a compile error rather than a bug report. Getting that
error is a technique, not a flag.

## The `never` trick

`never` is assignable to everything, and nothing is assignable to `never`. So a
value that the checker believes is `never` can be passed anywhere — and a value
it believes is anything else cannot be passed to a `never` parameter:

```ts
function assertNever(value: never): never {
  throw new Error(`unhandled: ${JSON.stringify(value)}`);
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle': return Math.PI * shape.radius ** 2;
    case 'square': return shape.side ** 2;
    default: return assertNever(shape);   // `shape` is never here — if we covered it all
  }
}
```

Add `{ kind: 'rect' }` to `Shape` and the `default` branch now sees
`{ kind: 'rect'; ... }`, which is not assignable to `never`. The error lands on
`assertNever(shape)` — inside the function that needs updating, which is exactly
where you want it.

The `return` in front matters. `assertNever` returns `never`, so returning its
result satisfies the function's own return type without a redundant `throw`.

## Why `noImplicitReturns` is not enough

Without the `default` branch, a fully-covered switch already typechecks and
`noImplicitReturns` will complain if a member is missed — sometimes. It fails
you in two common cases: when the function returns `void`, and when the missing
branch is handled by a fallthrough you meant. `assertNever` is explicit and
works everywhere.

## `satisfies` for handler maps

The other shape this takes is a lookup table rather than a switch:

```ts
const HANDLERS = {
  circle: (s: Circle) => ...,
  square: (s: Square) => ...,
} satisfies Record<Shape['kind'], (s: never) => number>;
```

`satisfies Record<Kind, ...>` requires every key. Miss one and the error is on
the object literal. Add a key that isn't a `Kind` and the error is on that key.
And because it's `satisfies` rather than an annotation, the map keeps its exact
value types, so `HANDLERS.circle` is still the specific function.

This is the checked version of the pattern people reach for when a switch gets
long. Without `satisfies` it is strictly worse than the switch, because a
missing key is a runtime `undefined is not a function`.

## Exhaustiveness in other positions

The same idea works anywhere a `never` can be produced:

- `const x: Record<Kind, string> = { ... }` — a missing key is an error.
- `if / else if / else` chains, with `assertNever` in the final `else`.
- A mapped type over the union, which Part 04 will build.

## What to build

| Export | What it does |
| --- | --- |
| `Shape` | A three-member discriminated union |
| `assertNever` | The tool — takes `never`, throws at runtime |
| `area` | An exhaustive switch that fails to compile if `Shape` grows |
| `LABELS` | A `satisfies`-checked map from kind to label |
| `describe` | The map version of the same dispatch |
| `perimeter` | An `if`/`else if` chain closed the same way |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Add a fourth member to `Shape` in your solution and *don't* update anything
   else. Count the errors and note where each one lands. Now remove the
   `assertNever` call and count again.
2. `default: throw new Error('unreachable')` also compiles. What does it fail to
   give you that `assertNever` does?
3. Why does `satisfies Record<Kind, ...>` catch a missing key while
   `const HANDLERS: Record<Kind, ...> = {...}` catches it too — but the two
   differ in what `HANDLERS.circle` is afterwards? Which do you want?
4. `assertNever` stringifies the value it was handed. Why is that worth the
   effort, given it is a branch that "cannot happen"?
