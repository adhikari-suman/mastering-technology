# 05 — Decorators

A decorator is a function that receives the thing being decorated and a context
object, and returns a replacement. That's all. The `@` is sugar for calling it.

```ts
class Calc {
  @logged
  add(a: number, b: number) { return a + b; }
}
```

is, roughly:

```ts
Calc.prototype.add = logged(Calc.prototype.add, { kind: 'method', name: 'add', ... });
```

## They do not run here, and that is not a version problem

**No released Node executes decorator syntax.** V8 carries a `--js-decorators`
flag marked *in progress*; on Node 26.8.1 it still cannot parse `@name`, in
plain JavaScript as well as after type stripping. `tsc` accepts decorators
happily, so this is purely a runtime gap.

So this Lesson does what the `@` does, by hand:

- You write the decorator **functions**, with their exact signatures. That is
  the part with all the type content.
- The runtime tests apply them by calling them, which is what `@` compiles to.
- `fixtures/decorated.ts` uses real `@` syntax and is type-checked by `tsc` but
  never loaded by Node, so you can see the syntax against your own decorators.

Applying one manually is a better mental model than the sugar anyway.

## The stage-3 shape

Every decorator has the signature `(value, context) => replacement`. What
`value` is depends on `context.kind`:

| Kind | `value` | Return |
| --- | --- | --- |
| `method` | the function | a replacement function |
| `field` | `undefined` | `(initial) => value` — an initialiser transformer |
| `getter` / `setter` | the accessor function | a replacement |
| `class` | the constructor | a replacement constructor |

The context carries `kind`, `name`, `static`, `private`, an `access` object for
reading the member off an instance, `addInitializer`, and `metadata`.

`addInitializer` is the interesting one: it registers a function to run when the
instance is constructed (or when the class is defined, for statics). It is how
`@bound` works — you can't bind at decoration time because there's no instance
yet, so you queue the binding.

## Typing one properly

The generic shape that preserves the method's signature:

```ts
function logged<This, Args extends unknown[], R>(
  target: (this: This, ...args: Args) => R,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => R>,
): (this: This, ...args: Args) => R
```

Three parameters, doing the Part 03 Lesson 06 job: `This` for the receiver,
`Args` as a tuple, `R` for the result. The context is generic in both `This` and
the method type, which is what lets `context.access.get(obj)` come back typed.

Get this wrong and the decorated method's signature silently becomes
`(...args: any[]) => any` at every call site.

## Legacy decorators are a different language

`experimentalDecorators` enables the 2015-era proposal — different signatures,
different semantics, `emitDecoratorMetadata`, and a hard dependency on the
compiler emitting helper code. It is not erasable, so this project cannot use
it, and new code should not.

## What to build

| Export | What it is |
| --- | --- |
| `logged` | A method decorator recording each call into a shared log |
| `bound` | A method decorator using `addInitializer` to bind the receiver |
| `clamped` | A field decorator transforming the initial value |
| `sealed` | A class decorator sealing the constructor and prototype |
| `CALLS` | The log `logged` writes to |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Open `fixtures/decorated.ts`. It typechecks and cannot run. Try
   `node fixtures/decorated.ts` and read the error — where in the pipeline does
   it fail, and what does that tell you about type stripping?
2. `bound` cannot bind at decoration time. Say precisely why, then say what
   `addInitializer` has that decoration time doesn't.
3. Type `logged` as `(target: Function, context: unknown) => Function` and see
   what happens to a decorated method's call sites.
4. A field decorator returns `(initial) => value`, not a value. Why an extra
   layer? What would break if it returned the value directly?
