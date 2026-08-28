# 06 — `any`, `unknown`, `never`, `void`

Four types that don't describe data. They describe the *checker's* relationship
to the data, and each one sits at a different corner of the assignability graph.

## The lattice

Assignability is a partial order with a top and a bottom:

```
                unknown          the top: everything is assignable TO it
               /   |   \
          string  number  ...    the ordinary types
               \   |   /
                 never           the bottom: it is assignable to everything
```

- **`unknown`** accepts anything, and lets you do nothing until you narrow it.
- **`never`** accepts nothing, and can be used as anything.
- **`any`** is not on the graph at all. It is assignable *both* ways, which is
  the same as switching the checker off for every value it touches.

## `unknown` is the honest `any`

Both accept any value. Only one keeps making you prove things:

```ts
function handle(x: unknown) {
  x.length;                              // error — prove it first
  if (typeof x === 'string') x.length;   // fine
}
```

Everything crossing a boundary — `JSON.parse`, a `fetch` body, a `catch`
parameter, `process.env` — is genuinely unknown, and typing it `any` is how a
wrong assumption travels three files before it throws. `unknown` makes the
assumption a statement you have to write down. Part 07 is built on this.

## `never` is the empty set

No value has type `never`, which has two consequences that look unrelated and
aren't:

**A function that never returns normally returns `never`:**

```ts
function fail(message: string): never { throw new Error(message); }
```

Annotating it matters — the checker then knows control flow stops there, so code
after a `fail()` call is correctly seen as unreachable.

**`never` is assignable to everything**, which makes it the tool for proving a
union has been fully handled:

```ts
function assertNever(value: never): never {
  throw new Error(`unexpected: ${JSON.stringify(value)}`);
}
```

Pass the leftover value in a `default` branch. If every case is covered, the
leftover is `never` and it compiles. Add a case to the union and forget the
branch, and the leftover is that new member — not assignable to `never`, so you
get an error at the exact place you needed one. Part 02 Lesson 05 builds a
curriculum's worth of technique on this one trick.

`never` also vanishes from unions: `string | never` is `string`. It is the
identity element for `|`, exactly as the empty set is for ∪.

## `void` is not `undefined`

`void` means "the return value is not meant to be used." It's weaker than
`undefined`, and the difference shows up in one specific, deliberate hole:

```ts
type Handler = () => void;
const h: Handler = () => 42;    // fine!
```

A function returning something is accepted where one returning nothing is
expected. That's unsound on paper and indispensable in practice — it's what lets
`arr.forEach(x => list.push(x))` compile, since `push` returns a number nobody
wanted. The rule is that *the caller* of a `void`-returning function may not use
the result, which is enforced:

```ts
const r = h();   // r is void — you can't do anything with it
```

`() => undefined` has no such hole and would reject `() => 42`.

## `any` and how it spreads

`any` isn't a value type, it's a suppression. Every expression touching it
becomes `any`, so one `any` at the top of a file can silently disable checking
for a whole call chain — and unlike a `@ts-expect-error`, nothing tells you when
it stops being necessary.

There are legitimate uses (Part 08 Lesson 04 catalogues them). The rule for now:
if you're reaching for `any` to make an error go away, you want `unknown` and a
narrowing step. If you're reaching for it because the type is genuinely
unrepresentable, write a comment saying so.

## What to build

| Export | What it is |
| --- | --- |
| `parseJson` | `JSON.parse`, typed honestly |
| `describeValue` | Turn an `unknown` into a string, by narrowing |
| `fail` | Throws; annotated so the checker knows control flow ends |
| `assertNever` | The exhaustiveness tool, used from Part 02 onwards |
| `runAll` | Takes `() => void` callbacks, and demonstrates why that's not `undefined` |
| `errorMessage` | The `catch` parameter is `unknown` — handle it properly |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Why is `unknown` assignable to nothing but `unknown` and `any`, while `never`
   is assignable to everything? State both in terms of sets of values.
2. Change `runAll`'s parameter to `Array<() => undefined>` and see which call
   sites break. Was the `void` hole doing you a favour?
3. `catch (e)` gives you `any` by default and `unknown` under
   `useUnknownInCatchVariables` (part of `strict`). What breaks when you turn it
   on, and why is that breakage the point?
4. `function f(): never {}` with an empty body — error or not? What about
   `while (true) {}`? Explain the difference in terms of what the checker can
   prove.
