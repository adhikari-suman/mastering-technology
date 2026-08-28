# 01 — Variance

If `Dog` is a `Animal`, when is `F<Dog>` an `F<Animal>`? The answer depends on
where `T` appears inside `F`, and there are exactly four possibilities.

| Variance | Meaning | Where `T` appears |
| --- | --- | --- |
| **Covariant** | `F<Dog>` → `F<Animal>` | output positions only |
| **Contravariant** | `F<Animal>` → `F<Dog>` | input positions only |
| **Invariant** | neither | both |
| **Bivariant** | both directions | (unsound; TypeScript does it anyway) |

## The rule, in one sentence

**Output positions are covariant; input positions are contravariant.** Everything
else follows.

```ts
type Producer<T> = () => T;            // covariant   — T is an output
type Consumer<T> = (value: T) => void; // contravariant — T is an input
type Box<T> = { value: T };            // invariant   — read AND write
type ReadonlyBox<T> = { readonly value: T };   // covariant — read only
```

Contravariance is the counter-intuitive one, so make it concrete: a function
that handles *any animal* can be used wherever a dog-handler is wanted, because
it copes with more. A dog-handler cannot stand in for an animal-handler, because
a cat might arrive.

## Function variance, precisely

```ts
type A = (x: Dog) => Dog;
type B = (x: Animal) => Animal;
```

Neither is assignable to the other: the parameter wants contravariance and the
return wants covariance, and they pull opposite ways. `(x: Animal) => Dog` is
assignable to both — widest input, narrowest output. That's the whole rule in
one line, and it's the shape you should aim for when designing a callback.

## The method exemption

Under `strictFunctionTypes`, function-typed **properties** are checked
contravariantly. **Methods** are exempt and stay bivariant:

```ts
interface WithMethod<T>   { handle(x: T): void }     // bivariant
interface WithProperty<T> { handle: (x: T) => void } // contravariant
```

You met this in Part 03 Lesson 03. The reason is `Array<T>`: `push`, `indexOf`,
`includes` and `concat` all take `T` as a parameter, so a contravariant reading
would make `Dog[]` unassignable to `Animal[]` and break most existing code.
Rather than special-case arrays, the language special-cases method syntax.

The practical rule: **write callbacks as properties** when you want the check,
and know that a method signature is a weaker promise than it looks.

## `in` and `out` annotations

Since TypeScript 4.7 you can state a type parameter's variance:

```ts
interface Producer<out T> { get(): T }
interface Consumer<in T> { set(value: T): void }
interface Box<in out T> { value: T }
```

They do two things: they *check* that the declaration really is that variant, so
an accidental invariance becomes an error at the declaration rather than a
confusing rejection at a use site; and they let the checker skip structural
comparison, which is a genuine performance win on large recursive types.

They're annotations, not coercions — `out T` on something that is used as an
input is an error.

## Where variance actually bites

Not usually on containers, which people expect. It bites on **callbacks and
event maps**:

```ts
type Handlers = { [K in keyof Events]: (event: Events[K]) => void };
```

Assigning a `Handlers` for a narrower event map into a wider one is the exact
situation contravariance governs, and it's why "why can't I pass my handler
here" is one of the most common questions about the language.

## What to build

| Export | What it is |
| --- | --- |
| `Producer<T>` / `Consumer<T>` / `Invariant<T>` | One of each |
| `Variance` | The four names |
| `varianceOf` | Model the rule over a description of where `T` appears |
| `WithMethod` / `WithProperty` | The exemption, side by side |
| `contramap` | Map the *input* of a consumer — the contravariant `map` |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Write `(x: Animal) => Dog` and check it against the four function types in
   this Lesson. Which does it satisfy, and why is that the useful shape?
2. Add `out` to a parameter used as an input. Read the error. Is that error
   better than the one you would have got at the use site?
3. `contramap` reverses the direction of composition. Draw the arrows for
   `contramap(consumer, fn)` and say which type flows where.
4. If methods were contravariant, name three things in `lib.es5.d.ts` that would
   stop typechecking. Was the exemption the right call?
