# 05 — Async types

`Promise<T>` is a container, so everything Part 03 said about containers
applies — plus a few rules the language special-cases.

## `Awaited<T>` and recursive unwrapping

`await` unwraps as far as it can:

```ts
await Promise.resolve(Promise.resolve(1));    // 1, not Promise<number>
```

That recursion is why `Awaited<T>` exists rather than a one-level `T extends
Promise<infer U> ? U : T`. You built it in Part 04 Lesson 03.

`Promise<Promise<T>>` is a type you can *write* but never *have* — the
constructor flattens. That mismatch is a rare place where the type system
describes a state the runtime cannot reach.

## `async` functions always return a Promise

An `async` function annotated `: T` is an error unless `T` is a promise. The
return type describes the *outer* value:

```ts
async function f(): Promise<number> { return 1; }   // return 1, not Promise.resolve(1)
```

The body returns `number`; the signature says `Promise<number>`. That asymmetry
is baked in, and it's why `ReturnType<typeof f>` is `Promise<number>` and you
need `Awaited<ReturnType<typeof f>>` for what the caller actually gets.

## Promises are covariant, and unlike arrays, soundly so

`Promise<Dog>` is assignable to `Promise<Animal>`. So is `Array<Dog>` — but the
two are covariant for different reasons.

A promise is read-only. There is no `promise.push`, so nothing can put a `Cat`
where a `Dog` was expected, and the covariance is *sound*.

An array is not read-only, and TypeScript allows the assignment anyway:

```ts
const dogs: Dog[] = [];
const animals: Animal[] = dogs;   // allowed
animals.push(new Cat());          // and now dogs contains a Cat
```

That is a deliberate unsoundness, chosen because the alternative rejects an
enormous amount of correct code. Part 08 Lesson 02 collects the others.

## The `void` return hole, again

```ts
function onEach(items: string[], fn: (item: string) => void): void
onEach(items, async (item) => { await save(item); });   // compiles
```

`async (item) => ...` returns `Promise<void>`, which is assignable to `void` by
the rule from Part 01 Lesson 06. So the promise is created, nobody awaits it,
and errors inside become unhandled rejections. This is the single most common
async typing bug, and the type system permits it on purpose.

The fix is to type the callback `(item: string) => void | Promise<void>` and
actually await it, or to name the constraint you're relying on.

## Typed cancellation

`AbortSignal` is the standard shape, and the typing worth knowing is the *guard*
around it:

```ts
type Cancellable<T> = (signal: AbortSignal) => Promise<T>;
```

Threading the signal through the signature means "this can be cancelled" is
checked rather than documented. A function that takes one and ignores it is a
lie the types can't catch — but a function that *doesn't* take one can't be
cancelled, and that the types do catch.

## Narrowing does not survive `await`

```ts
if (cache.value !== undefined) {
  await something();
  cache.value.length;     // still narrowed, and possibly wrong
}
```

The property-narrowing unsoundness from Part 02 Lesson 06, with a much wider
window: anything at all can run during the `await`. Same rule, far more likely
to bite. Re-read after awaiting.

## What to build

| Export | What it is |
| --- | --- |
| `Cancellable<T>` | A function taking a signal |
| `withTimeout` | Reject after `ms`, cancelling the work |
| `mapAsync` | Sequential mapping, awaiting each |
| `forEachAsync` | The callback typed so the `void` hole is closed |
| `settle` | Every result, successes and failures, as a Result |
| `retry` | With a cancellation check between attempts |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Type `forEachAsync`'s callback as `(item: T) => void` and pass an `async`
   function. It compiles. Write the test that proves the bug.
2. `Promise<Dog>` is assignable to `Promise<Animal>`; `Array<Dog>` is not
   assignable to `Array<Animal>`. Both are containers. What's the difference?
3. `withTimeout` must not leave a timer running when the work wins. Where does
   the cleanup go, and what happens if you forget?
4. `retry` validates `attempts` and cannot report that synchronously. Rewrite it
   as a non-`async` function returning a promise so it can. Is that better?
5. After `await`, a narrowing established before it still holds according to the
   checker. Construct the case where that is wrong.
