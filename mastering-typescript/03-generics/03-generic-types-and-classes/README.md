# 03 — Generic types and classes

Generic *functions* infer their parameters per call. Generic *types* don't infer
anything — you write the argument, and it stays fixed for the life of the value.
That difference is where container variance comes from.

```ts
interface Box<T> { value: T }
class Stack<T> { private items: T[] = []; push(item: T): void { ... } }
```

## A mutable container cannot be covariant

Intuition says a `Stack<Dog>` should be usable as a `Stack<Animal>` — every dog
is an animal. Intuition is wrong, and the reason is one line:

```ts
declare const dogs: Stack<Dog>;
const animals: Stack<Animal> = dogs;   // if this were allowed...
animals.push(new Cat());               // ...you just put a cat in the dog stack
```

Anything you can *write* to makes the container invariant: safe to read as a
supertype, safe to write as a subtype, and those two pull in opposite
directions. A read-only container is fine — `ReadonlyArray<Dog>` really is a
`ReadonlyArray<Animal>`.

## ...but TypeScript lets you do it anyway, if you used a method

This is the surprise, and it is worth internalising early:

```ts
interface WithMethod<T> { push(item: T): void }      // BIVARIANT
interface WithProperty<T> { push: (item: T) => void } // CONTRAVARIANT
```

Under `strictFunctionTypes`, function-typed **properties** are checked
contravariantly in their parameters — correctly. **Method** declarations are
exempt and stay bivariant, because `Array<T>`, the DOM, and most of the
ecosystem would not typecheck otherwise.

So `Stack<Dog>` *is* assignable to `Stack<Animal>` when `push` is written as a
method, and is not when it's written as a property. Same runtime object, same
semantics, different soundness — decided by a syntax choice most people make by
habit. Part 08 Lesson 01 takes this apart properly.

## Classes are types and values

A class declaration introduces both: `Stack` names a value (the constructor) and
a type (an instance). `typeof Stack` is the constructor type; `Stack` alone is
the instance type. That's the Part 01 Lesson 01 two-namespace rule showing up
again, and it's why `InstanceType<typeof Stack>` is a thing.

## What to build

| Export | What it does |
| --- | --- |
| `Box<T>` | A read-only container — one that *can* be covariant |
| `Stack<T>` | A real one: push, pop, peek, size, isEmpty, toArray |
| `Pushable<T>` | `push` as a **method** — bivariant |
| `PushableProp<T>` | `push` as a **property** — contravariant |
| `mapBox` | Rebuild a `Box` through a function |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Write out, in one sentence each, why reading wants covariance and writing
   wants contravariance. Then say why having both forces invariance.
2. `Stack<T>`'s `toArray` returns `T[]`. Should it return `readonly T[]`? What
   does each choice let a caller do to your internal state?
3. Find a method in `lib.es5.d.ts` that would not typecheck if methods were
   contravariant. (`Array.prototype.push` is not the interesting one — look at
   `concat` or `indexOf`.)
4. `InstanceType<typeof Stack>` versus `Stack` — when do they differ?
