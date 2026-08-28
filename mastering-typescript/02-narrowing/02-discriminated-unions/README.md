# 02 — Discriminated unions

The highest-leverage pattern in TypeScript, and the one that turns the type
system from a spell-checker into a design tool.

A discriminated union is a union whose members all carry the same property, and
that property has a *literal* type in each member:

```ts
type RequestState =
  | { status: 'idle' }
  | { status: 'loading'; startedAt: number }
  | { status: 'success'; data: string }
  | { status: 'failure'; error: string };
```

Checking the discriminant narrows to exactly one member, so `data` is reachable
only where it exists:

```ts
if (state.status === 'success') state.data;   // string
```

## Why this beats the flags-and-optionals shape

The usual first draft looks like this:

```ts
type Bad = { loading: boolean; data?: string; error?: string };
```

It has 2 × 2 × 2 = eight states, of which four are nonsense — loading *and* an
error, data *and* an error, neither and not loading. Every consumer has to
either handle them or hope. The union has exactly four states and no way to
write a fifth.

That's the actual claim: **make illegal states unrepresentable.** You aren't
adding annotations to existing code; you're choosing a shape where the bad cases
can't be spelled.

## The rules

The discriminant must be a **literal type**, which means the union members need
`'idle'` and not `string`. Object literals widen by default, so a value built
without help won't fit — `as const`, or a constructor function with an
annotated return type, or contextual typing from a parameter.

The discriminant must be a **property**, not a computed thing. `state.status`
narrows; `getStatus(state)` does not, because the checker won't trust a function
to be pure.

Any number of properties can discriminate at once, and they can be booleans
(`{ ok: true; value: T } | { ok: false; error: E }`) or `null`
(`{ error: null; data: T } | { error: Error; data: null }`).

## Generic unions

The payload type can be a parameter, which is how `Result`, `Option` and every
async-state hook in the ecosystem are typed:

```ts
type RequestState<T> = { status: 'success'; data: T } | ...;
```

Narrowing still works through the generic — `state.data` is `T` inside the
`success` branch.

## What to build

| Export | What it does |
| --- | --- |
| `RequestState<T>` | The four-state union above, generic in its payload |
| `Event` | The events that drive it, also discriminated |
| `transition` | `(state, event) => state` — the reducer |
| `dataOf` | The payload if there is one, else `undefined` |
| `isSettled` | Whether the request has finished, either way |
| `summarize` | One line of human-readable status |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Write the eight states of the flags-and-optionals version out. Which four are
   nonsense, and what would each one mean if it reached your UI?
2. `transition` ignores events that don't apply to the current state. Should it
   throw instead? What does each choice cost you at the call site?
3. Replace `status: 'idle'` with `status: string` and see how many errors you
   get. Where do they appear relative to the change?
4. Could `RequestState<T>` be modelled with a class hierarchy instead? Write the
   `instanceof` version and say which you'd rather maintain, and why.
