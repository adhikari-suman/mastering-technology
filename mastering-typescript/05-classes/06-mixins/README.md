# 06 — Mixins

Single inheritance runs out fast. A mixin is a function that takes a class and
returns a subclass with more in it, so behaviours compose instead of queueing up
in one chain.

```ts
const Timestamped = <T extends Ctor>(Base: T) =>
  class extends Base {
    createdAt = Date.now();
  };

class User extends Timestamped(Serialisable(Entity)) {}
```

## The constructor constraint

The base must be constructible, and the parameters have to be forwarded blind:

```ts
type Ctor<T = {}> = new (...args: any[]) => T;
```

That `any[]` is not a style choice. It is a **compiler requirement**, and it is
the one place this project's no-`any` rule is overruled by the language itself:

```
error TS2545: A mixin class must have a constructor with a single rest
              parameter of type 'any[]'.
```

Try `never[]` or `unknown[]` and you get that error on every mixin. The checker
has a special rule for mixin classes, and it names `any[]` specifically.

The reason is that `class extends Base` must produce a constructor compatible
with *whatever* `Base` takes, and it must be able to forward `super(...args)`.
Forwarding is a covariant use of the parameter list; `never[]` makes the
forwarding illegal, and `unknown[]` makes every argument an error at the call.

Worth sitting with, because it is rare: usually `any` is a decision you made.
Here it is the only spelling the compiler accepts, and the honest response is to
confine it to this one type alias rather than to pretend it isn't there.

## Return the class expression, don't annotate it

The one rule that makes mixins work:

```ts
function Timestamped<T extends Ctor>(Base: T) {
  return class extends Base { createdAt = Date.now(); };
}
```

No return annotation. The inferred type is an anonymous class carrying both
`Base`'s members and the new ones, and it is *not expressible by hand* — writing
`: T & Ctor<Timestamped>` loses the intersection's constructor. Annotate it and
you break composition.

The cost: an exported mixin needs a nameable type for `.d.ts` emit, which is why
you'll see `declaration: true` projects wrestling with mixins. Under `noEmit`
it's free.

## `InstanceType` for the result

To name what a mixin produces:

```ts
type Timestamped = InstanceType<ReturnType<typeof Timestamped>>;
```

Verbose and correct. `ReturnType` gets the class, `InstanceType` gets what `new`
gives you.

## Ordering matters

`A(B(Base))` and `B(A(Base))` produce different prototype chains. If two mixins
define the same member, the *outer* one wins — it's later in the chain. And a
mixin can call a method it doesn't define, if it declares an abstract-ish
constraint on `Base`.

## What to build

| Export | What it is |
| --- | --- |
| `Ctor` | The constructor constraint |
| `Timestamped` | Adds `createdAt` and `age()` |
| `Serialisable` | Adds `toJSON()` over the instance's own keys |
| `Countable` | Adds a per-class instance count via a static |
| `Entity` | The base |
| `User` | All three composed |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Annotate one mixin's return type by hand and watch composition break. What
   exactly did the annotation lose?
2. Swap the order of two mixins that both define `toJSON`. Which wins, and why
   is that the answer the prototype chain gives?
3. `Ctor` here uses `never[]`, so arguments can't be forwarded. Write the
   `any[]` version and describe precisely what you traded.
4. `Countable` keeps a count per class. What happens with `class A extends
   Countable(Base) {}` and `class B extends Countable(Base) {}` — one counter or
   two? Predict, then check.
