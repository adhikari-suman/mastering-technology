# 04 — The escape hatches

Five ways to overrule the checker. All of them are sometimes right. The skill is
picking the weakest one that does the job, because the weakest one is the one
that fails loudest when it stops being true.

## Ranked, weakest to strongest

| Hatch | Scope | Self-repairing? |
| --- | --- | --- |
| `@ts-expect-error` | one line | **yes** — errors when no longer needed |
| `!` | one expression, one fact | no |
| `as T` | one expression | no |
| `@ts-ignore` | one line, any error | no |
| `any` | everything it touches, transitively | no |

**Always prefer `@ts-expect-error` to `@ts-ignore`.** They do the same thing,
except `@ts-expect-error` becomes an error when the line stops failing. That
makes it the only self-repairing suppression in the language — a temporary
workaround that tells you when it can go.

## When each is right

**`@ts-expect-error`** — a known compiler limitation, a bug you've filed, or a
test asserting that something must not compile. Always with a comment saying
why, on the same line.

**`!`** — you have just checked, in a way the checker can't follow across a
boundary it doesn't trust. Usually replaceable by an assertion function, which
is checked at runtime for the same cost. Prefer that.

**`as T`** — a narrowing you can justify locally: building an accumulator
(Part 03), branding a validated value (Part 07 Lesson 03), bridging a mapped
type the checker can't prove. Keep the distance between the check and the
assertion to zero lines.

**`@ts-ignore`** — essentially never. It suppresses *whatever* error is on that
line, including a different one that appears later.

**`any`** — at a genuinely dynamic boundary where `unknown` costs more than it
buys, and only behind a facade. Almost always `unknown` is what you wanted.

## The test

For each one, ask: **if this becomes wrong, what happens?**

- `@ts-expect-error` → a compile error. Good.
- `as` on a validated value → nothing, but the validation is right there.
- `as` on a network response → a `TypeError` in production, three frames away.
- `any` → silence, spreading outward.

An escape hatch whose failure mode is silence needs a runtime check beside it.

## Counting them

The number that matters is not zero. A codebase with no assertions is either
tiny or has an `any` somewhere doing the work invisibly. What matters is that
each one is *deliberate, commented, and local* — and that you can list them.

## What to build

An auditor for the hatches — the thing a code review should do, made mechanical.

| Export | What it is |
| --- | --- |
| `Hatch` | The five |
| `SEVERITY` | Their ranking, weakest to strongest |
| `isSelfRepairing` | Only one of them is |
| `findHatches` | Scan source text and report every use, with line numbers |
| `audit` | Summarise a scan: counts, and whether anything is uncommented |
| `preferred` | Given a situation, the weakest hatch that does the job |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Run `findHatches` over your own Part 03 and Part 07 solutions. Is every one
   of them deliberate?
2. `@ts-expect-error` fails when unnecessary. Why has no other suppression
   copied that? What would `as`-with-expiry even mean?
3. `!` and an assertion function produce the same type. Write the case where the
   runtime difference saved you, and the case where it cost you.
4. Your `findHatches` is textual, so it sees `as` inside strings and comments.
   What would it take to do properly, and is the textual version good enough?
