# 01 — Class members

Classes are the one place where TypeScript's checking is about *initialisation
order* rather than shapes. Everything here is about proving a field holds what
it claims by the time anyone can read it.

## `strictPropertyInitialization`

Part of `strict`. Every non-optional field must be definitely assigned by the
end of the constructor:

```ts
class User {
  name: string;          // error: has no initializer and is not assigned in the constructor
  email?: string;        // fine — optional
  role = 'user';         // fine — initialised
  constructor(name: string) { this.name = name; }   // fine — assigned
}
```

The checker only looks at the constructor body. Assigning in an `init()` method
called from the constructor doesn't count, because it can't prove the call
happens or that the method doesn't get overridden.

## The three escape hatches, in order of preference

```ts
class A {
  a!: string;                  // definite assignment assertion — "trust me"
  declare b: string;           // "this exists, emit nothing" — for base-class fields
  c: string | undefined;       // honest: it might not be there
}
```

`!` is an assertion and lies exactly as much as `as` does. Prefer the third
form, then `declare` when a base class or framework really does the assigning,
and reach for `!` last.

`declare` on a field is the one people don't know: it declares a *type* for a
field without emitting an initialisation, which is what you want when a
subclass narrows a base-class field's type. It's also fully erasable, unlike
the thing it replaces.

## No parameter properties here

The shorthand most TypeScript code uses:

```ts
class User { constructor(private name: string) {} }   // NOT AVAILABLE
```

emits runtime code, so `erasableSyntaxOnly` rejects it and Node can't strip it.
Write the field and the assignment out. It's three more lines and it's what the
shorthand compiles to anyway.

## Static members and static blocks

`static` fields belong to the constructor, not to instances. A `static` block
runs once, when the class is defined, and can see private members:

```ts
class Registry {
  static #instances = 0;
  static { Registry.#instances = 0; }
}
```

Static blocks are standard JavaScript and fully erasable, so they're available.

## `readonly` fields

Assignable in the constructor and nowhere else. Compile-time only — it does not
freeze anything, and `Object.assign` will walk straight through it.

## What to build

| Export | What it is |
| --- | --- |
| `Counter` | Fields, a static counter, a static block |
| `Config` | `readonly`, optional, and definite-assignment fields |
| `Temperature` | Accessors with validation, and a `readonly` unit |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Add `private name: string` as a constructor parameter to any class here. Read
   the tsc error, then run `node solution.ts` and read that one. Which is clearer?
2. Assign a `readonly` field from a method instead of the constructor. Then do
   it via `Object.assign`. Which one does the checker catch?
3. `declare x: string` versus `x!: string` — write both, look at what Node
   actually runs, and say when the difference matters.
4. A `static` block can read `#private` members. What could you build with that
   which a module-level `const` couldn't do as well?
