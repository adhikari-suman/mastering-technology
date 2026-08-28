# 01 — Conditional types

An `if` for types:

```ts
type IsString<T> = T extends string ? true : false;
type A = IsString<'x'>;    // true
type B = IsString<1>;      // false
```

`T extends U` here is **not** the constraint `extends`. It is a question:
"is `T` assignable to `U`?" Same keyword, two jobs, and the difference is
position — after a type parameter name it constrains, inside a type expression
it asks.

## What "assignable" means here

The check is ordinary assignability, so all of Part 01 applies:

```ts
type _1 = 'x' extends string ? 1 : 2;        // 1 — a literal is a string
type _2 = string extends 'x' ? 1 : 2;        // 2 — the reverse is not true
type _3 = never extends string ? 1 : 2;      // 1 — never is assignable to all
type _4 = any extends string ? 1 : 2;        // 1 | 2  (!!)
```

`any` produces *both* branches, unioned. It's assignable to `string` and also
not, so the checker gives up and returns the union. That is the only sane thing
it can do, and it is why `IsAny` has to be written the strange way it is —
Lesson 02 comes back to it.

## Nesting, and reading them

Chains read like a cascade:

```ts
type Kind<T> =
  T extends string ? 'string' :
  T extends number ? 'number' :
  T extends boolean ? 'boolean' :
  'other';
```

Format them one branch per line with the `:` at the end. A nested conditional
written on one line is unreadable within a week.

## The three utilities you'll build

Everything in `lib.es5.d.ts` that filters a union is a conditional type:

```ts
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
type NonNullable<T> = T & {};
```

`Exclude` looks like it returns `never` for matches — and it does, per union
member, which is why the matches vanish rather than becoming `never`. That
disappearing act is *distribution*, and it is Lesson 02's entire subject. For
now, take it as given and notice where it shows up.

`NonNullable` is the odd one out: modern TypeScript defines it with an
intersection rather than a conditional, because `T & {}` removes `null` and
`undefined` and leaves everything else alone. The conditional version
(`T extends null | undefined ? never : T`) also works and is easier to read.

## Constraints inside conditionals

The true branch knows the check passed, so you can use it:

```ts
type Length<T> = T extends { length: infer L } ? L : never;
```

`infer` is Lesson 03. Without it you can still narrow:

```ts
type Widen<T> = T extends string ? string : T extends number ? number : T;
```

## What to build

| Export | What it is |
| --- | --- |
| `MyExclude<T, U>` | The members of `T` not assignable to `U` |
| `MyExtract<T, U>` | The members that are |
| `MyNonNullable<T>` | `T` without `null` or `undefined` |
| `If<C, T, F>` | A conditional taking a boolean, for composing |
| `Kind<T>` | A cascade naming the kind of a type |
| `kindOf` | Its runtime twin, so both lights have something to say |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. `type A = any extends string ? 1 : 2` is `1 | 2`. Work out why that is the
   only defensible answer, then find where it would bite you in real code.
2. Write `MyNonNullable` both ways — conditional and `T & {}`. Find an input
   where they differ, or convince yourself there isn't one.
3. `Exclude<'a' | 'b', 'a'>` is `'b'`, but `Exclude<string, 'a'>` is `string`.
   Explain both, in terms of assignability rather than magic.
4. Does `T extends U ? X : Y` ever evaluate when `T` is still a type parameter?
   What does the checker do until it knows?
