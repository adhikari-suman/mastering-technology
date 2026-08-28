# 04 — `this` types

`this` in a type position is a real type — a *polymorphic* one that means
"whatever the actual class is at this point in the hierarchy". It's the thing
that makes fluent APIs survive being extended.

## The problem it solves

```ts
class Base {
  setName(n: string): Base { return this; }
}
class Child extends Base {
  setAge(a: number): Child { return this; }
}

new Child().setName('a').setAge(1);   // error — setName said it returns Base
```

Annotating `this` instead of `Base` fixes it, and needs no override:

```ts
class Base {
  setName(n: string): this { return this; }
}
new Child().setName('a').setAge(1);   // fine — `this` is Child here
```

`this` is implicitly a type parameter bounded by the class, resolved per
receiver. You get the covariance you wanted without writing `<Self extends Base>`
everywhere.

## `this` parameters

A fake first parameter that types the receiver and erases completely:

```ts
function describe(this: { name: string }): string { return this.name; }
```

Callers never pass it. It's how you type a standalone function meant to be
called with a particular receiver, and how you make an unbound method a type
error:

```ts
class A {
  m(this: A): void {}
}
const loose = new A().m;
loose();     // error: `this` would be undefined
```

`strictBindCallApply` (part of `strict`) then checks `bind`, `call` and `apply`
against it too.

## `this is T` — narrowing the receiver

A method can be a type predicate about its own receiver:

```ts
class Box<T> {
  #value: T | undefined;
  hasValue(): this is { getValue(): T } { return this.#value !== undefined; }
}

if (box.hasValue()) box.getValue();   // only reachable after the check
```

This is how optional-state classes avoid making every getter return
`T | undefined`. The claim is unchecked, exactly like any other predicate.

## Where `this` types bite

**Static members have their own `this`** — inside a static method, `this` is the
constructor, so `this` as a type means "this class's constructor type". Useful
for static factories that subclasses inherit correctly.

**`this` is not narrowed by `instanceof`** on itself in the way you might hope,
and a `this`-typed return makes a class harder to store in a variable of the
base type. If you find yourself fighting it, the API probably wanted a free
function.

## What to build

| Export | What it is |
| --- | --- |
| `QueryBuilder` / `SortedQueryBuilder` | A fluent chain that survives extension |
| `Maybe<T>` | `this is` narrowing, so `get()` is only reachable when it's safe |
| `describeNamed` | A standalone function with a `this` parameter |
| `Model` | A static factory returning `this`, inherited correctly |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Change `QueryBuilder`'s methods to return `QueryBuilder` instead of `this`.
   Which test stops compiling, and how many methods would you have to override
   to fix it the other way?
2. `Maybe#hasValue` returns `this is ...`. What stops it lying? Write the lying
   version and see which light catches it.
3. A static method returning `this` — what is `this` in `Model.create()` called
   on a subclass? Prove it.
4. `m(this: A)` makes an unbound method an error. Is that worth the friction?
   Find the bug it would have caught in code you've written.
