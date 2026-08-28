# 03 — `implements` versus `extends`

`extends` inherits behaviour. `implements` checks a shape and inherits nothing.
In a structural type system the second one is stranger than it looks.

## `implements` is an assertion, not a contract

```ts
interface Serialisable { toJSON(): string }
class User implements Serialisable {
  toJSON() { return '{}'; }
}
```

The `implements` clause changes nothing about `User`'s type. Delete it and
`User` is still assignable to `Serialisable`, because structural typing doesn't
care how you got the shape. All it does is produce an error *here* rather than
at every call site, when you get the shape wrong.

Two consequences:

**It doesn't add inference.** A method's parameters are not contextually typed
from the interface, so this is an implicit-any error even with the clause
present:

```ts
class A implements Handler {
  handle(event) { }     // error: 'event' implicitly has an 'any' type
}
```

Annotate every parameter. People expect `implements` to fill them in; it does
not.

**It doesn't stop you adding more.** A class may implement several interfaces
and have members none of them mention.

Use it as a local assertion — "I intend this class to satisfy that" — and
nothing more.

## `abstract`

An `abstract` class cannot be constructed and may declare members without
bodies:

```ts
abstract class Shape {
  abstract area(): number;
  describe(): string { return `area ${this.area()}`; }
}
```

The base can call an abstract method it doesn't implement. That's the pattern
`implements` can't express, and it's the reason to reach for a class rather than
an interface: shared behaviour plus required overrides.

`abstract` is fully erasable — it vanishes, and the runtime `new` check comes
from the compile-time error, not from emitted code. So a cast really can
construct one.

## `noImplicitOverride`

On in this project. A method that overrides a base method must say so:

```ts
class Square extends Shape {
  override area(): number { return this.side ** 2; }
}
```

Without `override`, renaming the base method silently turns every override into
a new, never-called method. With it, the rename is an error in every subclass.
It's one of the highest-value flags in the language and it's off by default.

The reverse is also checked: `override` on a method that overrides nothing is an
error.

## Construct signatures

To type "a class", not "an instance":

```ts
type ShapeCtor = new (side: number) => Shape;
type AbstractCtor = abstract new (...args: never[]) => Shape;
```

An `abstract` class is not assignable to `new (...) => T`, because you can't
call `new` on it — which is what `abstract new` is for. Factories that accept a
class need this distinction, and it's the reason `InstanceType` has an
`abstract` variant in the wild.

## What to build

| Export | What it is |
| --- | --- |
| `Shape` | An abstract base with one abstract member and shared behaviour |
| `Square`, `Circle` | Concrete subclasses using `override` |
| `Describable` | An interface, implemented explicitly |
| `Registry` | A factory typed with a construct signature |
| `totalArea` | Ordinary work over the abstract type |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Delete the `implements Describable` clause from a class that satisfies it.
   What changes? Now break the shape and see where the error moves to.
2. Remove `override` from one method. Then rename the base method and count the
   errors you'd have got with the flag versus without.
3. Try `new Shape()`. Then `(Shape as unknown as new () => Shape)()`. What does
   the second one tell you about where `abstract` lives?
4. Why does `Registry` need `new (...) => T` rather than just `Function`? Write
   the version with `Function` and see what you can't do.
